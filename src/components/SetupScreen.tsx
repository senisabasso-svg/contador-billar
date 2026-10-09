import { useState } from 'react'
import type { MatchConfig, PlayerId } from '../types'
import { SHOT_CLOCK_SECONDS, TABLE_PRICES } from '../types'

interface SetupScreenProps {
  onStart: (config: MatchConfig) => void
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [whiteName, setWhiteName] = useState('')
  const [yellowName, setYellowName] = useState('')
  const [tablePrice, setTablePrice] = useState<number>(TABLE_PRICES[2])
  const [starter, setStarter] = useState<PlayerId>('white')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onStart({
      whiteName: whiteName || 'Jugador Blanco',
      yellowName: yellowName || 'Jugador Amarillo',
      tablePrice,
      shotClock: SHOT_CLOCK_SECONDS,
      starter,
    })
  }

  return (
    <div className="setup">
      <div className="setup__glow" aria-hidden="true" />
      <form className="setup__card" onSubmit={handleSubmit}>
        <h1 className="setup__title">Nueva partida</h1>
        <p className="setup__subtitle">
          Configurá jugadores y precio de mesa. El tiempo de volada es de{' '}
          {SHOT_CLOCK_SECONDS} segundos.
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
          <legend>Precio de mesa</legend>
          <div className="setup__presets">
            {TABLE_PRICES.map((value) => (
              <button
                key={value}
                type="button"
                className={
                  tablePrice === value
                    ? 'setup__chip setup__chip--active'
                    : 'setup__chip'
                }
                onClick={() => setTablePrice(value)}
              >
                ${value}
              </button>
            ))}
          </div>
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
