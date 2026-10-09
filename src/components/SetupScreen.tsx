import { useState } from 'react'
import type { MatchConfig, PlayerId } from '../types'

interface SetupScreenProps {
  onStart: (config: MatchConfig) => void
}

const TARGET_PRESETS = [25, 30, 40, 50, 60, 100]

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [whiteName, setWhiteName] = useState('')
  const [yellowName, setYellowName] = useState('')
  const [targetScore, setTargetScore] = useState(40)
  const [starter, setStarter] = useState<PlayerId>('white')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onStart({
      whiteName: whiteName || 'Jugador Blanco',
      yellowName: yellowName || 'Jugador Amarillo',
      targetScore,
      starter,
    })
  }

  return (
    <div className="setup">
      <div className="setup__glow" aria-hidden="true" />
      <form className="setup__card" onSubmit={handleSubmit}>
        <h1 className="setup__title">Nueva partida</h1>
        <p className="setup__subtitle">
          Configurá los jugadores y el objetivo. Los datos viven en memoria hasta
          que cierres o refresques la pestaña.
        </p>

        <div className="setup__grid">
          <label className="setup__field setup__field--white">
            <span>Jugador blanco</span>
            <input
              value={whiteName}
              onChange={(e) => setWhiteName(e.target.value)}
              placeholder="Nombre jugador blanco"
              autoComplete="off"
              maxLength={28}
            />
          </label>

          <label className="setup__field setup__field--yellow">
            <span>Jugador amarillo</span>
            <input
              value={yellowName}
              onChange={(e) => setYellowName(e.target.value)}
              placeholder="Nombre jugador amarillo"
              autoComplete="off"
              maxLength={28}
            />
          </label>
        </div>

        <fieldset className="setup__fieldset">
          <legend>Puntos objetivo</legend>
          <div className="setup__presets">
            {TARGET_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                className={
                  targetScore === value
                    ? 'setup__chip setup__chip--active'
                    : 'setup__chip'
                }
                onClick={() => setTargetScore(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <label className="setup__field setup__field--inline">
            <span>Personalizado</span>
            <input
              type="number"
              min={1}
              max={999}
              value={targetScore}
              onChange={(e) =>
                setTargetScore(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </label>
        </fieldset>

        <fieldset className="setup__fieldset">
          <legend>Quién abre</legend>
          <div className="setup__starter">
            <button
              type="button"
              className={
                starter === 'white'
                  ? 'setup__starter-btn setup__starter-btn--white is-active'
                  : 'setup__starter-btn setup__starter-btn--white'
              }
              onClick={() => setStarter('white')}
            >
              Blanco
            </button>
            <button
              type="button"
              className={
                starter === 'yellow'
                  ? 'setup__starter-btn setup__starter-btn--yellow is-active'
                  : 'setup__starter-btn setup__starter-btn--yellow'
              }
              onClick={() => setStarter('yellow')}
            >
              Amarillo
            </button>
          </div>
        </fieldset>

        <button type="submit" className="setup__submit">
          Iniciar partida
        </button>
      </form>
    </div>
  )
}
