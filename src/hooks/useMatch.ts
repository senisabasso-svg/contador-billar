import { useCallback, useReducer } from 'react'
import type { MatchAction, MatchConfig, MatchSnapshot, PlayerId, PlayerState } from '../types'

const MAX_BUFFER = 3

function createPlayer(name: string): PlayerState {
  return {
    name,
    score: 0,
    sets: 0,
    innings: [],
    maxSeries: 0,
    lastInning: null,
  }
}

export function createMatch(config: MatchConfig): MatchSnapshot {
  return {
    white: createPlayer(config.whiteName.trim() || 'Jugador Blanco'),
    yellow: createPlayer(config.yellowName.trim() || 'Jugador Amarillo'),
    activePlayer: config.starter,
    entrada: 1,
    inputBuffer: '',
    finished: false,
    winner: null,
    config: {
      ...config,
      whiteName: config.whiteName.trim() || 'Jugador Blanco',
      yellowName: config.yellowName.trim() || 'Jugador Amarillo',
      targetScore: Math.max(1, config.targetScore),
    },
  }
}

function otherPlayer(player: PlayerId): PlayerId {
  return player === 'white' ? 'yellow' : 'white'
}

function parseBuffer(buffer: string): number {
  if (!buffer) return 0
  const value = Number.parseInt(buffer, 10)
  return Number.isFinite(value) ? value : 0
}

function average(player: PlayerState): string {
  if (player.innings.length === 0) return '0.000'
  const avg = player.score / player.innings.length
  return avg.toFixed(3)
}

function checkWinner(
  white: PlayerState,
  yellow: PlayerState,
  target: number,
): PlayerId | null {
  if (white.score >= target && yellow.score >= target) {
    return white.score >= yellow.score ? 'white' : 'yellow'
  }
  if (white.score >= target) return 'white'
  if (yellow.score >= target) return 'yellow'
  return null
}

function endTurn(state: MatchSnapshot): MatchSnapshot {
  if (state.finished) return state

  const points = parseBuffer(state.inputBuffer)
  const active = state.activePlayer
  const player = { ...state[active] }
  const nextScore = player.score + points

  player.score = nextScore
  player.innings = [...player.innings, points]
  player.lastInning = points
  player.maxSeries = Math.max(player.maxSeries, points)

  const next: MatchSnapshot = {
    ...state,
    [active]: player,
    inputBuffer: '',
    activePlayer: otherPlayer(active),
  }

  // Si el que acaba de jugar ya tenía la misma cantidad de entradas que el rival,
  // ambos cerraron la entrada actual → avanzar contador.
  const justPlayed = next[active]
  const opponent = next[otherPlayer(active)]
  if (justPlayed.innings.length > opponent.innings.length) {
    // El primero de la pareja de esa entrada: se queda en la misma entrada
  } else if (justPlayed.innings.length === opponent.innings.length) {
    next.entrada = state.entrada + 1
  }

  const winner = checkWinner(next.white, next.yellow, state.config.targetScore)
  if (winner) {
    next.finished = true
    next.winner = winner
    next[winner] = {
      ...next[winner],
      sets: next[winner].sets + 1,
    }
  }

  return next
}

function matchReducer(state: MatchSnapshot, action: MatchAction): MatchSnapshot {
  switch (action.type) {
    case 'DIGIT': {
      if (state.finished) return state
      if (state.inputBuffer.length >= MAX_BUFFER) return state
      if (state.inputBuffer === '0') {
        return { ...state, inputBuffer: action.digit }
      }
      return { ...state, inputBuffer: state.inputBuffer + action.digit }
    }
    case 'CLEAR':
      return { ...state, inputBuffer: '' }
    case 'BACKSPACE':
      return { ...state, inputBuffer: state.inputBuffer.slice(0, -1) }
    case 'ADJUST': {
      if (state.finished) return state
      const current = parseBuffer(state.inputBuffer)
      const next = Math.max(0, Math.min(999, current + action.delta))
      return { ...state, inputBuffer: String(next) }
    }
    case 'END_TURN':
      return endTurn(state)
    case 'ADD_SET': {
      if (state.finished) return state
      return {
        ...state,
        [action.player]: {
          ...state[action.player],
          sets: state[action.player].sets + 1,
        },
      }
    }
    case 'FINISH': {
      if (state.finished) return state
      let winner = state.winner
      if (!winner) {
        if (state.white.score > state.yellow.score) winner = 'white'
        else if (state.yellow.score > state.white.score) winner = 'yellow'
      }
      return { ...state, finished: true, winner }
    }
    case 'RENAME':
      return {
        ...state,
        [action.player]: {
          ...state[action.player],
          name: action.name.trim() || state[action.player].name,
        },
      }
    case 'UNDO':
      // Handled outside with history stack
      return state
    default:
      return state
  }
}

type HistoryAction =
  | { type: 'PUSH'; state: MatchSnapshot }
  | { type: 'REPLACE'; state: MatchSnapshot }
  | { type: 'POP' }
  | { type: 'RESET'; state: MatchSnapshot }

export function useMatch(initialConfig: MatchConfig) {
  const [history, setHistory] = useReducer(
    (stack: MatchSnapshot[], action: HistoryAction) => {
      if (action.type === 'RESET') return [action.state]
      if (action.type === 'POP') return stack.length > 1 ? stack.slice(0, -1) : stack
      if (action.type === 'REPLACE') {
        if (stack.length === 0) return [action.state]
        return [...stack.slice(0, -1), action.state]
      }
      return [...stack, action.state].slice(-200)
    },
    [createMatch(initialConfig)],
  )

  const state = history[history.length - 1]

  const dispatch = useCallback(
    (action: MatchAction) => {
      if (action.type === 'UNDO') {
        setHistory({ type: 'POP' })
        return
      }

      const next = matchReducer(state, action)
      if (next === state) return

      // Solo las acciones que cierran entrada / partida entran al undo.
      // Digitos, clear y renombres solo actualizan el estado actual.
      const commitAction =
        action.type === 'END_TURN' || action.type === 'FINISH' || action.type === 'ADD_SET'

      setHistory({
        type: commitAction ? 'PUSH' : 'REPLACE',
        state: next,
      })
    },
    [state],
  )

  const reset = useCallback((config: MatchConfig) => {
    setHistory({ type: 'RESET', state: createMatch(config) })
  }, [])

  return {
    state,
    dispatch,
    reset,
    canUndo: history.length > 1,
    average,
    currentRun: parseBuffer(state.inputBuffer),
  }
}

export type UseMatchReturn = ReturnType<typeof useMatch>
