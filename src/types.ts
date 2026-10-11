export type PlayerId = 'white' | 'yellow'

export const TABLE_PRICES = [60, 80, 100, 150, 300, 500] as const
export const SHOT_CLOCK_SECONDS = 40
export const SHOT_CLOCK_PRESETS = [20, 30, 40, 50, 60] as const
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
  | { type: 'COMMIT_AND_END_TURN'; points: number | null }
  | { type: 'VOLADA_MALA' }
  | { type: 'CLEAR_VOLADA_MALA' }
  | { type: 'SET_SHOT_CLOCK'; seconds: number }
  | { type: 'UNDO' }
  | { type: 'FINISH' }
  | { type: 'RENAME'; player: PlayerId; name: string }
