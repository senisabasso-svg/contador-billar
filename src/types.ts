export type PlayerId = 'white' | 'yellow'

export const POINT_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const
export const TABLE_PRICES = [60, 80, 100, 150, 300, 500] as const
export const SHOT_CLOCK_SECONDS = 40
export const SHOT_CLOCK_WARNING_SECONDS = 20

export interface PlayerState {
  name: string
  score: number
  sets: number
  /** Cada anotación (positiva o negativa) */
  plays: number[]
  maxSeries: number
  lastPlay: number | null
}

export interface MatchConfig {
  whiteName: string
  yellowName: string
  tablePrice: number
  shotClock: number
  starter: PlayerId
}

export interface MatchSnapshot {
  white: PlayerState
  yellow: PlayerState
  activePlayer: PlayerId
  entrada: number
  finished: boolean
  winner: PlayerId | null
  voladaMala: boolean
  turnKey: number
  config: MatchConfig
}

export type MatchAction =
  | { type: 'ADD_POINTS'; points: number }
  | { type: 'END_TURN' }
  | { type: 'VOLADA_MALA' }
  | { type: 'CLEAR_VOLADA_MALA' }
  | { type: 'UNDO' }
  | { type: 'FINISH' }
  | { type: 'RENAME'; player: PlayerId; name: string }
