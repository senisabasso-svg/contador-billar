export type PlayerId = 'white' | 'yellow'

export interface PlayerState {
  name: string
  score: number
  sets: number
  innings: number[]
  maxSeries: number
  lastInning: number | null
}

export interface MatchConfig {
  whiteName: string
  yellowName: string
  targetScore: number
  starter: PlayerId
}

export interface MatchSnapshot {
  white: PlayerState
  yellow: PlayerState
  activePlayer: PlayerId
  entrada: number
  inputBuffer: string
  finished: boolean
  winner: PlayerId | null
  config: MatchConfig
}

export type MatchAction =
  | { type: 'DIGIT'; digit: string }
  | { type: 'CLEAR' }
  | { type: 'BACKSPACE' }
  | { type: 'ADJUST'; delta: number }
  | { type: 'END_TURN' }
  | { type: 'UNDO' }
  | { type: 'ADD_SET'; player: PlayerId }
  | { type: 'FINISH' }
  | { type: 'RENAME'; player: PlayerId; name: string }
