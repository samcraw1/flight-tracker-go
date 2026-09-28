import { useEffect, useRef, useState } from 'react'
import type { Flight, LatLon } from './types'

const POLL_MS = 10_000
const TRAIL_LEN = 12

export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  // recent positions per aircraft, kept across polls to draw a trail
  const trails = useRef(new Map<string, LatLon[]>())

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/flights')
        if (!res.ok) throw new Error(`server returned ${res.status}`)
        const data: Flight[] = await res.json()
        if (cancelled) return

        const seen = new Set<string>()
        for (const f of data) {
          seen.add(f.icao24)
          const t = trails.current.get(f.icao24) ?? []
          const last = t[t.length - 1]
          if (!last || last[0] !== f.lat || last[1] !== f.lon) {
            t.push([f.lat, f.lon])
            if (t.length > TRAIL_LEN) t.shift()
          }
          trails.current.set(f.icao24, t)
        }
        for (const id of trails.current.keys()) {
          if (!seen.has(id)) trails.current.delete(id)
        }

        setFlights(data)
        setLastUpdated(Date.now())
        setError(null)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { flights, error, loading, lastUpdated, trails }
}
