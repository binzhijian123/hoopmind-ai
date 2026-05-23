import { formationTemplates } from '../data/formationTemplates'
import type { PlayerId, Tactic } from '../types/tactic'

const defenders: PlayerId[] = ['X1', 'X2', 'X3', 'X4', 'X5']
const tolerance = 8

export function validateTacticFormation(tactic: Tactic): { valid: boolean; message: string } {
  const template = formationTemplates[tactic.defenseFormation]
  const firstMicroStep = tactic.steps[0]?.microSteps[0]

  if (!template || !firstMicroStep) {
    return { valid: false, message: '战术缺少防守阵型模板或第一个 microStep。' }
  }

  const mismatches = defenders.filter((id) => {
    const expected = template.basePositions[id]
    const actual = firstMicroStep.players[id]
    if (!expected || !actual) return true
    const distance = Math.hypot(actual.x - expected.x, actual.y - expected.y)
    return distance > tolerance
  })

  if (mismatches.length > 0) {
    const message = `当前战术防守站位与标注阵型不一致，请检查 tactics.ts。异常球员：${mismatches.join('、')}`
    console.warn(message, { tactic: tactic.id, formation: tactic.defenseFormation })
    return { valid: false, message }
  }

  return { valid: true, message: `${template.name} 站位校验通过。` }
}
