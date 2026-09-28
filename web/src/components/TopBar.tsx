import { useEffect, useState } from 'react'

type Props = {
  count: number
  lastUpdated: number | null
  error: string | null
  loading: boolean
}

export default function TopBar({ count, lastUpdated, error, loading }: Props) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const age = lastUpdated ? Math.max(0, Math.round((now - lastUpdated) / 1000)) : null
  const stale = error !== null || (age !== null && age > 30)

  return (
    <div className="panel topbar">
      <div className="brand">Flight Tracker</div>
      {loading ? (
        <div className="muted">Connecting to radar…</div>
      ) : (
        <div className="status">
          <span className={`pulse ${stale ? 'stale' : ''}`} aria-hidden />
          <span className="mono">{count.toLocaleString()}</span> aircraft
          <span className="muted"> · {age === null ? '—' : `updated ${age}s ago`}</span>
        </div>
      )}
    </div>
  )
}
