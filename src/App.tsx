import { useState } from 'react'
import { IntroVideo } from './components/IntroVideo'
import { MatchScreen } from './components/MatchScreen'
import { SetupScreen } from './components/SetupScreen'
import { useMatch } from './hooks/useMatch'
import type { MatchConfig } from './types'
import './App.css'

type Phase = 'setup' | 'match'

const DEFAULT_CONFIG: MatchConfig = {
  whiteName: 'Jugador Blanco',
  yellowName: 'Jugador Amarillo',
  tablePrice: 100,
  shotClock: 40,
  starter: 'white',
}

function MatchApp({
  config,
  onNewMatch,
}: {
  config: MatchConfig
  onNewMatch: () => void
}) {
  const match = useMatch(config)
  return <MatchScreen match={match} onNewMatch={onNewMatch} />
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [config, setConfig] = useState<MatchConfig>(DEFAULT_CONFIG)
  const [matchKey, setMatchKey] = useState(0)

  const startMatch = (next: MatchConfig) => {
    setConfig(next)
    setMatchKey((k) => k + 1)
    setPhase('match')
  }

  const newMatch = () => {
    setPhase('setup')
  }

  return (
    <div className="app-shell">
      <header className="app-brandbar">
        <p className="app-brandbar__title">Contador Billar</p>
        <div
          id="video-dock"
          className="app-brandbar__dock"
          aria-hidden="true"
        />
      </header>

      <IntroVideo dockSelector="#video-dock" />

      <main className="app-shell__main">
        {phase === 'setup' ? (
          <SetupScreen onStart={startMatch} />
        ) : (
          <MatchApp key={matchKey} config={config} onNewMatch={newMatch} />
        )}
      </main>
    </div>
  )
}
