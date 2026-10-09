import type { PlayerId, PlayerState } from '../types'
import { HistoryGrid } from './HistoryGrid'
import { Keypad } from './Keypad'

interface PlayerPanelProps {
  player: PlayerId
  data: PlayerState
  active: boolean
  finished: boolean
  inputBuffer: string
  average: string
  showHistory: boolean
  onDigit: (digit: string) => void
  onClear: () => void
  onAdjust: (delta: number) => void
  onEndTurn: () => void
  onToggleHistory: () => void
  onRename: (name: string) => void
}

export function PlayerPanel({
  player,
  data,
  active,
  finished,
  inputBuffer,
  average,
  showHistory,
  onDigit,
  onClear,
  onAdjust,
  onEndTurn,
  onToggleHistory,
  onRename,
}: PlayerPanelProps) {
  const runDisplay = active && inputBuffer !== '' ? inputBuffer : '—'

  return (
    <section
      className={`player player--${player}${active && !finished ? ' is-active' : ''}${finished ? ' is-finished' : ''}`}
    >
      <header className="player__header">
        <input
          className="player__name"
          value={data.name}
          onChange={(e) => onRename(e.target.value)}
          maxLength={28}
          aria-label={`Nombre jugador ${player === 'white' ? 'blanco' : 'amarillo'}`}
        />
        <div className="player__sets" title="Sets ganados">
          {data.sets}
        </div>
      </header>

      <div className="player__score-block">
        <p className="player__score">{data.score}</p>
        <div className="player__meta">
          <span>
            Última:{' '}
            <strong>{data.lastInning === null ? '—' : data.lastInning}</strong>
          </span>
          <span>
            Serie máx: <strong>{data.maxSeries}</strong>
          </span>
          <span>
            Prom: <strong>{average}</strong>
          </span>
        </div>
        <div className="player__run" aria-live="polite">
          <span>Carrera actual</span>
          <strong>{active && !finished ? runDisplay : '—'}</strong>
        </div>
      </div>

      {showHistory ? (
        <HistoryGrid innings={data.innings} accent={player} />
      ) : (
        <Keypad
          player={player}
          disabled={!active || finished}
          onDigit={onDigit}
          onClear={onClear}
          onAdjust={onAdjust}
          onEndTurn={onEndTurn}
          onHistory={onToggleHistory}
        />
      )}

      {showHistory && (
        <button
          type="button"
          className="player__back-keys"
          onClick={onToggleHistory}
        >
          Volver al teclado
        </button>
      )}
    </section>
  )
}
