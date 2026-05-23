export type Point = {
  x: number
  y: number
}

export type PlayerId = '1' | '2' | '3' | '4' | '5' | 'X1' | 'X2' | 'X3' | 'X4' | 'X5'

export type DefenseFormation = '2-3' | '3-2' | '1-3-1' | 'man'

export type ActionType = 'pass' | 'transfer' | 'move' | 'screen'

export type ActionLine = {
  id: string
  type: ActionType
  from: Point
  to: Point
  player?: PlayerId
  label?: string
}

export type DefensiveAction = {
  id: string
  defender: PlayerId
  from: Point
  to: Point
  type: 'shift' | 'help' | 'closeout' | 'recover' | 'protect_rim'
  label: string
}

export type ShotOption = {
  id: string
  player: PlayerId
  position: Point
  label: string
  description: string
  priority: '第一选择' | '第二选择' | '备用选择'
  triggerReason: string
  relatedDefenders: PlayerId[]
}

export type MicroStep = {
  id: string
  text: string
  ballHandler: PlayerId
  players: Record<PlayerId, Point>
  actions: ActionLine[]
  defensiveActions: DefensiveAction[]
  shotOptions?: ShotOption[]
  focusPlayers?: PlayerId[]
  teachingPoint: string
  purpose?: string
  coachTip?: string
}

export type TacticStep = {
  id: string
  title: string
  text: string
  microSteps: MicroStep[]
}

export type Tactic = {
  id: string
  name: string
  defenseFormation: DefenseFormation
  category: string
  difficulty: '简单' | '中等' | '较难'
  tags: string[]
  description: string
  scenario: string
  keyPoints: string[]
  risks: string[]
  steps: TacticStep[]
}

export type CustomTactic = Tactic & {
  createdAt: string
  updatedAt: string
  isCustom: true
}

export type BoardMode = 'drag' | 'pass' | 'transfer' | 'move' | 'screen'
