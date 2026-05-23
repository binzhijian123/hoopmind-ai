import type { PlayerId, Point } from '../types/tactic'

type PlayerMarkerProps = {
  id: PlayerId
  point: Point
  selected?: boolean
  focused?: boolean
  hasBall?: boolean
  readonly?: boolean
  animated?: boolean
  onPointerDown?: (event: React.PointerEvent<SVGGElement>, id: PlayerId) => void
  onClick?: (event: React.MouseEvent<SVGGElement>, id: PlayerId) => void
}

const isOpponent = (id: PlayerId) => id.startsWith('X')

function PlayerMarker({ id, point, selected, focused, hasBall, readonly, animated, onPointerDown, onClick }: PlayerMarkerProps) {
  const opponent = isOpponent(id)
  const emphasized = selected || focused || hasBall

  return (
    <g
      transform={`translate(${point.x} ${point.y})`}
      className={animated ? 'transition-transform duration-500 ease-out' : undefined}
      style={{ cursor: readonly ? 'default' : 'grab' }}
      onPointerDown={(event) => onPointerDown?.(event, id)}
      onClick={(event) => onClick?.(event, id)}
    >
      <circle
        r={emphasized ? 4.7 : 3.9}
        fill={opponent ? '#334155' : '#f97316'}
        stroke={hasBall ? '#facc15' : emphasized ? '#f8ead4' : opponent ? '#93c5fd' : '#fed7aa'}
        strokeWidth={hasBall ? 1.8 : emphasized ? 1.4 : 0.9}
      />
      {hasBall && (
        <g transform="translate(4.9 -4.6)">
          <circle r="1.55" fill="#f59e0b" stroke="#111827" strokeWidth="0.35" />
          <path d="M-1.2 0 H1.2 M0 -1.2 V1.2" stroke="#7c2d12" strokeWidth="0.25" />
        </g>
      )}
      <text
        y="1.2"
        textAnchor="middle"
        fontSize={opponent ? 3.2 : 3.8}
        fontWeight="800"
        fill={opponent ? '#dbeafe' : '#111827'}
        pointerEvents="none"
      >
        {id}
      </text>
      {hasBall && (
        <text x="7.2" y="-3.7" fontSize="2.4" fontWeight="900" fill="#facc15">
          BALL
        </text>
      )}
    </g>
  )
}

export default PlayerMarker
