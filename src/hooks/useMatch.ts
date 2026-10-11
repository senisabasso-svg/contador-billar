import { useCallback, useReducer } from 'react'
import type { MatchAction, MatchConfig, MatchSnapshot, PlayerId, PlayerState } from '../types'
import { SHOT_CLOCK_SECONDS } from '../types'

function createPlayer(name: string): PlayerState {
  return {
    name,
    score: 0,
    sets: 0,
    plays: [],
    maxSeries: 0,
    lastPlay: null,
  }
}

function resetPlayerForNewSet(player: PlayerState): PlayerState {
  return {
    ...player,
    score: 0,
    plays: [],
    maxSeries: 0,
    lastPlay: null,
  }
}

export function createMatch(config: MatchConfig): MatchSnapshot {
  const shotClock = Math.max(5, config.shotClock || SHOT_CLOCK_SECONDS)
  const pointsPerSet = Math.max(1, config.pointsPerSet || 50)
  const setsToWin = Math.max(1, config.setsToWin || 1)

  return {
    white: createPlayer(config.whiteName.trim() || 'Jugador Blanco'),
    yellow: createPlayer(config.yellowName.trim() || 'Jugador Amarillo'),
    activePlayer: config.starter,
    entrada: 1,
    setNumber: 1,
    finished: false,
    winner: null,
    lastSetWinner: null,
    voladaMala: false,
    turnKey: 0,
    config: {
      ...config,
      whiteName: config.whiteName.trim() || 'Jugador Blanco',
      yellowName: config.yellowName.trim() || 'Jugador Amarillo',
      tablePrice: config.tablePrice,
      shotClock,
      pointsPerSet,
      setsToWin,
    },
  }
}

function otherPlayer(player: PlayerId): PlayerId {
  return player === 'white' ? 'yellow' : 'white'
}

export function canCloseSet(state: MatchSnapshot): boolean {
  if (state.finished) return false
  const target = state.config.pointsPerSet
  return state.white.score >= target || state.yellow.score >= target
}

export function setLeader(state: MatchSnapshot): PlayerId | null {
  if (state.white.score === state.yellow.score) return null
  return state.white.score > state.yellow.score ? 'white' : 'yellow'
}

function addPoints(state: MatchSnapshot, points: number): MatchSnapshot {
  if (state.finished || points === 0) return state

  const active = state.activePlayer
  const player = { ...state[active] }
  player.score = Math.max(0, player.score + points)
  player.plays = [...player.plays, points]
  player.lastPlay = points
  if (points > 0) {
    player.maxSeries = Math.max(player.maxSeries, points)
  }

  return {
    ...state,
    [active]: player,
    voladaMala: false,
    lastSetWinner: null,
  }
}

function endTurn(state: MatchSnapshot): MatchSnapshot {
  if (state.finished) return state

  const nextPlayer = otherPlayer(state.activePlayer)
  const entrada =
    nextPlayer === state.config.starter ? state.entrada + 1 : state.entrada

  return {
    ...state,
    activePlayer: nextPlayer,
    entrada,
    voladaMala: false,
    turnKey: state.turnKey + 1,
  }
}

function closeSet(state: MatchSnapshot): MatchSnapshot {
  if (state.finished || !canCloseSet(state)) return state

  const leader = setLeader(state)
  if (!leader) return state

  const winnerPlayer = {
    ...state[leader],
    sets: state[leader].sets + 1,
  }

  // ¿Ganó la partida?
  if (winnerPlayer.sets >= state.config.setsToWin) {
    return {
      ...state,
      [leader]: winnerPlayer,
      finished: true,
      winner: leader,
      lastSetWinner: leader,
      voladaMala: false,
    }
  }

  // Siguiente set: resetea marcador, mantiene sets
  const nextStarter = otherPlayer(leader)
  return {
    ...state,
    white:
      leader === 'white'
        ? resetPlayerForNewSet(winnerPlayer)
        : resetPlayerForNewSet(state.white),
    yellow:
      leader === 'yellow'
        ? resetPlayerForNewSet(winnerPlayer)
        : resetPlayerForNewSet(state.yellow),
    activePlayer: nextStarter,
    entrada: 1,
    setNumber: state.setNumber + 1,
    finished: false,
    winner: null,
    lastSetWinner: leader,
    voladaMala: false,
    turnKey: state.turnKey + 1,
  }
}

function matchReducer(state: MatchSnapshot, action: MatchAction): MatchSnapshot {
  switch (action.type) {
    case 'ADD_POINTS':
      return addPoints(state, action.points)
    case 'END_TURN':
      return endTurn(state)
    case 'COMMIT_AND_END_TURN': {
      let next = state
      if (action.points !== null && action.points !== 0) {
        next = addPoints(next, action.points)
      }
      return endTurn(next)
    }
    case 'VOLADA_MALA':
      if (state.finished) return state
      return { ...state, voladaMala: true }
    case 'CLEAR_VOLADA_MALA':
      return { ...state, voladaMala: false }
    case 'SET_SHOT_CLOCK': {
      const seconds = Math.max(5, Math.min(999, Math.round(action.seconds) || SHOT_CLOCK_SECONDS))
      return {
        ...state,
        config: { ...state.config, shotClock: seconds },
        turnKey: state.turnKey + 1,
        voladaMala: false,
      }
    }
    case 'CLOSE_SET':
      return closeSet(state)
    case 'DISMISS_SET_BANNER':
      return { ...state, lastSetWinner: null }
    case 'FINISH': {
      // Cierra la PARTIDA (no un set). Gana quien tenga más sets.
      if (state.finished) return state
      let winner: PlayerId | null = null
      if (state.white.sets > state.yellow.sets) winner = 'white'
      else if (state.yellow.sets > state.white.sets) winner = 'yellow'
      else if (state.white.score > state.yellow.score) winner = 'white'
      else if (state.yellow.score > state.white.score) winner = 'yellow'
      return {
        ...state,
        finished: true,
        winner,
        lastSetWinner: null,
        voladaMala: false,
      }
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

      const commitAction =
        action.type === 'ADD_POINTS' ||
        action.type === 'END_TURN' ||
        action.type === 'COMMIT_AND_END_TURN' ||
        action.type === 'CLOSE_SET' ||
        action.type === 'FINISH' ||
        action.type === 'VOLADA_MALA'

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
    canCloseSet: canCloseSet(state),
    setLeader: setLeader(state),
  }
}

export type UseMatchReturn = ReturnType<typeof useMatch>
