import { useMemo, useState } from 'react'
import type { Flight } from '../types'

type Props = {
  flights: Flight[]
  onPick: (id: string) => void
}

export default function SearchBox({ flights, onPick }: Props) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const query = q.trim().toLowerCase()

  const results = useMemo(() => {
    if (!query) return []
    const out: Flight[] = []
    for (const f of flights) {
      if (f.callsign.toLowerCase().includes(query) || f.country.toLowerCase().includes(query)) {
        out.push(f)
        if (out.length === 8) break
      }
    }
    return out
  }, [flights, query])

  const pick = (f: Flight) => {
    onPick(f.icao24)
    setQ(f.callsign)
    setOpen(false)
  }

  return (
    <div className="panel search">
      <input
        type="search"
        placeholder="Search callsign or country, e.g. AAL1008"
        aria-label="Search flights"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) pick(results[0])
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && query && (
        <ul className="results" role="listbox">
          {results.length === 0 && <li className="muted empty">No aircraft matching “{q}”</li>}
          {results.map((f) => (
            <li key={f.icao24} role="option" aria-selected={false}>
              <button onClick={() => pick(f)}>
                <span className="mono">{f.callsign || f.icao24}</span>
                <span className="muted">{f.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
