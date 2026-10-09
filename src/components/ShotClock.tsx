import { SHOT_CLOCK_WARNING_SECONDS } from '../types'

interface ShotClockProps {
  total: number
  left: number
  running: boolean
  voladaMala: boolean
  onRestart: () => void
}

export function ShotClock({
  total,
  left,
  running,
  voladaMala,
  onRestart,
}: ShotClockProps) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, left / total)) : 0
  const warning = left <= SHOT_CLOCK_WARNING_SECONDS
  const display = Math.ceil(left)

  return (
    <div
      className={`shot-clock${warning || voladaMala ? ' is-warning' : ''}${voladaMala ? ' is-expired' : ''}`}
    >
      <span className="shot-clock__label">TIEMPO VOLADA</span>
      <strong className="shot-clock__time">{voladaMala ? 0 : display}</strong>
      <div className="shot-clock__bar" aria-hidden="true">
        <div
          className="shot-clock__fill"
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
      {voladaMala ? (
        <p className="shot-clock__alert">Volada mala</p>
      ) : (
        <p className="shot-clock__hint">
          {running ? (warning ? 'Últimos segundos' : 'En juego') : 'Pausado'}
        </p>
      )}
      {(voladaMala || !running) && (
        <button type="button" className="shot-clock__restart" onClick={onRestart}>
          Reiniciar {total}s
        </button>
      )}
    </div>
  )
}
