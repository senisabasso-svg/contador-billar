import type { PlayerId } from '../types'

interface KeypadProps {
  player: PlayerId
  disabled?: boolean
  onDigit: (digit: string) => void
  onClear: () => void
  onAdjust: (delta: number) => void
  onEndTurn: () => void
  onHistory: () => void
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '-'],
] as const

export function Keypad({
  player,
  disabled,
  onDigit,
  onClear,
  onAdjust,
  onEndTurn,
  onHistory,
}: KeypadProps) {
  const handleKey = (key: string) => {
    if (disabled) return
    if (key === 'C') onClear()
    else if (key === '-') onAdjust(-1)
    else onDigit(key)
  }

  return (
    <div className={`keypad keypad--${player}`} aria-disabled={disabled}>
      <div className="keypad__grid">
        {KEYS.flat().map((key) => (
          <button
            key={key}
            type="button"
            className={`keypad__key${key === 'C' ? ' keypad__key--clear' : ''}${key === '-' ? ' keypad__key--minus' : ''}`}
            onClick={() => handleKey(key)}
            disabled={disabled}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="keypad__actions">
        <button
          type="button"
          className="keypad__key keypad__key--hist"
          onClick={onHistory}
          title="Ver historial"
        >
          H
        </button>
        <button
          type="button"
          className="keypad__key keypad__key--te"
          onClick={onEndTurn}
          disabled={disabled}
          title="Terminar entrada"
        >
          TE
        </button>
      </div>
    </div>
  )
}
