import type { Flight } from './types'

export const ALTITUDE_BANDS = [
  { label: 'On ground', color: '#6b7785' },
  { label: '< 3 km', color: '#f4c95d' },
  { label: '3 – 8 km', color: '#2ec4b6' },
  { label: '8 – 11 km', color: '#4895ef' },
  { label: '> 11 km', color: '#9b6bff' },
] as const

export function altitudeColor(f: Flight): string {
  if (f.onGround) return ALTITUDE_BANDS[0].color
  if (f.alt < 3000) return ALTITUDE_BANDS[1].color
  if (f.alt < 8000) return ALTITUDE_BANDS[2].color
  if (f.alt < 11000) return ALTITUDE_BANDS[3].color
  return ALTITUDE_BANDS[4].color
}

export const toFeet = (m: number) => Math.round(m * 3.28084)
export const toKnots = (ms: number) => Math.round(ms * 1.94384)
