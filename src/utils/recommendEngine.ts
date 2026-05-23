import { tactics } from '../data/tactics'
import type { Tactic } from '../types/tactic'

export type Recommendation = {
  tacticName: string
  tacticId?: string
  confidence: number
  reason: string
  steps: string[]
  suitablePlayers: string[]
  risks: string[]
}

const get = (id: string) => tactics.find((tactic) => tactic.id === id)

const fromTactic = (id: string, confidence: number, reason: string): Recommendation => {
  const tactic = get(id) as Tactic
  return {
    tacticName: tactic.name,
    tacticId: tactic.id,
    confidence,
    reason,
    steps: tactic.steps.map((item) => item.text),
    suitablePlayers: tactic.tags.includes('高位策应')
      ? ['5号位高位策应中锋', '两侧底角投手', '控卫']
      : tactic.tags.includes('挡拆')
        ? ['控卫', '顺下内线', '弱侧射手']
        : ['控卫', '底角射手', '弱侧篮板手'],
    risks: tactic.risks,
  }
}

export const recommendTactic = (teamFeatures: string[], opponentFeatures: string[]): Recommendation => {
  const hasTeam = (feature: string) => teamFeatures.includes(feature)
  const hasOpponent = (feature: string) => opponentFeatures.includes(feature)

  if (hasOpponent('2-3联防') && hasTeam('有高位策应中锋')) {
    return fromTactic('zone-23-high-post', 94, '对方 2-3 联防的罚球线区域是关键空当，己方有高位策应中锋可以稳定接球分配。')
  }

  if (hasOpponent('2-3联防') && hasTeam('三分强')) {
    return fromTactic('zone-23-corner-skip', 90, '2-3 联防横移时底角容易短暂空出，三分强的阵容适合用快速转移制造投篮窗口。')
  }

  if (hasOpponent('中锋移动慢') && hasTeam('控卫突破强')) {
    return fromTactic('pnr-vs-slow-center', 92, '慢中锋很难同时处理控卫突破和内线顺下，高位挡拆能持续制造二打一。')
  }

  if (hasOpponent('协防慢') && hasTeam('控卫突破强')) {
    return fromTactic('drive-kick-slow-help', 88, '突破可以迫使协防收缩，协防慢会让底角和45度出现空位分球机会。')
  }

  if (hasOpponent('3-2联防') && hasTeam('球队速度快')) {
    return fromTactic('zone-32-quick-reversal', 87, '3-2 联防上层人数多但底角弱，快速转移能让防线来不及覆盖短角和底角。')
  }

  if (hasOpponent('1-3-1联防')) {
    return fromTactic('zone-131-corner-attack', 84, '1-3-1 联防容易在底角形成夹击风险，同时也暴露短角与弱侧反转机会。')
  }

  if (hasOpponent('人盯人') && hasTeam('控卫传球好')) {
    return fromTactic('horns-entry', 86, 'Horns 双高位给传球型控卫提供双侧掩护、顺下和弱侧转移选择。')
  }

  return {
    tacticName: '基础挡拆 + 弱侧拉开',
    confidence: 68,
    reason: '当前标签没有命中精准规则，建议先使用低失误、容易执行的基础挡拆，同时让弱侧射手拉开空间。',
    steps: ['1号和5号在弧顶发起挡拆。', '2号和3号站到底角拉开协防。', '根据防守选择突破、顺下或分球。'],
    suitablePlayers: ['控卫', '内线掩护者', '底角射手'],
    risks: ['如果投篮不稳定，对方可能收缩禁区。', '掩护角度不佳时控卫会被迫横向运球。'],
  }
}
