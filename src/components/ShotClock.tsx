import { SHOT_CLOCK_WARNING_SECONDS } from '../types'

interface ShotClockProps {
  total: number
  left: number
  running: boolean
  voladaMala: boolean
  onStart: () => void
  onRestart: () => void
  onChangeDuration: (seconds: number) => void
}

export function ShotClock({
  total,
  left,
  running,
  voladaMala,
  onStart,
  onRestart,
  onChangeDuration,
}: ShotClockProps) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, left / total)) : 0
  const warning = running && left <= SHOT_CLOCK_WARNING_SECONDS
  const display = Math.ceil(left)
  const waiting = !running && !voladaMala

  return (
    <div
      className={`shot-clock${warning || voladaMala ? ' is-warning' : ''}${voladaMala ? ' is-expired' : ''}${waiting ? ' is-waiting' : ''}`}
    >
      <span className="shot-clock__label">TIEMPO VOLADA</span>
      <strong className="shot-clock__time">{voladaMala ? 0 : display}</strong>

      <label className="shot-clock__duration">
        <span>Segundos</span>
        <input
          type="number"
          min={5}
          max={999}
          value={total}
          disabled={running}
          onChange={(e) =>
            onChangeDuration(Math.max(5, Number(e.target.value) || 5))
          }
        />
      </label>

      <div className="shot-clock__bar" aria-hidden="true">
        <div
          className="shot-clock__fill"
          style={{ transform: `scaleX(${waiting ? 1 : ratio})` }}
        />
      </div>

      {voladaMala ? (
        <p className="shot-clock__alert">Volada mala</p>
      ) : (
        <p className="shot-clock__hint">
          {running
            ? warning
              ? 'Últimos segundos'
              : 'En juego'
            : 'Esperando inicio'}
        </p>
      )}

      <div className="shot-clock__actions">
        {!running && !voladaMala && (
          <button type="button" className="shot-clock__start" onClick={onStart}>
            Iniciar tiempo
          </button>
        )}
        {(voladaMala || (!running && left < total)) && (
          <button type="button" className="shot-clock__restart" onClick={onRestart}>
            Reset {total}s
          </button>
        )}
      </div>
    </div>
  )
}
