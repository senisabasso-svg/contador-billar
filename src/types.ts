export type PlayerId = 'white' | 'yellow'

export const TABLE_PRICES = [60, 80, 100, 150, 300, 500] as const
export const SHOT_CLOCK_SECONDS = 40
export const SHOT_CLOCK_PRESETS = [20, 30, 40, 50, 60] as const
export const SHOT_CLOCK_WARNING_SECONDS = 20
export const POINTS_PER_SET_PRESETS = [25, 40, 50, 60, 80, 100] as const
export const SETS_TO_WIN_PRESETS = [1, 2, 3] as const

export interface PlayerState {
  name: string
  score: number
  sets: number
  /** Cada anotación (positiva o negativa) del set actual */
  plays: number[]
  maxSeries: number
  lastPlay: number | null
}

export interface MatchConfig {
  whiteName: string
  yellowName: string
  tablePrice: number
  shotClock: number
  /** Puntos necesarios para poder cerrar un set */
  pointsPerSet: number
  /** Sets necesarios para ganar la partida */
  setsToWin: number
  starter: PlayerId
}

export interface MatchSnapshot {
  white: PlayerState
  yellow: PlayerState
  activePlayer: PlayerId
  entrada: number
  setNumber: number
  finished: boolean
  winner: PlayerId | null
  /** Ganador del último set cerrado (para aviso breve) */
  lastSetWinner: PlayerId | null
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
  | { type: 'CLOSE_SET' }
  | { type: 'DISMISS_SET_BANNER' }
  | { type: 'UNDO' }
  | { type: 'FINISH' }
  | { type: 'RENAME'; player: PlayerId; name: string }
