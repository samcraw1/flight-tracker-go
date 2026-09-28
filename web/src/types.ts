export type Flight = {
  icao24: string
  callsign: string
  country: string
  lat: number
  lon: number
  alt: number // metres
  velocity: number // m/s
  heading: number // degrees
  verticalRate: number // m/s
  onGround: boolean
}

export type LatLon = [number, number]
