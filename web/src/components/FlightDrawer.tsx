import { useEffect } from 'react'
import type { Flight } from '../types'
import { altitudeColor, toFeet, toKnots } from '../altitudeColor'

type Props = {
  flight: Flight | null
  gone: boolean
  follow: boolean
  onFollow: (v: boolean) => void
  onClose: () => void
}

export default function FlightDrawer({ flight, gone, follow, onFollow, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const open = flight !== null || gone

  return (
    <aside className={`panel drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="close" onClick={onClose} aria-label="Close details">
        ×
      </button>
      {gone && !flight && <p className="muted">This aircraft is no longer being tracked.</p>}
      {flight && (
        <>
          <div className="callsign mono" style={{ color: altitudeColor(flight) }}>
            {flight.callsign || flight.icao24}
          </div>
          <div className="muted">{flight.country}</div>

          <dl>
            <div>
              <dt>Altitude</dt>
              <dd className="mono">
                {flight.onGround ? 'On ground' : `${toFeet(flight.alt).toLocaleString()} ft`}
                {!flight.onGround && <span className="muted"> · {Math.round(flight.alt).toLocaleString()} m</span>}
              </dd>
            </div>
            <div>
              <dt>Speed</dt>
              <dd className="mono">{toKnots(flight.velocity)} kt</dd>
            </div>
            <div>
              <dt>Heading</dt>
              <dd className="mono">
                <span className="arrow" style={{ transform: `rotate(${flight.heading}deg)` }} aria-hidden>
                  ↑
                </span>{' '}
                {Math.round(flight.heading)}°
              </dd>
            </div>
            <div>
              <dt>Vertical rate</dt>
              <dd className="mono">{Math.round(flight.verticalRate * 196.85)} ft/min</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd className="mono">
                {flight.lat.toFixed(3)}, {flight.lon.toFixed(3)}
              </dd>
            </div>
            <div>
              <dt>ICAO24</dt>
              <dd className="mono">{flight.icao24}</dd>
            </div>
          </dl>

          <button className={`follow ${follow ? 'on' : ''}`} onClick={() => onFollow(!follow)}>
            {follow ? 'Following — click to stop' : 'Follow this flight'}
          </button>
        </>
      )}
    </aside>
  )
}
