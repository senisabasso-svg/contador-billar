import { useState } from 'react'
import type { PlayerId } from '../types'
import { POINT_VALUES } from '../types'

interface PointPadProps {
  player: PlayerId
  disabled?: boolean
  onAdd: (points: number) => void
  onEndTurn: () => void
}

export function PointPad({ player, disabled, onAdd, onEndTurn }: PointPadProps) {
  const [negative, setNegative] = useState(false)

  const handlePoint = (value: number) => {
    if (disabled) return
    onAdd(negative ? -value : value)
    setNegative(false)
  }

  return (
    <div className={`pointpad pointpad--${player}`} aria-disabled={disabled}>
      <div className="pointpad__toolbar">
        <button
          type="button"
          className={`pointpad__mode${negative ? ' is-active' : ''}`}
          onClick={() => setNegative((v) => !v)}
          disabled={disabled}
          title="Restar para corregir"
        >
          {negative ? 'Restando…' : 'Corregir (−)'}
        </button>
        <button
          type="button"
          className="pointpad__te"
          onClick={onEndTurn}
          disabled={disabled}
          title="Terminar volada / pasar turno"
        >
          TE
        </button>
      </div>

      <div className="pointpad__grid">
        {POINT_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className="pointpad__key"
            onClick={() => handlePoint(value)}
            disabled={disabled}
          >
            {negative ? `−${value}` : value}
          </button>
        ))}
      </div>
    </div>
  )
}
