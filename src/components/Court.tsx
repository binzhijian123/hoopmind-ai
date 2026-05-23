import { useRef, useState } from 'react'
import ActionArrow from './ActionArrow'
import PlayerMarker from './PlayerMarker'
import type { ActionLine, BoardMode, DefensiveAction, PlayerId, Point, ShotOption } from '../types/tactic'

type CourtProps = {
  players: Record<PlayerId, Point>
  actions: ActionLine[]
  defensiveActions?: DefensiveAction[]
  shotOptions?: ShotOption[]
  focusPlayers?: PlayerId[]
  ballHandler?: PlayerId
  readonly?: boolean
  mode?: BoardMode
  selectedPlayer?: PlayerId | null
  animated?: boolean
  showAllLabels?: boolean
  showOffenseActions?: boolean
  showDefenseRotations?: boolean
  showShotOptions?: boolean
  onPlayersChange?: (players: Record<PlayerId, Point>) => void
  onPlayerClick?: (player: PlayerId) => void
  onCourtClick?: (point: Point) => void
}

const clamp = (value: number) => Math.max(4, Math.min(96, value))

function Court({
  players,
  actions,
  defensiveActions = [],
  shotOptions = [],
  focusPlayers = [],
  ballHandler,
  readonly = false,
  mode = 'drag',
  selectedPlayer,
  animated = true,
  showAllLabels = false,
  showOffenseActions = true,
  showDefenseRotations = true,
  showShotOptions = true,
  onPlayersChange,
  onPlayerClick,
  onCourtClick,
}: CourtProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dragging, setDragging] = useState<PlayerId | null>(null)
  const [moved, setMoved] = useState(false)

  const getPoint = (event: React.PointerEvent<SVGElement>): Point => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const transformed = point.matrixTransform(ctm.inverse())
    return { x: clamp(transformed.x), y: clamp(transformed.y) }
  }

  const handlePointerDown = (event: React.PointerEvent<SVGGElement>, id: PlayerId) => {
    event.stopPropagation()
    if (readonly || mode !== 'drag') return
    setDragging(id)
    setMoved(false)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || readonly || mode !== 'drag') return
    const point = getPoint(event)
    setMoved(true)
    onPlayersChange?.({
      ...players,
      [dragging]: point,
    })
  }

  const endDrag = () => {
    setDragging(null)
    window.setTimeout(() => setMoved(false), 0)
  }

  const handlePlayerClick = (event: React.MouseEvent<SVGGElement>, id: PlayerId) => {
    event.stopPropagation()
    if (moved) return
    onPlayerClick?.(id)
  }

  const handleCourtClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (readonly) return
    const svgEvent = event as unknown as React.PointerEvent<SVGSVGElement>
    onCourtClick?.(getPoint(svgEvent))
  }

  const activeDefenders = defensiveActions.map((action) => action.defender)

  return (
    <div className="court-grid rounded-[8px] border border-orange-200/15 bg-court/80 p-2 shadow-glow">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        role="img"
        aria-label="篮球半场战术板"
        className="block aspect-[3/4] w-full select-none rounded-[6px] bg-[#173227]"
        style={{ touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={handleCourtClick}
      >
        <defs>
          <marker id="pass-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#fb923c" />
          </marker>
          <marker id="move-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#38bdf8" />
          </marker>
          <marker id="transfer-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#a78bfa" />
          </marker>
          <marker id="defense-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#f43f5e" />
          </marker>
        </defs>

        <rect x="4" y="4" width="92" height="92" fill="none" stroke="#f8ead4" strokeWidth="0.8" />
        <line x1="4" y1="96" x2="96" y2="96" stroke="#f8ead4" strokeWidth="0.8" />
        <rect x="34" y="4" width="32" height="31" fill="none" stroke="#f8ead4" strokeWidth="0.75" />
        <rect x="42" y="4" width="16" height="19" fill="none" stroke="#f8ead4" strokeWidth="0.7" />
        <line x1="42" y1="23" x2="58" y2="23" stroke="#f8ead4" strokeWidth="0.75" />
        <path d="M34 35 A16 16 0 0 0 66 35" fill="none" stroke="#f8ead4" strokeWidth="0.75" />
        <path d="M16 4 A34 34 0 0 0 84 4" fill="none" stroke="#f8ead4" strokeWidth="0.75" />
        <path d="M34 96 A16 16 0 0 1 66 96" fill="none" stroke="#f8ead4" strokeWidth="0.65" opacity="0.75" />
        <line x1="42" y1="9" x2="58" y2="9" stroke="#f8ead4" strokeWidth="1.1" />
        <circle cx="50" cy="13" r="2.6" fill="none" stroke="#f97316" strokeWidth="1" />
        <line x1="50" y1="10" x2="50" y2="15.5" stroke="#f97316" strokeWidth="0.65" />

        {showOffenseActions && <g opacity="0.98">
          {actions.map((action, index) => (
            <ActionArrow key={action.id} action={action} showLabel={showAllLabels || index < 2} />
          ))}
        </g>}

        {showDefenseRotations && (
          <g opacity="0.95">
            {defensiveActions.map((action, index) => (
              <DefensiveArrow key={action.id} action={action} showLabel={showAllLabels || index < 2} />
            ))}
          </g>
        )}

        {showShotOptions && <g>
          {(showAllLabels ? shotOptions : shotOptions.slice(0, 2)).map((shot, index) => {
            const offsetX = index % 2 === 0 ? 5.8 : -8.8
            const offsetY = index % 2 === 0 ? -6.4 : 5.8
            const labelX = offsetX >= 0 ? 5.6 : -34

            return (
            <g key={shot.id} transform={`translate(${shot.position.x + offsetX} ${shot.position.y + offsetY})`}>
              <circle r="5.2" fill="#facc15" opacity="0.16" />
              <circle r="3.7" fill="none" stroke="#facc15" strokeWidth="1.2" strokeDasharray="1.4 1" />
              <path
                d="M0 -4.9 L1.25 -1.55 L4.75 -1.55 L1.9 .55 L3.05 4 L0 1.9 L-3.05 4 L-1.9 .55 L-4.75 -1.55 L-1.25 -1.55 Z"
                fill="#facc15"
              />
              <text x="5.6" y="-1.4" fontSize="3" fontWeight="900" fill="#fef3c7">
                SHOT
              </text>
              <rect x={labelX - 1} y="0.2" width="33" height="5.4" rx="1.4" fill="#0f172a" opacity="0.82" />
              <text x={labelX} y="4" fontSize="2.75" fontWeight="800" fill="#facc15">
                {shot.label}
              </text>
            </g>
          )})}
        </g>}

        {(Object.keys(players) as PlayerId[]).map((id) => (
          <PlayerMarker
            key={id}
            id={id}
            point={players[id]}
            selected={selectedPlayer === id}
            focused={focusPlayers.includes(id) || activeDefenders.includes(id)}
            hasBall={ballHandler === id}
            readonly={readonly}
            animated={animated}
            onPointerDown={handlePointerDown}
            onClick={handlePlayerClick}
          />
        ))}
      </svg>
    </div>
  )
}

function DefensiveArrow({ action, showLabel }: { action: DefensiveAction; showLabel: boolean }) {
  const midX = (action.from.x + action.to.x) / 2
  const midY = (action.from.y + action.to.y) / 2
  const label = action.type === 'closeout' ? 'CLOSEOUT' : action.type === 'help' ? 'HELP' : action.type === 'recover' ? 'RECOVER' : action.type === 'protect_rim' ? '护筐' : action.label

  return (
    <g>
      <line
        x1={action.from.x}
        y1={action.from.y}
        x2={action.to.x}
        y2={action.to.y}
        stroke="#f43f5e"
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeDasharray={action.type === 'closeout' ? '1.2 1.2' : '3 1.6'}
        markerEnd="url(#defense-arrow)"
      />
      {showLabel && (
        <g>
          <rect x={midX + 0.4} y={midY + 0.4} width={Math.min(29, label.length * 3 + 3)} height="5.4" rx="1.4" fill="#0f172a" opacity="0.84" />
          <text x={midX + 1.7} y={midY + 4.2} fontSize="2.75" fontWeight="900" fill="#fecdd3">
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

export default Court
