import type { ActionLine } from '../types/tactic'

type ActionArrowProps = {
  action: ActionLine
  showLabel?: boolean
}

function ActionArrow({ action, showLabel = true }: ActionArrowProps) {
  const midX = (action.from.x + action.to.x) / 2
  const midY = (action.from.y + action.to.y) / 2

  if (action.type === 'screen') {
    const dx = action.to.x - action.from.x
    const dy = action.to.y - action.from.y
    const angle = Math.atan2(dy, dx)
    const length = 4.8
    const px = Math.cos(angle + Math.PI / 2) * length
    const py = Math.sin(angle + Math.PI / 2) * length

    return (
      <g>
        <line
          x1={action.to.x - px}
          y1={action.to.y - py}
          x2={action.to.x + px}
          y2={action.to.y + py}
          stroke="#facc15"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1={action.from.x}
          y1={action.from.y}
          x2={action.to.x}
          y2={action.to.y}
          stroke="#facc15"
          strokeWidth="0.85"
          strokeDasharray="1.4 1.4"
          strokeLinecap="round"
        />
        {action.label && showLabel && (
          <g>
            <rect x={midX + 0.7} y={midY - 5.1} width={Math.min(30, action.label.length * 3 + 2)} height="5.4" rx="1.4" fill="#0f172a" opacity="0.82" />
            <text x={midX + 2} y={midY - 1.6} fontSize="3" fontWeight="800" fill="#facc15">
              {action.label}
            </text>
          </g>
        )}
      </g>
    )
  }

  const isPass = action.type === 'pass'
  const isTransfer = action.type === 'transfer'
  const stroke = isTransfer ? '#a78bfa' : isPass ? '#fb923c' : '#38bdf8'
  const marker = isTransfer ? 'url(#transfer-arrow)' : isPass ? 'url(#pass-arrow)' : 'url(#move-arrow)'
  const labelFill = isTransfer ? '#ddd6fe' : isPass ? '#fed7aa' : '#bae6fd'

  return (
    <g>
      <line
        x1={action.from.x}
        y1={action.from.y}
        x2={action.to.x}
        y2={action.to.y}
        stroke={stroke}
        strokeWidth={isPass || isTransfer ? 1.08 : 0.95}
        strokeLinecap="round"
        strokeDasharray={isPass || isTransfer ? undefined : '2.2 2'}
        markerEnd={marker}
      />
      {action.label && showLabel && (
        <g>
          <rect x={midX + 0.4} y={midY - 5} width={Math.min(30, action.label.length * 3 + 2)} height="5.4" rx="1.4" fill="#0f172a" opacity="0.82" />
          <text x={midX + 1.5} y={midY - 1.5} fontSize="3" fontWeight="800" fill={labelFill}>
            {action.label}
          </text>
        </g>
      )}
    </g>
  )
}

export default ActionArrow
