import type { DefensiveAction, MicroStep, PlayerId, Point, ShotOption, Tactic, TacticStep } from '../types/tactic'
import type { DefenseFormation } from '../types/tactic'
import { formationTemplates } from './formationTemplates'

const offensePositions: Record<PlayerId, Point> = {
  '1': { x: 50, y: 82 },
  '2': { x: 20, y: 68 },
  '3': { x: 80, y: 68 },
  '4': { x: 32, y: 45 },
  '5': { x: 68, y: 45 },
  X1: { x: 50, y: 76 },
  X2: { x: 22, y: 62 },
  X3: { x: 78, y: 62 },
  X4: { x: 34, y: 42 },
  X5: { x: 66, y: 42 },
}

export const initialPlayers: Record<PlayerId, Point> = formationTemplates.man.basePositions

let activeDefenseFormation: DefenseFormation = 'man'

const p = (players: Partial<Record<PlayerId, Point>> = {}): Record<PlayerId, Point> => ({
  ...offensePositions,
  ...formationTemplates[activeDefenseFormation].basePositions,
  ...players,
})

const defenders: PlayerId[] = ['X1', 'X2', 'X3', 'X4', 'X5']

type DraftShotOption = Omit<ShotOption, 'triggerReason' | 'relatedDefenders'> & Partial<Pick<ShotOption, 'triggerReason' | 'relatedDefenders'>>
type MicroExtra = Omit<Partial<MicroStep>, 'shotOptions'> & { shotOptions?: DraftShotOption[] }

const hasManualDefender = (players: Partial<Record<PlayerId, Point>>) => defenders.some((id) => Boolean(players[id]))

const sideOfBall = (players: Record<PlayerId, Point>, ballHandler: PlayerId) => {
  const point = players[ballHandler]
  if (!point) return 'center'
  if (point.x < 38) return 'left'
  if (point.x > 62) return 'right'
  return 'center'
}

const rotationFor = (players: Record<PlayerId, Point>, ballHandler: PlayerId): Partial<Record<PlayerId, Point>> => {
  const side = sideOfBall(players, ballHandler)

  if (activeDefenseFormation === '2-3') {
    if (side === 'left') return { X1: { x: 33, y: 58 }, X2: { x: 54, y: 62 }, X3: { x: 18, y: 36 }, X4: { x: 68, y: 38 }, X5: { x: 46, y: 32 } }
    if (side === 'right') return { X1: { x: 46, y: 62 }, X2: { x: 67, y: 58 }, X3: { x: 32, y: 38 }, X4: { x: 82, y: 36 }, X5: { x: 54, y: 32 } }
    return { X1: { x: 39, y: 59 }, X2: { x: 61, y: 59 }, X3: { x: 27, y: 38 }, X4: { x: 73, y: 38 }, X5: { x: 50, y: 31 } }
  }

  if (activeDefenseFormation === '3-2') {
    if (side === 'left') return { X1: { x: 18, y: 58 }, X2: { x: 43, y: 61 }, X3: { x: 70, y: 64 }, X4: { x: 24, y: 34 }, X5: { x: 58, y: 36 } }
    if (side === 'right') return { X1: { x: 30, y: 64 }, X2: { x: 57, y: 61 }, X3: { x: 82, y: 58 }, X4: { x: 42, y: 36 }, X5: { x: 76, y: 34 } }
    return { X1: { x: 25, y: 60 }, X2: { x: 50, y: 58 }, X3: { x: 75, y: 60 }, X4: { x: 35, y: 34 }, X5: { x: 65, y: 34 } }
  }

  if (activeDefenseFormation === '1-3-1') {
    if (side === 'left') return { X1: { x: 47, y: 68 }, X2: { x: 22, y: 45 }, X3: { x: 50, y: 43 }, X4: { x: 68, y: 47 }, X5: { x: 18, y: 34 } }
    if (side === 'right') return { X1: { x: 53, y: 68 }, X2: { x: 32, y: 47 }, X3: { x: 50, y: 43 }, X4: { x: 78, y: 45 }, X5: { x: 82, y: 34 } }
    return { X1: { x: 50, y: 66 }, X2: { x: 25, y: 48 }, X3: { x: 50, y: 43 }, X4: { x: 75, y: 48 }, X5: { x: 50, y: 28 } }
  }

  return {
    X1: { x: players['1'].x, y: Math.max(8, players['1'].y - 6) },
    X2: { x: players['2'].x + 2, y: Math.max(8, players['2'].y - 6) },
    X3: { x: players['3'].x - 2, y: Math.max(8, players['3'].y - 6) },
    X4: { x: players['4'].x + 2, y: Math.max(8, players['4'].y - 5) },
    X5: { x: players['5'].x - 2, y: Math.max(8, players['5'].y - 5) },
  }
}

const defensiveTypeFor = (id: PlayerId, to: Point, ballHandler: PlayerId): DefensiveAction['type'] => {
  if (to.y <= 34 && (id === 'X3' || id === 'X5')) return 'protect_rim'
  if (id === 'X5' && (to.x < 30 || to.x > 70)) return 'closeout'
  if ((id === 'X2' || id === 'X4') && (to.x < 34 || to.x > 66)) return 'help'
  if (id === `X${ballHandler}`) return 'closeout'
  return 'shift'
}

const labelForDefense = (type: DefensiveAction['type']) => {
  if (type === 'closeout') return 'CLOSEOUT'
  if (type === 'help') return 'HELP'
  if (type === 'recover') return 'RECOVER'
  if (type === 'protect_rim') return '护筐'
  return '轮转'
}

const defensiveActionsFrom = (players: Record<PlayerId, Point>, ballHandler: PlayerId, explicit: DefensiveAction[] = []): DefensiveAction[] => {
  if (explicit.length > 0) return explicit
  const base = formationTemplates[activeDefenseFormation].basePositions
  return defenders.flatMap((id) => {
    const from = base[id]
    const to = players[id]
    const distance = Math.hypot(from.x - to.x, from.y - to.y)
    if (distance < 1.5) return []
    const type = defensiveTypeFor(id, to, ballHandler)
    return [{ id: `def-${id}-${to.x}-${to.y}`, defender: id, from, to, type, label: labelForDefense(type) }]
  })
}

const enrichShots = (shots: DraftShotOption[] | undefined, defensiveActions: DefensiveAction[]): ShotOption[] => {
  if (!shots) return []
  const rotationDefenders = defensiveActions.map((action) => action.defender)
  return shots.map((shot) => {
    const relatedDefenders = shot.relatedDefenders?.length ? shot.relatedDefenders : rotationDefenders.slice(0, 2)
    const firstDefender = relatedDefenders[0] ?? 'X5'
    return {
      ...shot,
      relatedDefenders,
      triggerReason: shot.triggerReason ?? `该机会来自 ${firstDefender} 的轮转距离和补防时间差。`,
    }
  })
}

const micro = (
  id: string,
  text: string,
  players: Partial<Record<PlayerId, Point>>,
  actions: MicroStep['actions'] = [],
  extra: MicroExtra = {},
): MicroStep => ({
  ...(() => {
    const ballHandler = extra.ballHandler ?? '1'
    const basePlayers = p(players)
    const shouldRotate = !hasManualDefender(players) && (actions.length > 0 || Boolean(extra.shotOptions?.length))
    const finalPlayers = shouldRotate ? { ...basePlayers, ...rotationFor(basePlayers, ballHandler) } : basePlayers
    const defensiveActions = defensiveActionsFrom(finalPlayers, ballHandler, extra.defensiveActions)
    return {
      id,
      text,
      ballHandler,
      players: finalPlayers,
      actions,
      defensiveActions,
      focusPlayers: extra.focusPlayers ?? [],
      shotOptions: enrichShots(extra.shotOptions, defensiveActions),
      teachingPoint: extra.teachingPoint ?? extra.purpose ?? '观察进攻动作如何触发防守轮转，并寻找防守到位前的出手机会。',
      purpose: extra.purpose,
      coachTip: extra.coachTip,
    }
  })(),
})

const step = (id: string, title: string, text: string, microSteps: MicroStep[]): TacticStep => ({
  id,
  title,
  text,
  microSteps,
})

export const tactics: Tactic[] = [
  (activeDefenseFormation = '2-3', {
    id: 'zone-23-high-post',
    name: '高位中锋策应破 2-3 联防',
    defenseFormation: '2-3',
    category: '破2-3联防',
    difficulty: '中等',
    tags: ['破联防', '内线', '高位策应'],
    description: '把 5 号位放到罚球线区域，迫使 2-3 联防中路收缩后分球到底角或顺下。',
    scenario: '对方采用 2-3 联防，己方有能接球、观察和传球的高位中锋。',
    keyPoints: ['5 号位站住罚球线接球点', '底角同时拉开宽度', '弱侧球员准备空切或接球投篮'],
    risks: ['高位接球被夹击时要快速出球', '底角投手站位过浅会被底线防守覆盖'],
    steps: [
      step('hp-s1', 'Step 1：初始站位与发动', '先把 5 号移动到高位，让 2-3 联防中路出现责任冲突。', [
        micro('hp-1-1', '1号位弧顶持球，2号和3号分别站在两侧外线，观察联防上线位置。', {}, [], {
          ballHandler: '1',
          focusPlayers: ['1', '2', '3'],
          purpose: '确认 2-3 联防上线站位，准备把球送入罚球线区域。',
          coachTip: '1号不要急着横传，先让队友完成落位。',
        }),
        micro('hp-1-2', '5号从右肘区移动到罚球线，成为高位策应点。', { '5': { x: 50, y: 48 } }, [
          { id: 'hp-a1', type: 'move', player: '5', from: { x: 68, y: 45 }, to: { x: 50, y: 48 }, label: '上提接应' },
        ], {
          ballHandler: '1',
          focusPlayers: ['5'],
          purpose: '把 X4 拉到罚球线附近，压缩联防中间层。',
          coachTip: '5号接球点要站稳，不要站到三分线外。',
        }),
        micro('hp-1-3', '4号移动到弱侧短角区，准备接 5 号传球或冲抢篮板。', { '5': { x: 50, y: 48 }, '4': { x: 36, y: 32 } }, [
          { id: 'hp-a2', type: 'move', player: '4', from: { x: 32, y: 45 }, to: { x: 36, y: 32 }, label: '短角接应' },
        ], {
          ballHandler: '1',
          focusPlayers: ['4', '5'],
          purpose: '弱侧短角制造底线防守的第二个压力点。',
          coachTip: '4号不要站进禁区，保持传球角度。',
        }),
      ]),
      step('hp-s2', 'Step 2：高位策应', '1 号把球送给高位 5 号，两侧底角同步拉开。', [
        micro('hp-2-1', '1号传球给5号，5号在罚球线接球面框。', { '5': { x: 50, y: 48 }, '4': { x: 36, y: 32 } }, [
          { id: 'hp-a3', type: 'pass', player: '1', from: { x: 50, y: 82 }, to: { x: 50, y: 48 }, label: '高位策应' },
        ], {
          ballHandler: '5',
          focusPlayers: ['1', '5'],
          purpose: '让 5 号成为中转站，迫使上线和内线同时判断。',
          coachTip: '5号接球后先抬头看底角，再看弱侧切入。',
        }),
        micro('hp-2-2', '2号和3号同时落到底角，拉开底线防守。', { '5': { x: 50, y: 48 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 }, '4': { x: 36, y: 32 } }, [
          { id: 'hp-a4', type: 'move', player: '2', from: { x: 20, y: 68 }, to: { x: 12, y: 38 }, label: '底角拉开' },
          { id: 'hp-a5', type: 'move', player: '3', from: { x: 80, y: 68 }, to: { x: 88, y: 38 }, label: '弱侧底角' },
        ], {
          ballHandler: '5',
          focusPlayers: ['2', '3', '5'],
          purpose: '扩大联防横向距离，等待底线防守收缩后的底角机会。',
          coachTip: '底角队员脚尖对篮筐，接球即可投。',
        }),
      ]),
      step('hp-s3', 'Step 3：出手机会判断', '根据 X4 和 X5 的补防选择中投、底角三分或弱侧空切。', [
        micro('hp-3-1', '如果 X4 不上提，5号可以直接罚球线中投。', { '5': { x: 50, y: 48 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 }, '4': { x: 36, y: 32 } }, [], {
          ballHandler: '5',
          focusPlayers: ['5'],
          shotOptions: [{ id: 'hp-shot-1', player: '5', position: { x: 50, y: 48 }, label: '出手机会1：罚球线中投', description: '中间防守不上提时，5号面框直接中投。', priority: '第一选择' }],
          purpose: '惩罚联防中间层不敢上提。',
          coachTip: '5号投篮前不要多运，接球停稳后直接出手。',
        }),
        micro('hp-3-2', '如果底线防守收缩，5号传给底角2号或3号。', { '5': { x: 50, y: 48 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 }, '4': { x: 43, y: 28 } }, [
          { id: 'hp-a6', type: 'pass', player: '5', from: { x: 50, y: 48 }, to: { x: 88, y: 38 }, label: '底角三分' },
          { id: 'hp-a7', type: 'move', player: '4', from: { x: 36, y: 32 }, to: { x: 43, y: 28 }, label: '弱侧空切' },
        ], {
          ballHandler: '3',
          focusPlayers: ['3', '4', '5'],
          shotOptions: [
            { id: 'hp-shot-2', player: '3', position: { x: 88, y: 38 }, label: '出手机会2：底角三分', description: '底线防守收缩时，3号底角接球投篮。', priority: '第一选择' },
            { id: 'hp-shot-3', player: '4', position: { x: 43, y: 28 }, label: '出手机会3：空切上篮', description: '弱侧防守盯底角时，4号从短角切入篮下。', priority: '备用选择' },
          ],
          purpose: '用 5 号传球同时威胁底角和弱侧篮下。',
          coachTip: '底角没空位时，立刻看 4 号短角空切。',
        }),
      ]),
    ],
  }),
  (activeDefenseFormation = '2-3', {
    id: 'zone-23-corner-skip',
    name: '底角转移三分破 2-3 联防',
    defenseFormation: '2-3',
    category: '破2-3联防',
    difficulty: '中等',
    tags: ['破联防', '三分', '转移球'],
    description: '通过强侧吸引和弱侧大范围转移制造底角三分机会。',
    scenario: '对方 2-3 联防横移慢，己方两侧底角投篮稳定。',
    keyPoints: ['强侧先压缩防守', '转移球要快且高', '弱侧底角提前准备接球投篮'],
    risks: ['横传距离长，传球质量差容易被抢断', '弱侧投手不能过早暴露意图'],
    steps: [
      step('cs-s1', 'Step 1：强侧吸引', '先把防守拉向右侧，再准备反向转移。', [
        micro('cs-1-1', '1号带球到右侧45度，3号压到底角，强侧形成持球威胁。', { '1': { x: 65, y: 75 }, '3': { x: 88, y: 36 } }, [
          { id: 'cs-a1', type: 'move', player: '1', from: { x: 50, y: 82 }, to: { x: 65, y: 75 }, label: '强侧推进' },
        ], { ballHandler: '1', focusPlayers: ['1', '3'], purpose: '让 2-3 联防整体向右侧收缩。', coachTip: '1号要让防守相信强侧会直接进攻。' }),
        micro('cs-1-2', '4号上提到罚球线延长线，成为转移球中转点。', { '1': { x: 65, y: 75 }, '3': { x: 88, y: 36 }, '4': { x: 48, y: 55 } }, [
          { id: 'cs-a2', type: 'move', player: '4', from: { x: 32, y: 45 }, to: { x: 48, y: 55 }, label: '中转接应' },
        ], { ballHandler: '1', focusPlayers: ['1', '4'], purpose: '缩短横传距离，避免直接 skip pass 被断。', coachTip: '4号接球点不能太低，否则角度被底线防守封住。' }),
      ]),
      step('cs-s2', 'Step 2：弱侧提前落位', '弱侧射手先到底角，等强侧防守移动后接球。', [
        micro('cs-2-1', '1号传给4号，2号从左45度下沉到底角。', { '1': { x: 65, y: 75 }, '4': { x: 48, y: 55 }, '2': { x: 12, y: 36 }, '3': { x: 88, y: 36 } }, [
          { id: 'cs-a3', type: 'pass', player: '1', from: { x: 65, y: 75 }, to: { x: 48, y: 55 }, label: '转移中点' },
          { id: 'cs-a4', type: 'move', player: '2', from: { x: 20, y: 68 }, to: { x: 12, y: 36 }, label: '底角拉开' },
        ], { ballHandler: '4', focusPlayers: ['2', '4'], purpose: '让弱侧底角提前形成接球空间。', coachTip: '2号要在球到达前完成脚步准备。' }),
        micro('cs-2-2', '5号卡住弱侧篮板位，准备投篮后的二次进攻。', { '1': { x: 65, y: 75 }, '4': { x: 48, y: 55 }, '2': { x: 12, y: 36 }, '3': { x: 88, y: 36 }, '5': { x: 42, y: 28 } }, [
          { id: 'cs-a5', type: 'move', player: '5', from: { x: 68, y: 45 }, to: { x: 42, y: 28 }, label: '弱侧篮板' },
        ], { ballHandler: '4', focusPlayers: ['2', '5'], purpose: '给底角三分配置篮板保护。', coachTip: '5号不要堵住底角传球路线。' }),
      ]),
      step('cs-s3', 'Step 3：skip pass 后处理', '4号快速传到底角，射手根据扑防做投篮或突破。', [
        micro('cs-3-1', '4号斜传左底角，2号接球出手三分。', { '4': { x: 48, y: 55 }, '2': { x: 12, y: 36 }, '5': { x: 42, y: 28 }, '3': { x: 88, y: 36 } }, [
          { id: 'cs-a6', type: 'pass', player: '4', from: { x: 48, y: 55 }, to: { x: 12, y: 36 }, label: 'skip pass' },
        ], {
          ballHandler: '2',
          focusPlayers: ['2', '4'],
          shotOptions: [{ id: 'cs-shot-1', player: '2', position: { x: 12, y: 36 }, label: '出手机会1：弱侧底角三分', description: '联防横移慢时，2号底角接球直接投。', priority: '第一选择' }],
          purpose: '直接惩罚联防横向轮转慢。',
          coachTip: '2号接球后只看篮筐，不要再多余调整。',
        }),
        micro('cs-3-2', '如果防守扑到底角，2号向底线突破，3号在右45度准备二次三分。', { '2': { x: 25, y: 26 }, '3': { x: 76, y: 58 }, '4': { x: 48, y: 55 }, '5': { x: 42, y: 28 } }, [
          { id: 'cs-a7', type: 'move', player: '2', from: { x: 12, y: 36 }, to: { x: 25, y: 26 }, label: '扑防后突破' },
          { id: 'cs-a8', type: 'pass', player: '2', from: { x: 25, y: 26 }, to: { x: 76, y: 58 }, label: '回传45度' },
        ], {
          ballHandler: '3',
          focusPlayers: ['2', '3'],
          shotOptions: [
            { id: 'cs-shot-2', player: '3', position: { x: 76, y: 58 }, label: '出手机会2：45度三分', description: '底角被扑出后，3号接回传投篮。', priority: '第二选择' },
            { id: 'cs-shot-3', player: '2', position: { x: 25, y: 26 }, label: '出手机会3：底线突破', description: '扑防过猛时，2号沿底线攻击篮下。', priority: '备用选择' },
          ],
          purpose: '把防守扑防转化为二次进攻机会。',
          coachTip: '底角突破时第一眼看篮筐，第二眼看45度回传。',
        }),
      ]),
    ],
  }),
  (activeDefenseFormation = 'man', {
    id: 'drive-kick-slow-help',
    name: '突破分球打协防慢',
    defenseFormation: 'man',
    category: '人盯人',
    difficulty: '简单',
    tags: ['突破', '分球', '外线'],
    description: '利用控卫第一步突破迫使协防收缩，再把球分给空位射手。',
    scenario: '对方人盯人协防慢或轮转沟通差，己方控卫突破强。',
    keyPoints: ['突破要攻击两名防守之间', '底角和45度保持传球视野', '接球后果断投或再突破'],
    risks: ['突破过深容易被封堵', '外线站位太近会压缩突破路线'],
    steps: [
      step('dk-s1', 'Step 1：拉开突破空间', '四名无球队员保持间距，给 1 号制造突破通道。', [
        micro('dk-1-1', '1号弧顶持球，2号和3号站在两侧45度，4号和5号压低站位。', {}, [], { ballHandler: '1', focusPlayers: ['1'], purpose: '让禁区中路有足够突破空间。', coachTip: '外线不要站太近，避免防守一人守两点。' }),
        micro('dk-1-2', '3号下沉到右底角，给1号右路突破腾出45度区域。', { '3': { x: 86, y: 38 } }, [
          { id: 'dk-a1', type: 'move', player: '3', from: { x: 80, y: 68 }, to: { x: 86, y: 38 }, label: '底角拉开' },
        ], { ballHandler: '1', focusPlayers: ['1', '3'], purpose: '右侧形成清晰突破与分球角度。', coachTip: '3号移动时要保持能接球投篮的身体朝向。' }),
      ]),
      step('dk-s2', 'Step 2：突破吸引协防', '1 号攻击禁区，观察 X4 或 X5 是否补防。', [
        micro('dk-2-1', '1号从右侧突破到罚球线以下，逼迫协防收缩。', { '1': { x: 62, y: 48 }, '3': { x: 86, y: 38 } }, [
          { id: 'dk-a2', type: 'move', player: '1', from: { x: 50, y: 82 }, to: { x: 62, y: 48 }, label: '强突' },
        ], {
          ballHandler: '1',
          focusPlayers: ['1'],
          shotOptions: [{ id: 'dk-shot-1', player: '1', position: { x: 62, y: 48 }, label: '出手机会1：突破上篮', description: '协防不到位时，1号继续攻篮。', priority: '第一选择' }],
          purpose: '先威胁篮筐，迫使弱侧防守做选择。',
          coachTip: '突破不是为了传球而传球，先看自己能不能上篮。',
        }),
        micro('dk-2-2', '如果 X5 收缩，右底角3号出现空位。', { '1': { x: 62, y: 48 }, '3': { x: 86, y: 38 }, '2': { x: 18, y: 58 } }, [
          { id: 'dk-a3', type: 'pass', player: '1', from: { x: 62, y: 48 }, to: { x: 86, y: 38 }, label: '突破分球' },
        ], {
          ballHandler: '3',
          focusPlayers: ['1', '3'],
          shotOptions: [{ id: 'dk-shot-2', player: '3', position: { x: 86, y: 38 }, label: '出手机会2：底角三分', description: '协防收缩后，3号底角空位投篮。', priority: '第一选择' }],
          purpose: '用突破制造最简单的底角空位。',
          coachTip: '1号分球要传到3号投篮手侧。',
        }),
      ]),
      step('dk-s3', 'Step 3：弱侧二次选择', '底角被补防时，再找弱侧45度或篮板冲抢。', [
        micro('dk-3-1', '2号站在弱侧45度，接3号快速转移投三分。', { '1': { x: 62, y: 48 }, '3': { x: 86, y: 38 }, '2': { x: 18, y: 58 }, '4': { x: 38, y: 30 } }, [
          { id: 'dk-a4', type: 'pass', player: '3', from: { x: 86, y: 38 }, to: { x: 18, y: 58 }, label: '弱侧转移' },
          { id: 'dk-a5', type: 'move', player: '4', from: { x: 32, y: 45 }, to: { x: 38, y: 30 }, label: '冲篮板' },
        ], {
          ballHandler: '2',
          focusPlayers: ['2', '4'],
          shotOptions: [{ id: 'dk-shot-3', player: '2', position: { x: 18, y: 58 }, label: '出手机会3：弱侧45度三分', description: '底角被扑防后，弱侧45度接转移球出手。', priority: '第二选择' }],
          purpose: '让防守连续轮转，找到第二个空位。',
          coachTip: '3号如果被扑，不要停球，马上转弱侧。',
        }),
      ]),
    ],
  }),
  (activeDefenseFormation = 'man', {
    id: 'pnr-vs-slow-center',
    name: '挡拆顺下打中锋移动慢',
    defenseFormation: 'man',
    category: '挡拆',
    difficulty: '中等',
    tags: ['挡拆', '内线', '突破'],
    description: '5号高位掩护后顺下，惩罚移动慢的对方中锋。',
    scenario: '对方中锋移动慢，后卫挤掩护能力一般，己方控卫突破强。',
    keyPoints: ['掩护角度要迫使防守绕远', '控卫先威胁突破再传顺下', '弱侧保持空间避免补防太早'],
    risks: ['掩护犯规会直接中断进攻', '弱侧不拉开会堵住顺下路线'],
    steps: [
      step('pnr-s1', 'Step 1：建立挡拆角度', '5号上提到弧顶右侧，2号和3号拉到底角。', [
        micro('pnr-1-1', '5号从右肘区上提，为1号设置高位掩护。', { '5': { x: 58, y: 72 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 } }, [
          { id: 'pnr-a1', type: 'move', player: '5', from: { x: 68, y: 45 }, to: { x: 58, y: 72 }, label: '上提掩护' },
          { id: 'pnr-a2', type: 'screen', player: '5', from: { x: 58, y: 72 }, to: { x: 64, y: 72 }, label: '挡拆' },
        ], { ballHandler: '1', focusPlayers: ['1', '5'], purpose: '让慢中锋必须上提处理挡拆。', coachTip: '5号站定后再掩护，避免移动掩护犯规。' }),
      ]),
      step('pnr-s2', 'Step 2：控卫借掩护攻击', '1号从5号肩膀旁通过，先看自己中距离。', [
        micro('pnr-2-1', '1号借掩护向右突破，慢中锋退防时出现急停空间。', { '1': { x: 66, y: 55 }, '5': { x: 58, y: 72 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 } }, [
          { id: 'pnr-a3', type: 'move', player: '1', from: { x: 50, y: 82 }, to: { x: 66, y: 55 }, label: '借掩护' },
        ], {
          ballHandler: '1',
          focusPlayers: ['1'],
          shotOptions: [{ id: 'pnr-shot-1', player: '1', position: { x: 66, y: 55 }, label: '出手机会1：急停中距离', description: '中锋沉退时，1号在罚球线延长区急停。', priority: '第一选择' }],
          purpose: '先用持球威胁迫使防守收缩。',
          coachTip: '1号通过掩护后肩膀要贴近5号，别给防守挤过空间。',
        }),
        micro('pnr-2-2', '5号立即转身顺下，攻击篮筐正面。', { '1': { x: 66, y: 55 }, '5': { x: 55, y: 34 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 } }, [
          { id: 'pnr-a4', type: 'move', player: '5', from: { x: 58, y: 72 }, to: { x: 55, y: 34 }, label: '顺下' },
        ], { ballHandler: '1', focusPlayers: ['1', '5'], purpose: '让慢中锋在控卫和顺下之间二选一。', coachTip: '5号顺下路线要直，不要漂到弱侧。' }),
      ]),
      step('pnr-s3', 'Step 3：顺下与弱侧投篮', '根据补防选择传顺下或弱侧射手。', [
        micro('pnr-3-1', '1号击地传给顺下5号，5号篮下终结。', { '1': { x: 66, y: 55 }, '5': { x: 55, y: 34 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 } }, [
          { id: 'pnr-a5', type: 'pass', player: '1', from: { x: 66, y: 55 }, to: { x: 55, y: 34 }, label: '顺下传球' },
        ], {
          ballHandler: '5',
          focusPlayers: ['1', '5'],
          shotOptions: [{ id: 'pnr-shot-2', player: '5', position: { x: 55, y: 34 }, label: '出手机会2：顺下上篮', description: '中锋移动慢时，5号顺下接球上篮。', priority: '第一选择' }],
          purpose: '把挡拆优势转化为近筐终结。',
          coachTip: '传球要提前给到5号前进路线，不要传到身后。',
        }),
        micro('pnr-3-2', '弱侧收缩补5号时，1号跳传给3号底角。', { '1': { x: 66, y: 55 }, '5': { x: 55, y: 34 }, '3': { x: 88, y: 38 }, '2': { x: 12, y: 38 } }, [
          { id: 'pnr-a6', type: 'pass', player: '1', from: { x: 66, y: 55 }, to: { x: 88, y: 38 }, label: '弱侧分球' },
        ], {
          ballHandler: '3',
          focusPlayers: ['1', '3', '5'],
          shotOptions: [{ id: 'pnr-shot-3', player: '3', position: { x: 88, y: 38 }, label: '出手机会3：弱侧投篮', description: '弱侧防守补顺下时，3号底角接球投篮。', priority: '备用选择' }],
          purpose: '惩罚协防收缩，保持外线空间价值。',
          coachTip: '3号要站在底角深处，给1号最大传球角度。',
        }),
      ]),
    ],
  }),
  (activeDefenseFormation = '3-2', {
    id: 'zone-32-quick-reversal',
    name: '快速转移球破 3-2 联防',
    defenseFormation: '3-2',
    category: '破3-2联防',
    difficulty: '中等',
    tags: ['破联防', '快攻', '转移球'],
    description: '连续左右转移调动 3-2 联防上层，攻击底角和短角空当。',
    scenario: '对方 3-2 联防外线上压，底角保护不足，己方转移速度快。',
    keyPoints: ['传球比运球更快', '底角接球后观察短角', '中锋在短角准备接应'],
    risks: ['慢传会让上层防守恢复', '底角被夹击时必须有回传点'],
    steps: [
      step('qr-s1', 'Step 1：右侧牵制', '先把球送到右侧，让3-2联防上层移动。', [
        micro('qr-1-1', '1号传给右侧2号，5号移动到右短角。', { '2': { x: 75, y: 62 }, '5': { x: 78, y: 32 } }, [
          { id: 'qr-a1', type: 'pass', player: '1', from: { x: 50, y: 82 }, to: { x: 75, y: 62 }, label: '右侧转移' },
          { id: 'qr-a2', type: 'move', player: '5', from: { x: 68, y: 45 }, to: { x: 78, y: 32 }, label: '短角接应' },
        ], { ballHandler: '2', focusPlayers: ['2', '5'], purpose: '攻击 3-2 联防底角与短角之间的空当。', coachTip: '2号接球后先看短角5号。' }),
      ]),
      step('qr-s2', 'Step 2：快速反转', '球回到弧顶后马上转向左侧，不给上层防守恢复时间。', [
        micro('qr-2-1', '2号回传1号，1号不停球转给左侧3号。', { '2': { x: 75, y: 62 }, '5': { x: 78, y: 32 }, '3': { x: 15, y: 40 } }, [
          { id: 'qr-a3', type: 'pass', player: '2', from: { x: 75, y: 62 }, to: { x: 50, y: 82 }, label: '回传' },
          { id: 'qr-a4', type: 'pass', player: '1', from: { x: 50, y: 82 }, to: { x: 15, y: 40 }, label: '快速反转' },
        ], {
          ballHandler: '3',
          focusPlayers: ['1', '2', '3'],
          shotOptions: [{ id: 'qr-shot-1', player: '3', position: { x: 15, y: 40 }, label: '出手机会1：底角三分', description: '3-2 联防反转慢时，左底角出现投篮窗口。', priority: '第一选择' }],
          purpose: '用连续传球拉扯上层三名防守。',
          coachTip: '1号接球后不要停顿，球要比防守移动更快。',
        }),
      ]),
      step('qr-s3', 'Step 3：短角与弱侧空切', '底角被扑防后，4号和5号分别攻击中投与弱侧篮下。', [
        micro('qr-3-1', '4号移动到罚球线附近，接3号回传中投。', { '3': { x: 15, y: 40 }, '4': { x: 48, y: 48 }, '5': { x: 78, y: 32 } }, [
          { id: 'qr-a5', type: 'move', player: '4', from: { x: 32, y: 45 }, to: { x: 48, y: 48 }, label: '高位接应' },
          { id: 'qr-a6', type: 'pass', player: '3', from: { x: 15, y: 40 }, to: { x: 48, y: 48 }, label: '高位中投' },
        ], {
          ballHandler: '4',
          focusPlayers: ['3', '4'],
          shotOptions: [{ id: 'qr-shot-2', player: '4', position: { x: 48, y: 48 }, label: '出手机会2：高位中投', description: '底角被扑时，4号在罚球线附近接球投篮。', priority: '第二选择' }],
          purpose: '让底角扑防付出中路空当代价。',
          coachTip: '4号接球要面向篮筐，准备直接投或转移。',
        }),
        micro('qr-3-2', '5号从右短角弱侧空切，接4号传球上篮。', { '4': { x: 48, y: 48 }, '5': { x: 56, y: 25 }, '3': { x: 15, y: 40 } }, [
          { id: 'qr-a7', type: 'move', player: '5', from: { x: 78, y: 32 }, to: { x: 56, y: 25 }, label: '弱侧空切' },
          { id: 'qr-a8', type: 'pass', player: '4', from: { x: 48, y: 48 }, to: { x: 56, y: 25 }, label: '内传' },
        ], {
          ballHandler: '5',
          focusPlayers: ['4', '5'],
          shotOptions: [{ id: 'qr-shot-3', player: '5', position: { x: 56, y: 25 }, label: '出手机会3：弱侧空切', description: '弱侧底线无人盯防时，5号切入篮下。', priority: '备用选择' }],
          purpose: '在联防视线转向球侧时攻击背后。',
          coachTip: '5号切入时机要在4号接球抬头的一瞬间。',
        }),
      ]),
    ],
  }),
  (activeDefenseFormation = '1-3-1', {
    id: 'zone-131-corner-attack',
    name: '底角攻击破 1-3-1 联防',
    defenseFormation: '1-3-1',
    category: '破1-3-1联防',
    difficulty: '较难',
    tags: ['破联防', '底角', '内线'],
    description: '用底角和短角夹击 1-3-1 的边线弱点，迫使底线防守二选一。',
    scenario: '对方 1-3-1 联防边线压迫强，但底角与短角连接保护不足。',
    keyPoints: ['底角接球后不要停球太久', '短角球员必须露出传球窗口', '弱侧45度准备反转'],
    risks: ['边线容易被陷阱夹击', '传短角角度不清晰会被底线防守破坏'],
    steps: [
      step('ca-s1', 'Step 1：攻击边线', '把球送到右侧，诱导 1-3-1 边线夹击。', [
        micro('ca-1-0', '标准 1-3-1 联防站位：X1 在顶部，X2 左翼，X3 中路，X4 右翼，X5 底线保护。', {}, [], {
          ballHandler: '1',
          focusPlayers: ['1'],
          purpose: '先确认标题中的 1-3-1 阵型站位，避免把该战术误讲成 2-3 或 3-2。',
          coachTip: '讲解 1-3-1 时，先强调 X5 是底线游动人，X3 才是中路保护人。',
        }),
        micro('ca-1-1', '1号传给右侧3号，5号站到右短角。', { '3': { x: 82, y: 58 }, '5': { x: 78, y: 32 }, '2': { x: 20, y: 60 }, X1: { x: 50, y: 68 }, X2: { x: 25, y: 48 }, X3: { x: 50, y: 45 }, X4: { x: 76, y: 52 }, X5: { x: 57, y: 30 } }, [
          { id: 'ca-a1', type: 'pass', player: '1', from: { x: 50, y: 82 }, to: { x: 82, y: 58 }, label: '边线传球' },
          { id: 'ca-a2', type: 'move', player: '5', from: { x: 68, y: 45 }, to: { x: 78, y: 32 }, label: '短角接应' },
        ], { ballHandler: '3', focusPlayers: ['3', '5'], purpose: '迫使边线防守和底线防守同时处理强侧。', coachTip: '3号接球后要保护球，别被边线夹击逼停。' }),
      ]),
      step('ca-s2', 'Step 2：底角与短角二选一', '3号下到底角，5号短角接应，制造底线防守选择题。', [
        micro('ca-2-1', '3号向底角移动，获得第一投篮窗口。', { '3': { x: 90, y: 36 }, '5': { x: 78, y: 32 }, '2': { x: 20, y: 60 }, X1: { x: 50, y: 68 }, X2: { x: 32, y: 46 }, X3: { x: 50, y: 45 }, X4: { x: 78, y: 46 }, X5: { x: 82, y: 34 } }, [
          { id: 'ca-a3', type: 'move', player: '3', from: { x: 82, y: 58 }, to: { x: 90, y: 36 }, label: '底角攻击' },
        ], {
          ballHandler: '3',
          focusPlayers: ['3'],
          shotOptions: [{ id: 'ca-shot-1', player: '3', position: { x: 90, y: 36 }, label: '出手机会1：底角三分', description: '底线防守没有及时上提时，3号直接投。', priority: '第一选择' }],
          purpose: '用底角位置打 1-3-1 的边角弱点。',
          coachTip: '底角接球后最多一拍，不能让夹击形成。',
        }),
        micro('ca-2-2', '如果底线防守扑底角，3号传给短角5号中投。', { '3': { x: 90, y: 36 }, '5': { x: 70, y: 30 }, '2': { x: 20, y: 60 }, X1: { x: 50, y: 68 }, X2: { x: 32, y: 46 }, X3: { x: 50, y: 45 }, X4: { x: 80, y: 42 }, X5: { x: 88, y: 35 } }, [
          { id: 'ca-a4', type: 'pass', player: '3', from: { x: 90, y: 36 }, to: { x: 70, y: 30 }, label: '短角' },
        ], {
          ballHandler: '5',
          focusPlayers: ['3', '5'],
          shotOptions: [{ id: 'ca-shot-2', player: '5', position: { x: 70, y: 30 }, label: '出手机会2：短角中投', description: '底线防守扑出去时，5号短角空位。', priority: '第二选择' }],
          purpose: '让底线防守离开篮下后暴露短角。',
          coachTip: '5号短角接球不要下球，直接投或传篮下。',
        }),
      ]),
      step('ca-s3', 'Step 3：背切惩罚夹击', '夹击形成后，弱侧球员背切到篮下。', [
        micro('ca-3-1', '2号从弱侧45度背切，5号内传篮下。', { '3': { x: 90, y: 36 }, '5': { x: 70, y: 30 }, '2': { x: 50, y: 24 }, X1: { x: 50, y: 68 }, X2: { x: 36, y: 43 }, X3: { x: 50, y: 38 }, X4: { x: 80, y: 42 }, X5: { x: 84, y: 34 } }, [
          { id: 'ca-a5', type: 'move', player: '2', from: { x: 20, y: 60 }, to: { x: 50, y: 24 }, label: '篮下背切' },
          { id: 'ca-a6', type: 'pass', player: '5', from: { x: 70, y: 30 }, to: { x: 50, y: 24 }, label: '短传' },
        ], {
          ballHandler: '2',
          focusPlayers: ['2', '5'],
          shotOptions: [{ id: 'ca-shot-3', player: '2', position: { x: 50, y: 24 }, label: '出手机会3：篮下背切', description: '弱侧顶部防守看球时，2号背切上篮。', priority: '备用选择' }],
          purpose: '利用 1-3-1 防守看球夹击后的身后空间。',
          coachTip: '2号背切必须果断，慢了就会被中间防守恢复。',
        }),
      ]),
    ],
  }),
  (activeDefenseFormation = 'man', {
    id: 'horns-entry',
    name: 'Horns 高位双掩护进攻',
    defenseFormation: 'man',
    category: '基础进攻',
    difficulty: '中等',
    tags: ['挡拆', '高位策应', '人盯人'],
    description: '4号和5号双高位落位，给控卫提供左右两侧掩护与策应选择。',
    scenario: '对方人盯人，己方控卫传球好，两个内线具备掩护和短传能力。',
    keyPoints: ['双内线站位对称', '控卫读防守选择方向', '弱侧射手不要提前内收'],
    risks: ['两名内线距离过近会堵塞突破路线', '外线不拉开会让协防更容易'],
    steps: [
      step('ho-s1', 'Step 1：Horns 落位', '4号和5号同时到两个肘区，底角射手拉开。', [
        micro('ho-1-1', '4号和5号上提到双肘区，2号和3号落到底角。', { '4': { x: 38, y: 58 }, '5': { x: 62, y: 58 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 } }, [
          { id: 'ho-a1', type: 'move', player: '4', from: { x: 32, y: 45 }, to: { x: 38, y: 58 }, label: '左肘区' },
          { id: 'ho-a2', type: 'move', player: '5', from: { x: 68, y: 45 }, to: { x: 62, y: 58 }, label: '右肘区' },
        ], { ballHandler: '1', focusPlayers: ['1', '4', '5'], purpose: '给控卫提供左右两侧的挡拆选择。', coachTip: '4号和5号距离要够开，别堵住1号路线。' }),
      ]),
      step('ho-s2', 'Step 2：选择强侧掩护', '1号借5号掩护攻击右侧，5号准备顺下。', [
        micro('ho-2-1', '5号给1号做右侧高位掩护，1号贴肩突破。', { '1': { x: 68, y: 50 }, '5': { x: 60, y: 55 }, '4': { x: 38, y: 58 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 } }, [
          { id: 'ho-a3', type: 'screen', player: '5', from: { x: 60, y: 55 }, to: { x: 66, y: 55 }, label: '挡拆' },
          { id: 'ho-a4', type: 'move', player: '1', from: { x: 50, y: 82 }, to: { x: 68, y: 50 }, label: '借掩护突破' },
        ], {
          ballHandler: '1',
          focusPlayers: ['1', '5'],
          shotOptions: [{ id: 'ho-shot-1', player: '1', position: { x: 68, y: 50 }, label: '出手机会1：控卫突破', description: '防守被掩护挡住后，1号直接攻击篮筐。', priority: '第一选择' }],
          purpose: '先看控卫突破是否形成直接优势。',
          coachTip: '1号通过掩护后要压住防守身位。',
        }),
        micro('ho-2-2', '5号顺下，4号留在高位作为外弹接应点。', { '1': { x: 68, y: 50 }, '5': { x: 56, y: 28 }, '4': { x: 38, y: 58 }, '2': { x: 12, y: 38 }, '3': { x: 88, y: 38 } }, [
          { id: 'ho-a5', type: 'move', player: '5', from: { x: 60, y: 55 }, to: { x: 56, y: 28 }, label: '顺下' },
        ], { ballHandler: '1', focusPlayers: ['1', '5', '4'], purpose: '形成顺下与外弹的双选项。', coachTip: '4号要留在传球视野内，不能跟着挤进禁区。' }),
      ]),
      step('ho-s3', 'Step 3：顺下与外弹选择', '防守收缩时传5号，防守补篮下时回给4号。', [
        micro('ho-3-1', '1号传给顺下5号，5号在篮下终结。', { '1': { x: 68, y: 50 }, '5': { x: 56, y: 28 }, '4': { x: 38, y: 58 }, '3': { x: 88, y: 38 } }, [
          { id: 'ho-a6', type: 'pass', player: '1', from: { x: 68, y: 50 }, to: { x: 56, y: 28 }, label: '顺下传球' },
        ], {
          ballHandler: '5',
          focusPlayers: ['1', '5'],
          shotOptions: [{ id: 'ho-shot-2', player: '5', position: { x: 56, y: 28 }, label: '出手机会2：5号顺下', description: '防守延误1号时，5号顺下接球上篮。', priority: '第一选择' }],
          purpose: '利用掩护后的短暂二打一。',
          coachTip: '1号传球角度要低，避免被弱侧手臂干扰。',
        }),
        micro('ho-3-2', '如果弱侧补防篮下，1号回传外弹4号中投或三分。', { '1': { x: 68, y: 50 }, '5': { x: 56, y: 28 }, '4': { x: 38, y: 58 }, '3': { x: 88, y: 38 } }, [
          { id: 'ho-a7', type: 'pass', player: '1', from: { x: 68, y: 50 }, to: { x: 38, y: 58 }, label: '外弹' },
        ], {
          ballHandler: '4',
          focusPlayers: ['1', '4', '5'],
          shotOptions: [{ id: 'ho-shot-3', player: '4', position: { x: 38, y: 58 }, label: '出手机会3：4号外弹投篮', description: '补防收缩篮下后，4号高位空位投篮。', priority: '第二选择' }],
          purpose: '让内线补防付出高位空位代价。',
          coachTip: '4号接球前完成站稳，投篮或再转弱侧都要快。',
        }),
      ]),
    ],
  }),
]

export const getTacticById = (id: string) => tactics.find((tactic) => tactic.id === id)
