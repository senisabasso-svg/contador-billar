import { useState } from 'react'
import type { UseMatchReturn } from '../hooks/useMatch'
import type { PlayerId } from '../types'
import { PlayerPanel } from './PlayerPanel'

interface MatchScreenProps {
  match: UseMatchReturn
  onNewMatch: () => void
}

export function MatchScreen({ match, onNewMatch }: MatchScreenProps) {
  const { state, dispatch, canUndo, average, currentRun } = match
  const [historySide, setHistorySide] = useState<PlayerId | null>(null)
  const [confirmEnd, setConfirmEnd] = useState(false)

  const winnerName =
    state.winner === 'white'
      ? state.white.name
      : state.winner === 'yellow'
        ? state.yellow.name
        : null

  const handleDigit = (player: PlayerId, digit: string) => {
    if (state.activePlayer !== player || state.finished) return
    dispatch({ type: 'DIGIT', digit })
  }

  const handleEndTurn = (player: PlayerId) => {
    if (state.activePlayer !== player || state.finished) return
    dispatch({ type: 'END_TURN' })
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

      <div className="match__board">
        <PlayerPanel
          player="white"
          data={state.white}
          active={state.activePlayer === 'white'}
          finished={state.finished}
          inputBuffer={state.inputBuffer}
          average={average(state.white)}
          showHistory={historySide === 'white'}
          onDigit={(d) => handleDigit('white', d)}
          onClear={() => dispatch({ type: 'CLEAR' })}
          onAdjust={(delta) => dispatch({ type: 'ADJUST', delta })}
          onEndTurn={() => handleEndTurn('white')}
          onToggleHistory={() =>
            setHistorySide((side) => (side === 'white' ? null : 'white'))
          }
          onRename={(name) => dispatch({ type: 'RENAME', player: 'white', name })}
        />

        <aside className="match__center">
          <div className="match__sets-row">
            <span>{state.white.sets}</span>
            <small>SETS</small>
            <span>{state.yellow.sets}</span>
          </div>

          <div className="match__entrada">
            <span>ENTRADAS</span>
            <strong>{state.entrada}</strong>
          </div>

          <div className="match__target" title="Puntos objetivo">
            <span>OBJETIVO</span>
            <strong>{state.config.targetScore}</strong>
          </div>

          <div className="match__run-center">
            <span>EN MESA</span>
            <strong>{state.finished ? '—' : currentRun}</strong>
          </div>

          <button
            type="button"
            className={`match__finalize${confirmEnd ? ' is-confirm' : ''}`}
            onClick={handleFinalize}
            disabled={state.finished}
          >
            {confirmEnd ? '¿Confirmar fin?' : 'Finalizar'}
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
          inputBuffer={state.inputBuffer}
          average={average(state.yellow)}
          showHistory={historySide === 'yellow'}
          onDigit={(d) => handleDigit('yellow', d)}
          onClear={() => dispatch({ type: 'CLEAR' })}
          onAdjust={(delta) => dispatch({ type: 'ADJUST', delta })}
          onEndTurn={() => handleEndTurn('yellow')}
          onToggleHistory={() =>
            setHistorySide((side) => (side === 'yellow' ? null : 'yellow'))
          }
          onRename={(name) =>
            dispatch({ type: 'RENAME', player: 'yellow', name })
          }
        />
      </div>

      {state.finished && (
        <div className="match__overlay">
          <div className="match__overlay-card">
            <p>Partida terminada</p>
            <h2>{winnerName ? winnerName : 'Sin ganador declarado'}</h2>
            <div className="match__overlay-scores">
              <span>
                {state.white.name}: {state.white.score}
              </span>
              <span>
                {state.yellow.name}: {state.yellow.score}
              </span>
            </div>
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
