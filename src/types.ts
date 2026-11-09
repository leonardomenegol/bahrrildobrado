// Positions in British Parliamentary debate
export type Position =
  | 'PM'   // Prime Minister (1st Gov - Ponta)
  | 'LO'   // Leader of Opposition (1st Opp - Ponta)
  | 'MG'   // Member of Government (2nd Gov - Ponta)
  | 'MO'   // Member of Opposition (2nd Opp - Ponta)
  | 'DPM'  // Deputy Prime Minister (1st Gov - Meio)
  | 'DLO'  // Deputy Leader of Opposition (1st Opp - Meio)
  | 'GW'   // Government Whip (2nd Gov - Meio)
  | 'OW'   // Opposition Whip (2nd Opp - Meio)
  | 'ANY'  // Tanto faz

export const PONTA_POSITIONS: Position[] = ['PM', 'LO', 'MG', 'MO']
export const MEIO_POSITIONS: Position[] = ['DPM', 'DLO', 'GW', 'OW']

export const POSITION_LABELS: Record<Position, string> = {
  PM: 'Primeiro Governo (PM)',
  LO: 'Primeira Oposição (LO)',
  MG: 'Segundo Governo (MG)',
  MO: 'Segunda Oposição (MO)',
  DPM: 'Adjunto de Governo (DPM)',
  DLO: 'Adjunto de Oposição (DLO)',
  GW: 'Whip de Governo (GW)',
  OW: 'Whip de Oposição (OW)',
  ANY: 'Tanto faz',
}

export const POSITION_SHORT: Record<Position, string> = {
  PM: 'PM',
  LO: 'LO',
  MG: 'MG',
  MO: 'MO',
  DPM: 'DPM',
  DLO: 'DLO',
  GW: 'GW',
  OW: 'OW',
  ANY: 'Qualquer',
}

export interface Profile {
  id: string
  user_id: string
  name: string
  display_name: string
  society: string
  whatsapp: string
  photo_url: string | null
  bio: string | null
  positions: Position[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Swipe {
  id: string
  swiper_id: string
  target_id: string
  decision: 'like' | 'pass'
  created_at: string
}

export interface Match {
  id: string
  user_1_id: string
  user_2_id: string
  created_at: string
}

export interface MatchWithProfile extends Match {
  profile: Profile
}

export interface SwipeDecision {
  direction: 'left' | 'right'
}

export type AuthUser = {
  id: string
  email: string | undefined
}

export const SOCIETIES = [
  'GDO',
  'SDS',
  'Independente',
  'Senatus',
  'SDP',
  'UFRJ',
  'Ágora',
  'Octógono',
  'UFC',
  'GEDE',
  'UFSC',
  'SdD UNIFOR',
  'SDDTB',
  'Hermenêutica',
] as const

export type Society = typeof SOCIETIES[number]
