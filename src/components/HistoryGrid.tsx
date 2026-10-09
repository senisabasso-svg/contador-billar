import { useEffect, useMemo, useState } from 'react'

interface HistoryGridProps {
  innings: number[]
  accent: 'white' | 'yellow'
}

const PAGE_SIZE = 12

export function HistoryGrid({ innings, accent }: HistoryGridProps) {
  const pages = Math.max(1, Math.ceil(innings.length / PAGE_SIZE))
  const [page, setPage] = useState(() => pages - 1)

  useEffect(() => {
    setPage(pages - 1)
  }, [pages, innings.length])

  const safePage = Math.min(page, pages - 1)
  const slice = useMemo(() => {
    const start = safePage * PAGE_SIZE
    return innings.slice(start, start + PAGE_SIZE)
  }, [innings, safePage])

  const cells = Array.from({ length: PAGE_SIZE }, (_, index) => {
    const value = slice[index]
    const globalIndex = safePage * PAGE_SIZE + index
    return {
      key: globalIndex,
      value,
      filled: value !== undefined,
    }
  })

  return (
    <div className={`history history--${accent}`}>
      <div className="history__head">
        <span>Entradas</span>
        <div className="history__nav">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, Math.min(p, pages - 1) - 1))}
            disabled={safePage <= 0}
            aria-label="Entradas anteriores"
          >
            ‹
          </button>
          <span>
            {safePage + 1}/{pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages - 1, Math.min(p, pages - 1) + 1))}
            disabled={safePage >= pages - 1}
            aria-label="Entradas siguientes"
          >
            ›
          </button>
        </div>
      </div>
      <div className="history__grid">
        {cells.map((cell, index) => (
          <div
            key={cell.key}
            className={`history__cell${cell.filled ? ' is-filled' : ''}${index % 2 === 0 ? ' is-a' : ' is-b'}`}
          >
            {cell.filled ? cell.value : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
