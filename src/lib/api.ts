import { supabase } from './supabase'
import type { Position, Profile, MatchWithProfile } from '../types'
import { PONTA_POSITIONS, MEIO_POSITIONS } from '../types'

// Determine if two societies allow mutual visibility
// Same society → blocked, except when either is 'Independente'
export function areSocietiesCompatible(mySociety: string, theirSociety: string): boolean {
  if (mySociety === 'Independente' || theirSociety === 'Independente') return true
  return mySociety !== theirSociety
}

// Determine if two position sets are compatible
export function areCompatible(myPositions: Position[], theirPositions: Position[]): boolean {
  const myHasAny = myPositions.includes('ANY')
  const theirHasAny = theirPositions.includes('ANY')

  if (myHasAny || theirHasAny) return true

  const myHasPonta = myPositions.some(p => PONTA_POSITIONS.includes(p))
  const myHasMeio = myPositions.some(p => MEIO_POSITIONS.includes(p))
  const theirHasPonta = theirPositions.some(p => PONTA_POSITIONS.includes(p))
  const theirHasMeio = theirPositions.some(p => MEIO_POSITIONS.includes(p))

  // I want Ponta → they need Meio
  // I want Meio → they need Ponta
  // I want both → they can be either
  if (myHasPonta && !myHasMeio) return theirHasMeio
  if (myHasMeio && !myHasPonta) return theirHasPonta
  if (myHasPonta && myHasMeio) return theirHasPonta || theirHasMeio

  return false
}

export async function getDiscoverProfiles(userId: string): Promise<Profile[]> {
  // Get my profile first
  const { data: myProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError || !myProfile) return []

  // Get all profiles I've already swiped
  const { data: swipes } = await supabase
    .from('swipes')
    .select('target_id')
    .eq('swiper_id', myProfile.id)

  const swipedIds = swipes?.map(s => s.target_id) ?? []

  // Get my matches
  const { data: matches } = await supabase
    .from('matches')
    .select('user_1_id, user_2_id')
    .or(`user_1_id.eq.${myProfile.id},user_2_id.eq.${myProfile.id}`)

  const matchedIds = matches?.flatMap(m =>
    m.user_1_id === myProfile.id ? [m.user_2_id] : [m.user_1_id]
  ) ?? []

  const excludeIds = [...new Set([...swipedIds, ...matchedIds, myProfile.id])]

  // Fetch all other active profiles
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .neq('user_id', userId)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data: candidates } = await query

  if (!candidates) return []

  // Filter by position and society compatibility
  return candidates.filter(p =>
    areCompatible(myProfile.positions, p.positions) &&
    areSocietiesCompatible(myProfile.society, p.society)
  )
}

export async function recordSwipe(
  swiperId: string,
  targetId: string,
  decision: 'like' | 'pass'
): Promise<{ matched: boolean; matchId?: string }> {
  // Insert swipe (ignore duplicate)
  const { error: swipeError } = await supabase
    .from('swipes')
    .upsert(
      { swiper_id: swiperId, target_id: targetId, decision },
      { onConflict: 'swiper_id,target_id' }
    )

  if (swipeError) throw swipeError

  if (decision === 'pass') return { matched: false }

  // Check if target liked me back
  const { data: reverseSwipe } = await supabase
    .from('swipes')
    .select('id')
    .eq('swiper_id', targetId)
    .eq('target_id', swiperId)
    .eq('decision', 'like')
    .maybeSingle()

  if (!reverseSwipe) return { matched: false }

  // Create match (or return existing)
  const [user1, user2] = [swiperId, targetId].sort()
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .upsert(
      { user_1_id: user1, user_2_id: user2 },
      { onConflict: 'user_1_id,user_2_id' }
    )
    .select()
    .single()

  if (matchError) throw matchError

  return { matched: true, matchId: match?.id }
}

export async function getMatches(profileId: string): Promise<MatchWithProfile[]> {
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      profile_1:profiles!matches_user_1_id_fkey(*),
      profile_2:profiles!matches_user_2_id_fkey(*)
    `)
    .or(`user_1_id.eq.${profileId},user_2_id.eq.${profileId}`)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (matches ?? [])
    .map(m => ({
      ...m,
      profile: m.user_1_id === profileId ? m.profile_2 : m.profile_1,
    }))
    .filter(m => m.profile && m.profile.is_active)
}

export function formatWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

export function buildWhatsAppLink(whatsapp: string, _myName: string): string {
  const number = formatWhatsApp(whatsapp)
  const message = encodeURIComponent(
    `Oi! A gente deu match no Tinder de Duplas do campeonato! Bora formar uma dupla? 💚`
  )
  return `https://wa.me/${number}?text=${message}`
}
