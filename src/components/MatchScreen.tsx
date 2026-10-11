import { useCallback, useEffect, useState } from 'react'
import type { UseMatchReturn } from '../hooks/useMatch'
import { useShotClock } from '../hooks/useShotClock'
import type { PlayerId } from '../types'
import { PlayerPanel } from './PlayerPanel'
import { ShotClock } from './ShotClock'

interface MatchScreenProps {
  match: UseMatchReturn
  onNewMatch: () => void
}

export function MatchScreen({ match, onNewMatch }: MatchScreenProps) {
  const { state, dispatch, canUndo, canCloseSet, setLeader } = match
  const [confirmEnd, setConfirmEnd] = useState(false)

  const onExpire = useCallback(() => {
    dispatch({ type: 'VOLADA_MALA' })
  }, [dispatch])

  const clock = useShotClock({
    seconds: state.config.shotClock,
    turnKey: state.turnKey,
    enabled: !state.finished,
    onExpire,
  })

  const winnerName =
    state.winner === 'white'
      ? state.white.name
      : state.winner === 'yellow'
        ? state.yellow.name
        : null

  const lastSetName =
    state.lastSetWinner === 'white'
      ? state.white.name
      : state.lastSetWinner === 'yellow'
        ? state.yellow.name
        : null

  const leaderName =
    setLeader === 'white'
      ? state.white.name
      : setLeader === 'yellow'
        ? state.yellow.name
        : null

  useEffect(() => {
    if (!state.lastSetWinner || state.finished) return
    const id = window.setTimeout(() => {
      dispatch({ type: 'DISMISS_SET_BANNER' })
    }, 3200)
    return () => window.clearTimeout(id)
  }, [state.lastSetWinner, state.finished, state.setNumber, dispatch])

  const handleAdd = (player: PlayerId, points: number) => {
    if (state.activePlayer !== player || state.finished) return
    dispatch({ type: 'ADD_POINTS', points })
  }

  const handlePassTurn = (player: PlayerId, pendingPoints: number | null) => {
    if (state.activePlayer !== player || state.finished) return
    dispatch({ type: 'COMMIT_AND_END_TURN', points: pendingPoints })
  }

  const handleFinalize = () => {
    if (!confirmEnd) {
      setConfirmEnd(true)
      return
    }
    dispatch({ type: 'FINISH' })
    setConfirmEnd(false)
  }

  return (
    <div className="match">
      <div className="match__felt" aria-hidden="true" />

      <header className="match__toolbar">
        <button
          type="button"
          className="match__tool"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!canUndo}
          title="Deshacer última acción"
        >
          Deshacer
        </button>
        <div className="match__status">
          {state.finished ? (
            <span className="match__winner">
              {winnerName ? `Ganó ${winnerName}` : 'Partida finalizada'}
            </span>
          ) : (
            <span>
              Turno:{' '}
              <strong className={`match__turn match__turn--${state.activePlayer}`}>
                {state[state.activePlayer].name}
              </strong>
            </span>
          )}
        </div>
        <button
          type="button"
          className="match__tool match__tool--danger"
          onClick={onNewMatch}
        >
          Nueva partida
        </button>
      </header>

      {state.lastSetWinner && !state.finished && lastSetName && (
        <div className="match__set-banner" role="status">
          Set {state.setNumber - 1} para <strong>{lastSetName}</strong>
          <button
            type="button"
            onClick={() => dispatch({ type: 'DISMISS_SET_BANNER' })}
          >
            Seguir
          </button>
        </div>
      )}

      <div className="match__board">
        <PlayerPanel
          player="white"
          data={state.white}
          active={state.activePlayer === 'white'}
          finished={state.finished}
          onAdd={(points) => handleAdd('white', points)}
          onPassTurn={(points) => handlePassTurn('white', points)}
          onRename={(name) => dispatch({ type: 'RENAME', player: 'white', name })}
        />

        <aside className="match__center">
          <div className="match__sets-row">
            <span>{state.white.sets}</span>
            <small>SETS</small>
            <span>{state.yellow.sets}</span>
          </div>
          <p className="match__set-meta">
            Set {state.setNumber} · a {state.config.pointsPerSet} pts · al mejor
            de {state.config.setsToWin}
          </p>

          <div className="match__entrada">
            <span>ENTRADAS</span>
            <strong>{state.entrada}</strong>
          </div>

          <ShotClock
            total={state.config.shotClock}
            left={clock.left}
            running={clock.running}
            voladaMala={state.voladaMala || clock.expired}
            onStart={clock.start}
            onRestart={() => {
              dispatch({ type: 'CLEAR_VOLADA_MALA' })
              clock.restart()
            }}
            onChangeDuration={(seconds) =>
              dispatch({ type: 'SET_SHOT_CLOCK', seconds })
            }
          />

          <div className="match__mesa" title="Precio de mesa">
            <span>MESA</span>
            <strong>${state.config.tablePrice}</strong>
          </div>

          <button
            type="button"
            className={`match__close-set${canCloseSet ? ' is-ready' : ''}`}
            onClick={() => dispatch({ type: 'CLOSE_SET' })}
            disabled={!canCloseSet || state.finished}
            title={
              canCloseSet
                ? `Cerrar set a favor de ${leaderName ?? 'líder'}`
                : `Hace falta llegar a ${state.config.pointsPerSet} puntos`
            }
          >
            {canCloseSet
              ? `Cerrar set (${leaderName ?? '—'})`
              : `Cerrar set (a ${state.config.pointsPerSet})`}
          </button>

          <button
            type="button"
            className={`match__finalize${confirmEnd ? ' is-confirm' : ''}`}
            onClick={handleFinalize}
            disabled={state.finished}
          >
            {confirmEnd ? '¿Cerrar partida?' : 'Finalizar partida'}
          </button>
          {confirmEnd && (
            <button
              type="button"
              className="match__cancel-end"
              onClick={() => setConfirmEnd(false)}
            >
              Cancelar
            </button>
          )}
        </aside>

        <PlayerPanel
          player="yellow"
          data={state.yellow}
          active={state.activePlayer === 'yellow'}
          finished={state.finished}
          onAdd={(points) => handleAdd('yellow', points)}
          onPassTurn={(points) => handlePassTurn('yellow', points)}
          onRename={(name) =>
            dispatch({ type: 'RENAME', player: 'yellow', name })
          }
        />
      </div>

      {state.finished && (
        <div className="match__overlay">
          <div className="match__overlay-card">
            <p>Partida terminada</p>
            <h2>{winnerName ? winnerName : 'Empate en sets'}</h2>
            <div className="match__overlay-scores">
              <span>
                {state.white.name}: {state.white.sets} set
                {state.white.sets === 1 ? '' : 's'}
              </span>
              <span>
                {state.yellow.name}: {state.yellow.sets} set
                {state.yellow.sets === 1 ? '' : 's'}
              </span>
            </div>
            <p className="match__overlay-mesa">Mesa ${state.config.tablePrice}</p>
            <div className="match__overlay-actions">
              <button type="button" onClick={onNewMatch}>
                Nueva partida
              </button>
              <button
                type="button"
                className="is-ghost"
                onClick={() => dispatch({ type: 'UNDO' })}
                disabled={!canUndo}
              >
                Deshacer último
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
