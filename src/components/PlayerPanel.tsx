import type { PlayerId, PlayerState } from '../types'
import { PlayHistory } from './PlayHistory'
import { PointPad } from './PointPad'

interface PlayerPanelProps {
  player: PlayerId
  data: PlayerState
  active: boolean
  finished: boolean
  onAdd: (points: number) => void
  onPassTurn: (pendingPoints: number | null) => void
  onRename: (name: string) => void
}

export function PlayerPanel({
  player,
  data,
  active,
  finished,
  onAdd,
  onPassTurn,
  onRename,
}: PlayerPanelProps) {
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
        <div className="player__last" aria-live="polite">
          <span>Último</span>
          <strong>
            {data.lastPlay === null
              ? '—'
              : data.lastPlay > 0
                ? `+${data.lastPlay}`
                : data.lastPlay}
          </strong>
        </div>
        <div className="player__meta">
          <span>
            Serie máx: <strong>{data.maxSeries}</strong>
          </span>
          <span>
            Jugadas: <strong>{data.plays.length}</strong>
          </span>
        </div>
      </div>

      <PlayHistory plays={data.plays} accent={player} />

      <PointPad
        player={player}
        disabled={!active || finished}
        onAdd={onAdd}
        onPassTurn={onPassTurn}
      />
    </section>
  )
}
