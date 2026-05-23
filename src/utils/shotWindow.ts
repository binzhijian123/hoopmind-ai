import type { DefensiveAction, ShotOption } from '../types/tactic'

const actionText: Record<DefensiveAction['type'], string> = {
  shift: '横移',
  help: '协防',
  closeout: 'closeout 扑防',
  recover: '回位',
  protect_rim: '护筐',
}

export function getShotWindowExplanation(shotOption: ShotOption): string {
  const defenders = shotOption.relatedDefenders.length > 0 ? shotOption.relatedDefenders.join('、') : '相关防守人'
  return `${shotOption.triggerReason} 该机会与 ${defenders} 的轮转有关，进攻方需要在防守到位前完成判断。`
}

export function isShotOptionCreatedByDefense(shotOption: ShotOption, defensiveActions: DefensiveAction[]): boolean {
  return defensiveActions.some(
    (action) =>
      shotOption.relatedDefenders.includes(action.defender) &&
      (action.type === 'closeout' || action.type === 'help' || action.type === 'recover'),
  )
}

export function describeDefensiveActions(defensiveActions: DefensiveAction[]): string {
  if (defensiveActions.length === 0) return '本小步防守保持站位，重点观察进攻落位。'
  return defensiveActions.map((action) => `${action.defender} ${actionText[action.type]}：${action.label}`).join('，')
}
