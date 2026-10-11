import { useEffect, useState } from 'react'
import type { PlayerId } from '../types'

interface PointPadProps {
  player: PlayerId
  disabled?: boolean
  onAdd: (points: number) => void
  onPassTurn: (pendingPoints: number | null) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '+'] as const

export function PointPad({ player, disabled, onAdd, onPassTurn }: PointPadProps) {
  const [buffer, setBuffer] = useState('')
  const [negative, setNegative] = useState(false)

  useEffect(() => {
    setBuffer('')
    setNegative(false)
  }, [disabled, player])

  const parseBuffer = (): number | null => {
    if (!buffer) return null
    const raw = Number.parseInt(buffer, 10)
    if (!Number.isFinite(raw) || raw === 0) return null
    return negative ? -raw : raw
  }

  const commit = () => {
    if (disabled) return
    const points = parseBuffer()
    if (points === null) return
    onAdd(points)
    setBuffer('')
    setNegative(false)
  }

  const handleKey = (key: (typeof KEYS)[number]) => {
    if (disabled) return
    if (key === 'C') {
      setBuffer('')
      return
    }
    if (key === '+') {
      commit()
      return
    }
    if (buffer.length >= 3) return
    if (buffer === '0') {
      setBuffer(key)
      return
    }
    setBuffer((prev) => prev + key)
  }

  const handlePass = () => {
    if (disabled) return
    const points = parseBuffer()
    setBuffer('')
    setNegative(false)
    onPassTurn(points)
  }

  const preview =
    buffer === '' ? '—' : negative ? `−${buffer}` : buffer

  return (
    <div className={`pointpad pointpad--${player}`} aria-disabled={disabled}>
      <div className="pointpad__display" aria-live="polite">
        <span>A sumar</span>
        <strong>{preview}</strong>
      </div>

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
          onClick={handlePass}
          disabled={disabled}
          title="Sumar carga pendiente (si hay) y pasar turno"
        >
          Pasar
        </button>
      </div>

      <div className="pointpad__grid pointpad__grid--dial">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`pointpad__key${key === '+' ? ' pointpad__key--add' : ''}${key === 'C' ? ' pointpad__key--clear' : ''}`}
            onClick={() => handleKey(key)}
            disabled={disabled}
            title={key === '+' ? 'Sumar puntos' : undefined}
          >
            {key === '+' ? 'Sumar' : key}
          </button>
        ))}
      </div>
    </div>
  )
}
