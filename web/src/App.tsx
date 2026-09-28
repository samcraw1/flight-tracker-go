import { useEffect, useMemo, useState } from 'react'
import FlightMap from './components/FlightMap'
import TopBar from './components/TopBar'
import SearchBox from './components/SearchBox'
import Legend from './components/Legend'
import FlightDrawer from './components/FlightDrawer'
import { useFlights } from './useFlights'
import './styles.css'

function usePrefersDark() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

export default function App() {
  const { flights, error, loading, lastUpdated, trails } = useFlights()
  const dark = usePrefersDark()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [follow, setFollow] = useState(false)
  const [showGround, setShowGround] = useState(false)

  const visible = useMemo(() => (showGround ? flights : flights.filter((f) => !f.onGround)), [flights, showGround])
  const selected = useMemo(() => flights.find((f) => f.icao24 === selectedId) ?? null, [flights, selectedId])
  const trail = selectedId ? (trails.current.get(selectedId) ?? []) : []

  const select = (id: string | null) => {
    setSelectedId(id)
    setFollow(false)
  }

  return (
    <div className="app">
      <FlightMap
        flights={visible}
        selectedId={selectedId}
        follow={follow}
        trail={trail}
        dark={dark}
        onSelect={select}
      />
      <TopBar count={visible.length} lastUpdated={lastUpdated} error={error} loading={loading} />
      <SearchBox flights={flights} onPick={select} />
      <Legend showGround={showGround} onToggleGround={setShowGround} />
      <FlightDrawer
        flight={selected}
        gone={selectedId !== null && !selected}
        follow={follow}
        onFollow={setFollow}
        onClose={() => select(null)}
      />
      {error && !loading && (
        <div className="banner" role="status">
          Live data unavailable, showing last update ({error})
        </div>
      )}
    </div>
  )
}
