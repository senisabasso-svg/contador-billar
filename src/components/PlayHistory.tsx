interface PlayHistoryProps {
  plays: number[]
  accent: 'white' | 'yellow'
}

const VISIBLE = 10

export function PlayHistory({ plays, accent }: PlayHistoryProps) {
  const last = plays.slice(-VISIBLE).reverse()

  return (
    <div className={`play-history play-history--${accent}`}>
      <div className="play-history__head">
        <span>Últimas {VISIBLE} jugadas</span>
        <strong>{plays.length}</strong>
      </div>
      <ol className="play-history__list">
        {last.length === 0 ? (
          <li className="play-history__empty">Sin jugadas</li>
        ) : (
          last.map((value, index) => (
            <li
              key={`${plays.length - index}-${value}`}
              className={value < 0 ? 'is-neg' : 'is-pos'}
            >
              <span>#{plays.length - index}</span>
              <strong>
                {value > 0 ? `+${value}` : value}
              </strong>
            </li>
          ))
        )}
      </ol>
    </div>
  )
}
