import { ALTITUDE_BANDS } from '../altitudeColor'

type Props = {
  showGround: boolean
  onToggleGround: (v: boolean) => void
}

export default function Legend({ showGround, onToggleGround }: Props) {
  return (
    <div className="panel legend">
      <div className="legend-title">Altitude</div>
      <ul>
        {ALTITUDE_BANDS.map((b) => (
          <li key={b.label}>
            <span className="swatch" style={{ background: b.color }} aria-hidden />
            {b.label}
          </li>
        ))}
      </ul>
      <label className="toggle">
        <input type="checkbox" checked={showGround} onChange={(e) => onToggleGround(e.target.checked)} />
        Show aircraft on ground
      </label>
    </div>
  )
}
