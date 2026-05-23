import type { DefenseFormation, PlayerId, Point } from '../types/tactic'

export type FormationTemplate = {
  id: DefenseFormation
  name: string
  description: string
  basePositions: Record<PlayerId, Point>
  teachingPoints: string[]
}

const offenseShell: Record<'1' | '2' | '3' | '4' | '5', Point> = {
  '1': { x: 50, y: 82 },
  '2': { x: 20, y: 68 },
  '3': { x: 80, y: 68 },
  '4': { x: 32, y: 45 },
  '5': { x: 68, y: 45 },
}

export const formationTemplates: Record<DefenseFormation, FormationTemplate> = {
  '1-3-1': {
    id: '1-3-1',
    name: '1-3-1 联防',
    description: '顶部一人压迫持球，三人横向覆盖翼侧与中路，底线一人负责两个底角和短角。',
    basePositions: {
      ...offenseShell,
      X1: { x: 50, y: 68 },
      X2: { x: 25, y: 48 },
      X3: { x: 50, y: 45 },
      X4: { x: 75, y: 48 },
      X5: { x: 50, y: 28 },
    },
    teachingPoints: ['X1 负责弧顶压迫与回传干扰', 'X2/X4 控制两侧翼位与底角下沉', 'X3 留在中路保护罚球线和篮下', 'X5 是底线游动防守人'],
  },
  '2-3': {
    id: '2-3',
    name: '2-3 联防',
    description: '上线两人负责弧顶与两翼，底线三人保护底角、短角和篮下。',
    basePositions: {
      ...offenseShell,
      X1: { x: 40, y: 62 },
      X2: { x: 60, y: 62 },
      X3: { x: 25, y: 38 },
      X4: { x: 75, y: 38 },
      X5: { x: 50, y: 34 },
    },
    teachingPoints: ['X1/X2 是上线防守人', 'X3/X4 控制两侧底角和短角', 'X5 留在中路保护篮下', '进攻要攻击罚球线和底角空当'],
  },
  '3-2': {
    id: '3-2',
    name: '3-2 联防',
    description: '上线三人压迫外线，底线两人保护短角、篮板和底角轮转。',
    basePositions: {
      ...offenseShell,
      X1: { x: 25, y: 62 },
      X2: { x: 50, y: 62 },
      X3: { x: 75, y: 62 },
      X4: { x: 35, y: 36 },
      X5: { x: 65, y: 36 },
    },
    teachingPoints: ['X1/X2/X3 构成上线三人', 'X4/X5 是底线两名保护人', '弱点通常在底角和短角', '快速转移能拉扯上线三人'],
  },
  man: {
    id: 'man',
    name: '人盯人',
    description: '每名防守人对应一名进攻球员，随球压迫、弱侧收缩、强侧协防。',
    basePositions: {
      ...offenseShell,
      X1: { x: 50, y: 76 },
      X2: { x: 22, y: 62 },
      X3: { x: 78, y: 62 },
      X4: { x: 34, y: 42 },
      X5: { x: 66, y: 42 },
    },
    teachingPoints: ['X1 对位控卫持球人', '强侧贴防，弱侧收缩', '挡拆时需要沟通换防、延误或沉退', '突破发生后最近防守人先协防'],
  },
}

export const getFormationTemplate = (id: DefenseFormation) => formationTemplates[id]
