// Positions in British Parliamentary debate
export type Position =
  | 'PM'   // Primeiro Ministro    — Ponta, Primeiras falas
  | 'LO'   // Líder da Oposição    — Ponta, Primeiras falas
  | 'MG'   // Extensão de Governo  — Meio,  Primeiras falas
  | 'MO'   // Extensão de Oposição — Meio,  Primeiras falas
  | 'DPM'  // Adjunto de Governo   — Meio,  Segundas falas
  | 'DLO'  // Adjunto de Oposição  — Meio,  Segundas falas
  | 'GW'   // Whip de Governo      — Ponta, Segundas falas
  | 'OW'   // Whip de Oposição     — Ponta, Segundas falas
  | 'ANY'  // Tanto faz

// Papel na bancada: Ponta (abre o caso) vs Meio (fecha o caso)
export const PONTA_POSITIONS: Position[] = ['PM', 'LO', 'GW', 'OW']
export const MEIO_POSITIONS:  Position[] = ['MG', 'MO', 'DPM', 'DLO']

// Fala: Primeiras (1ª bancada) vs Segundas (2ª bancada)
export const PRIMEIRAS_FALAS: Position[] = ['PM', 'LO', 'MG', 'MO']
export const SEGUNDAS_FALAS:  Position[] = ['DPM', 'DLO', 'GW', 'OW']

// Derive display labels from selected positions
export function getPositionGroups(positions: Position[]): string[] {
  if (!positions || positions.length === 0) return []
  if (positions.includes('ANY')) return ['Tanto faz']

  const hasPonta    = positions.some(p => PONTA_POSITIONS.includes(p))
  const hasMeio     = positions.some(p => MEIO_POSITIONS.includes(p))
  const hasPrimeira = positions.some(p => PRIMEIRAS_FALAS.includes(p))
  const hasSegunda  = positions.some(p => SEGUNDAS_FALAS.includes(p))

  // Dimensão 1: Ponta/Meio
  let papel = ''
  if (hasPonta && hasMeio)   papel = 'Pontas e Meios'
  else if (hasPonta)         papel = 'Pontas'
  else if (hasMeio)          papel = 'Meios'

  // Dimensão 2: Primeira/Segunda fala
  let fala = ''
  if (hasPrimeira && hasSegunda) fala = 'Primeiras e Segundas'
  else if (hasPrimeira)          fala = 'Primeiras'
  else if (hasSegunda)           fala = 'Segundas'

  // Combina as duas dimensões quando ambas são informativas
  if (papel && fala) return [`${papel} · ${fala}`]
  if (papel)         return [papel]
  if (fala)          return [fala]
  return ['Variadas']
}

export const POSITION_LABELS: Record<Position, string> = {
  PM:  'Primeiro Ministro (PM)',
  LO:  'Líder da Oposição (LO)',
  MG:  'Extensão de Governo (MG)',
  MO:  'Extensão de Oposição (MO)',
  DPM: 'Adjunto de Governo (DPM)',
  DLO: 'Adjunto de Oposição (DLO)',
  GW:  'Whip de Governo (GW)',
  OW:  'Whip de Oposição (OW)',
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
