import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Flight, LatLon } from '../types'
import { altitudeColor } from '../altitudeColor'

const TILES = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
}

type Props = {
  flights: Flight[]
  selectedId: string | null
  follow: boolean
  trail: LatLon[]
  dark: boolean
  onSelect: (id: string | null) => void
}

// Dots are drawn imperatively on one canvas: thousands of React-managed
// markers would be far too slow to rebuild every poll.
function FlightLayer({ flights, selectedId, follow, trail, onSelect }: Omit<Props, 'dark'>) {
  const map = useMap()
  const layer = useRef<L.LayerGroup>(L.layerGroup())
  const overlay = useRef<L.LayerGroup>(L.layerGroup())
  const canvas = useRef(L.canvas({ padding: 0.5 }))
  const tip = useRef(L.tooltip({ direction: 'top', offset: [0, -6], className: 'flight-tip' }))
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const l = layer.current
    const o = overlay.current
    l.addTo(map)
    o.addTo(map)
    return () => {
      l.remove()
      o.remove()
    }
  }, [map])

  useEffect(() => {
    layer.current.clearLayers()
    const z = map.getZoom()
    const radius = z < 4 ? 2.5 : z < 7 ? 3.5 : 5
    for (const f of flights) {
      const m = L.circleMarker([f.lat, f.lon], {
        renderer: canvas.current,
        radius,
        color: '#0b0f14',
        weight: 1,
        fillColor: altitudeColor(f),
        fillOpacity: 0.95,
      })
      m.on('mouseover', () => {
        tip.current.setContent(f.callsign || f.icao24).setLatLng([f.lat, f.lon]).addTo(map)
      })
      m.on('mouseout', () => tip.current.remove())
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        onSelectRef.current(f.icao24)
      })
      layer.current.addLayer(m)
    }
  }, [flights, map])

  // selection ring + trail
  const selected = flights.find((f) => f.icao24 === selectedId)
  useEffect(() => {
    overlay.current.clearLayers()
    if (!selected) return
    if (trail.length > 1) {
      L.polyline(trail, { color: '#4cc9f0', weight: 2, opacity: 0.6, dashArray: '4 4' }).addTo(overlay.current)
    }
    L.circleMarker([selected.lat, selected.lon], {
      radius: 10,
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0,
      interactive: false,
    }).addTo(overlay.current)
  }, [selected, trail])

  // fly to a newly selected flight; keep centred while following
  const lastSelected = useRef<string | null>(null)
  useEffect(() => {
    if (!selected) {
      lastSelected.current = null
      return
    }
    if (lastSelected.current !== selected.icao24) {
      lastSelected.current = selected.icao24
      map.flyTo([selected.lat, selected.lon], Math.max(map.getZoom(), 6), { duration: 0.8 })
    } else if (follow) {
      map.panTo([selected.lat, selected.lon], { animate: true })
    }
  }, [selected, follow, map])

  useEffect(() => {
    const clear = () => onSelectRef.current(null)
    map.on('click', clear)
    return () => {
      map.off('click', clear)
    }
  }, [map])

  return null
}

export default function FlightMap({ dark, ...rest }: Props) {
  return (
    <MapContainer
      center={[39.8, -98.6]}
      zoom={4}
      minZoom={2}
      preferCanvas
      zoomControl={false}
      worldCopyJump
      className="map"
    >
      <TileLayer
        key={dark ? 'dark' : 'light'}
        url={dark ? TILES.dark : TILES.light}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <FlightLayer {...rest} />
    </MapContainer>
  )
}
