import { Download, Eraser, Plus, Save, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Court from '../components/Court'
import { initialPlayers } from '../data/tactics'
import type { ActionLine, BoardMode, CustomTactic, DefensiveAction, MicroStep, PlayerId, Point, ShotOption, TacticStep } from '../types/tactic'
import { saveCustomTactic } from '../utils/storage'

const modeItems: { value: BoardMode; label: string }[] = [
  { value: 'drag', label: '拖动' },
  { value: 'pass', label: '传球' },
  { value: 'transfer', label: '转移' },
  { value: 'move', label: '跑位' },
  { value: 'screen', label: '掩护' },
]

const playerIds: PlayerId[] = ['1', '2', '3', '4', '5']
const defenderIds: PlayerId[] = ['X1', 'X2', 'X3', 'X4', 'X5']
const priorities: ShotOption['priority'][] = ['第一选择', '第二选择', '备用选择']
const defensiveTypes: DefensiveAction['type'][] = ['shift', 'help', 'closeout', 'recover', 'protect_rim']

const defenseLabel: Record<DefensiveAction['type'], string> = {
  shift: '轮转',
  help: 'HELP',
  closeout: 'CLOSEOUT',
  recover: 'RECOVER',
  protect_rim: '护筐',
}

const makeMicro = (index: number, players: Record<PlayerId, Point>, actions: ActionLine[] = [], text?: string): MicroStep => ({
  id: `custom-micro-${Date.now()}-${index}`,
  text: text || `小步 ${index + 1}：描述这个动作。`,
  ballHandler: '1',
  players,
  actions,
  defensiveActions: [],
  shotOptions: [],
  focusPlayers: [],
  teachingPoint: '观察进攻动作如何触发防守轮转，并寻找防守到位前的出手机会。',
  purpose: '通过跑位、传球、防守牵制或掩护制造更好的出手机会。',
  coachTip: '讲解时先说明谁持球，再说明谁跑位，最后说明机会来自哪个防守人的轮转。',
})

const makeStep = (index: number, microStep: MicroStep): TacticStep => ({
  id: `custom-step-${Date.now()}-${index}`,
  title: `Step ${index + 1}：自定义步骤`,
  text: '填写本大步骤的战术目标。',
  microSteps: [microStep],
})

function CustomBoard() {
  const firstMicro = makeMicro(0, initialPlayers, [], '初始落位：拖动球员并添加路线。')
  const [name, setName] = useState('我的篮球战术')
  const [mode, setMode] = useState<BoardMode>('drag')
  const [steps, setSteps] = useState<TacticStep[]>([makeStep(0, firstMicro)])
  const [stepIndex, setStepIndex] = useState(0)
  const [microIndex, setMicroIndex] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerId | null>(null)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState('')
  const [actionLabel, setActionLabel] = useState('')
  const [defensiveActionType, setDefensiveActionType] = useState<DefensiveAction['type']>('shift')
  const [shotPlayer, setShotPlayer] = useState<PlayerId>('1')
  const [shotLabel, setShotLabel] = useState('出手机会：空位投篮')
  const [shotDescription, setShotDescription] = useState('当前位置出现空位，可以果断出手。')
  const [shotTriggerReason, setShotTriggerReason] = useState('该机会来自防守人轮转距离过长或补防慢。')
  const [shotPriority, setShotPriority] = useState<ShotOption['priority']>('第一选择')
  const [relatedDefenders, setRelatedDefenders] = useState<PlayerId[]>(['X5'])
  const [showAllLabels, setShowAllLabels] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const currentStep = steps[stepIndex]
  const currentMicro = currentStep.microSteps[microIndex]
  const totalMicro = steps.reduce((sum, item) => sum + item.microSteps.length, 0)
  const flatIndex = steps.slice(0, stepIndex).reduce((sum, item) => sum + item.microSteps.length, 0) + microIndex

  const replaceCurrentMicro = (nextMicro: MicroStep) => {
    setSteps((items) =>
      items.map((step, sIndex) =>
        sIndex === stepIndex
          ? {
              ...step,
              microSteps: step.microSteps.map((micro, mIndex) => (mIndex === microIndex ? nextMicro : micro)),
            }
          : step,
      ),
    )
  }

  const goTo = useCallback(
    (nextStep: number, nextMicro: number, source = steps) => {
      const safeStep = Math.max(0, Math.min(source.length - 1, nextStep))
      const safeMicro = Math.max(0, Math.min(source[safeStep].microSteps.length - 1, nextMicro))
      setStepIndex(safeStep)
      setMicroIndex(safeMicro)
      setSelectedPlayer(null)
    },
    [steps],
  )

  const nextMicro = useCallback(() => {
    if (microIndex < currentStep.microSteps.length - 1) {
      goTo(stepIndex, microIndex + 1)
      return
    }
    if (stepIndex < steps.length - 1) goTo(stepIndex + 1, 0)
  }, [currentStep.microSteps.length, goTo, microIndex, stepIndex, steps.length])

  const prevMicro = () => {
    if (microIndex > 0) {
      goTo(stepIndex, microIndex - 1)
      return
    }
    if (stepIndex > 0) goTo(stepIndex - 1, steps[stepIndex - 1].microSteps.length - 1)
  }

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      if (flatIndex >= totalMicro - 1) {
        setPlaying(false)
        return
      }
      nextMicro()
    }, 1250)
    return () => window.clearInterval(timer)
  }, [flatIndex, nextMicro, playing, totalMicro])

  const updatePlayers = (players: Record<PlayerId, Point>) => {
    replaceCurrentMicro({ ...currentMicro, players })
  }

  const addAction = (action: ActionLine) => {
    replaceCurrentMicro({ ...currentMicro, actions: [...currentMicro.actions, action] })
  }

  const addDefensiveAction = (action: DefensiveAction, nextPoint: Point) => {
    replaceCurrentMicro({
      ...currentMicro,
      players: { ...currentMicro.players, [action.defender]: nextPoint },
      defensiveActions: [...currentMicro.defensiveActions, action],
      focusPlayers: Array.from(new Set([...(currentMicro.focusPlayers ?? []), action.defender])),
    })
  }

  const defaultLabel = (type: BoardMode) => {
    if (type === 'pass') return '传球'
    if (type === 'transfer') return '转移球'
    if (type === 'move') return '跑位'
    if (type === 'screen') return '掩护'
    return ''
  }

  const handlePlayerClick = (player: PlayerId) => {
    if (mode === 'drag') {
      setSelectedPlayer(player)
      return
    }

    if (mode === 'pass' || mode === 'transfer') {
      if (!selectedPlayer) {
        setSelectedPlayer(player)
        return
      }
      if (selectedPlayer !== player) {
        addAction({
          id: `action-${Date.now()}`,
          type: mode,
          player: selectedPlayer,
          from: currentMicro.players[selectedPlayer],
          to: currentMicro.players[player],
          label: actionLabel || defaultLabel(mode),
        })
      }
      setSelectedPlayer(null)
      return
    }

    setSelectedPlayer(player)
  }

  const handleCourtClick = (point: Point) => {
    if (!selectedPlayer || mode === 'drag' || mode === 'pass') return

    if (mode === 'move' && selectedPlayer.startsWith('X')) {
      addDefensiveAction(
        {
          id: `def-${Date.now()}`,
          defender: selectedPlayer,
          from: currentMicro.players[selectedPlayer],
          to: point,
          type: defensiveActionType,
          label: actionLabel || defenseLabel[defensiveActionType],
        },
        point,
      )
      setSelectedPlayer(null)
      return
    }

    addAction({
      id: `action-${Date.now()}`,
      type: mode,
      player: selectedPlayer,
      from: currentMicro.players[selectedPlayer],
      to: point,
      label: actionLabel || defaultLabel(mode),
    })
    setSelectedPlayer(null)
  }

  const updateStep = (patch: Partial<TacticStep>) => {
    setSteps((items) => items.map((step, index) => (index === stepIndex ? { ...step, ...patch } : step)))
  }

  const addStep = () => {
    const clone = makeMicro(0, currentMicro.players, currentMicro.actions, '新大步骤的第一个小步。')
    const nextStep = makeStep(steps.length, clone)
    const nextSteps = [...steps, nextStep]
    setSteps(nextSteps)
    goTo(nextSteps.length - 1, 0, nextSteps)
    setMessage('已添加大步骤')
  }

  const addMicroStep = () => {
    const nextMicroStep = {
      ...makeMicro(currentStep.microSteps.length, currentMicro.players, [], '新小步：继续描述下一段跑位、传球或防守轮转。'),
      ballHandler: currentMicro.ballHandler,
      focusPlayers: currentMicro.focusPlayers,
    }
    const nextStep = { ...currentStep, microSteps: [...currentStep.microSteps, nextMicroStep] }
    const nextSteps = steps.map((step, index) => (index === stepIndex ? nextStep : step))
    setSteps(nextSteps)
    goTo(stepIndex, nextStep.microSteps.length - 1, nextSteps)
    setMessage('已添加小步骤')
  }

  const deleteMicroStep = () => {
    if (currentStep.microSteps.length <= 1) {
      setMessage('每个大步骤至少保留一个小步骤')
      return
    }
    const nextMicros = currentStep.microSteps.filter((_, index) => index !== microIndex)
    const nextSteps = steps.map((step, index) => (index === stepIndex ? { ...step, microSteps: nextMicros } : step))
    setSteps(nextSteps)
    goTo(stepIndex, Math.max(0, microIndex - 1), nextSteps)
    setMessage('已删除当前小步骤')
  }

  const clearBoard = () => {
    const resetMicro = makeMicro(0, initialPlayers, [], '初始落位：拖动球员并添加路线。')
    const resetStep = makeStep(0, resetMicro)
    setSteps([resetStep])
    goTo(0, 0, [resetStep])
    setPlaying(false)
    setMessage('已清空当前战术')
  }

  const toggleRelatedDefender = (id: PlayerId) => {
    setRelatedDefenders((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]))
  }

  const addShotOption = () => {
    const shot: ShotOption = {
      id: `shot-${Date.now()}`,
      player: shotPlayer,
      position: currentMicro.players[shotPlayer],
      label: shotLabel,
      description: shotDescription,
      priority: shotPriority,
      triggerReason: shotTriggerReason,
      relatedDefenders,
    }
    replaceCurrentMicro({
      ...currentMicro,
      shotOptions: [...(currentMicro.shotOptions ?? []), shot],
      focusPlayers: Array.from(new Set([...(currentMicro.focusPlayers ?? []), shotPlayer, ...relatedDefenders])),
    })
    setMessage('已添加出手机会标注')
  }

  const removeShotOption = (id: string) => {
    replaceCurrentMicro({ ...currentMicro, shotOptions: currentMicro.shotOptions?.filter((shot) => shot.id !== id) ?? [] })
  }

  const save = () => {
    const now = new Date().toISOString()
    const tactic: CustomTactic = {
      id: `custom-${Date.now()}`,
      name: name.trim() || '未命名战术',
      defenseFormation: 'man',
      category: '自定义',
      difficulty: '简单',
      tags: ['自定义', '教学演示'],
      description: '用户在移动端战术板创建的自定义战术。',
      scenario: '适用于训练讲解和赛前布置。',
      keyPoints: ['逐个 microStep 讲清楚持球人、进攻动作、防守轮转和出手机会', '先跑到位，再传球，再读防守', '训练时先慢速演练，再逐步加速'],
      risks: ['自定义战术需要在真实训练中验证执行难度', '球员间距过小会压缩进攻空间'],
      steps,
      createdAt: now,
      updatedAt: now,
      isCustom: true,
    }
    saveCustomTactic(tactic)
    setMessage('保存成功，可在我的战术收藏逐步播放')
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ name, steps }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${name || 'hoopmind-tactic'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed.steps) || !parsed.steps[0]?.microSteps?.length) throw new Error('invalid')
        setName(parsed.name || '导入战术')
        setSteps(parsed.steps)
        goTo(0, 0, parsed.steps)
        setMessage('JSON 导入成功')
      } catch {
        setMessage('JSON 格式不正确')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="page-enter space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Custom Board</p>
        <h1 className="mt-2 text-2xl font-black text-orange-50">自定义战术板</h1>
        <p className="mt-2 text-sm leading-6 text-orange-100/62">添加进攻路线、防守轮转和由防守触发的出手机会。</p>
      </header>

      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="min-h-12 w-full rounded-[8px] border border-orange-200/12 bg-black/25 px-4 text-base text-orange-50 outline-none focus:border-orange-400"
        placeholder="输入战术名称"
      />

      <div className="grid grid-cols-5 gap-2">
        {modeItems.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setMode(item.value)
              setSelectedPlayer(null)
            }}
            className={`min-h-11 rounded-[8px] text-sm font-bold ${
              mode === item.value ? 'bg-orange-500 text-slate-950' : 'border border-orange-200/12 bg-white/[0.055] text-orange-100/74'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Court
        players={currentMicro.players}
        actions={currentMicro.actions}
        defensiveActions={currentMicro.defensiveActions}
        shotOptions={currentMicro.shotOptions}
        focusPlayers={currentMicro.focusPlayers}
        ballHandler={currentMicro.ballHandler}
        mode={mode}
        selectedPlayer={selectedPlayer}
        showAllLabels={showAllLabels}
        onPlayersChange={updatePlayers}
        onPlayerClick={handlePlayerClick}
        onCourtClick={handleCourtClick}
      />

      <button
        type="button"
        onClick={() => setShowAllLabels((value) => !value)}
        className="min-h-11 w-full rounded-[8px] border border-orange-200/12 bg-white/[0.055] text-sm font-bold text-orange-100"
      >
        {showAllLabels ? '收起部分标注' : '显示全部标注'}
      </button>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-3 text-xs leading-5 text-orange-100/65">
        当前模式：{modeItems.find((item) => item.value === mode)?.label}。
        {mode === 'pass' && '先点传球队员，再点接球队员。'}
        {mode === 'transfer' && '先点持球队员，再点接球队员或球场目标点，生成转移球箭头。'}
        {mode === 'move' && '点进攻球员生成跑位；点 X1-X5 生成防守轮转。'}
        {mode === 'screen' && '先点掩护球员，再点掩护位置。'}
        {mode === 'drag' && '直接按住球员拖动，X1-X5 也可以拖动记录防守位置。'}
      </section>

      <section className="space-y-3 rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
        <input value={currentStep.title} onChange={(event) => updateStep({ title: event.target.value })} className="min-h-11 w-full rounded-[8px] border border-orange-200/12 bg-black/25 px-3 text-sm text-orange-50 outline-none" />
        <textarea value={currentStep.text} onChange={(event) => updateStep({ text: event.target.value })} className="min-h-20 w-full rounded-[8px] border border-orange-200/12 bg-black/25 p-3 text-sm leading-6 text-orange-50 outline-none" />
        <textarea value={currentMicro.text} onChange={(event) => replaceCurrentMicro({ ...currentMicro, text: event.target.value })} className="min-h-20 w-full rounded-[8px] border border-orange-200/12 bg-black/25 p-3 text-sm leading-6 text-orange-50 outline-none" />
        <textarea value={currentMicro.teachingPoint} onChange={(event) => replaceCurrentMicro({ ...currentMicro, teachingPoint: event.target.value })} className="min-h-20 w-full rounded-[8px] border border-orange-200/12 bg-black/25 p-3 text-sm leading-6 text-orange-50 outline-none" placeholder="优势产生：说明哪个防守人被拉扯，哪里出现空位。" />

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-orange-100/65">
            持球人
            <select value={currentMicro.ballHandler} onChange={(event) => replaceCurrentMicro({ ...currentMicro, ballHandler: event.target.value as PlayerId })} className="mt-1 min-h-11 w-full rounded-[8px] border border-orange-200/12 bg-black/40 px-3 text-sm text-orange-50">
              {playerIds.map((id) => (
                <option key={id} value={id}>{id}号</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-orange-100/65">
            防守动作类型
            <select value={defensiveActionType} onChange={(event) => setDefensiveActionType(event.target.value as DefensiveAction['type'])} className="mt-1 min-h-11 w-full rounded-[8px] border border-orange-200/12 bg-black/40 px-3 text-sm text-orange-50">
              {defensiveTypes.map((item) => (
                <option key={item} value={item}>{defenseLabel[item]}</option>
              ))}
            </select>
          </label>
        </div>
        <input value={actionLabel} onChange={(event) => setActionLabel(event.target.value)} className="min-h-11 w-full rounded-[8px] border border-orange-200/12 bg-black/25 px-3 text-sm text-orange-50 outline-none" placeholder="动作标签，如：顺下 / CLOSEOUT / 护筐" />
      </section>

      <section className="rounded-[8px] border border-orange-300/20 bg-orange-500/10 p-4">
        <h2 className="text-base font-bold text-orange-50">出手机会标注</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={shotPlayer} onChange={(event) => setShotPlayer(event.target.value as PlayerId)} className="min-h-11 rounded-[8px] border border-orange-200/12 bg-black/40 px-3 text-sm text-orange-50">
            {playerIds.map((id) => (
              <option key={id} value={id}>{id}号出手</option>
            ))}
          </select>
          <select value={shotPriority} onChange={(event) => setShotPriority(event.target.value as ShotOption['priority'])} className="min-h-11 rounded-[8px] border border-orange-200/12 bg-black/40 px-3 text-sm text-orange-50">
            {priorities.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <input value={shotLabel} onChange={(event) => setShotLabel(event.target.value)} className="mt-2 min-h-11 w-full rounded-[8px] border border-orange-200/12 bg-black/25 px-3 text-sm text-orange-50 outline-none" />
        <textarea value={shotDescription} onChange={(event) => setShotDescription(event.target.value)} className="mt-2 min-h-20 w-full rounded-[8px] border border-orange-200/12 bg-black/25 p-3 text-sm leading-6 text-orange-50 outline-none" />
        <textarea value={shotTriggerReason} onChange={(event) => setShotTriggerReason(event.target.value)} className="mt-2 min-h-20 w-full rounded-[8px] border border-orange-200/12 bg-black/25 p-3 text-sm leading-6 text-orange-50 outline-none" placeholder="出手机会产生原因" />
        <div className="mt-3 flex flex-wrap gap-2">
          {defenderIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleRelatedDefender(id)}
              className={`min-h-10 rounded-full px-3 text-xs font-bold ${relatedDefenders.includes(id) ? 'bg-rose-400 text-slate-950' : 'border border-orange-200/12 bg-black/20 text-orange-100/70'}`}
            >
              {id}
            </button>
          ))}
        </div>
        <button type="button" onClick={addShotOption} className="mt-3 min-h-11 w-full rounded-[8px] bg-orange-500 font-bold text-slate-950">
          添加出手机会到球场
        </button>
        <div className="mt-3 space-y-2">
          {(currentMicro.shotOptions ?? []).map((shot) => (
            <div key={shot.id} className="flex items-center justify-between gap-2 rounded-[8px] bg-black/20 px-3 py-2 text-sm text-orange-100/75">
              <span>{shot.priority} · {shot.label}</span>
              <button type="button" onClick={() => removeShotOption(shot.id)} className="rounded-[8px] bg-red-500/15 px-2 py-1 text-xs text-red-100">
                删除
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((step, index) => (
          <button key={step.id} type="button" onClick={() => goTo(index, 0)} className={`min-h-10 min-w-20 rounded-full px-3 text-sm ${index === stepIndex ? 'bg-orange-500 font-bold text-slate-950' : 'border border-orange-200/12 bg-white/[0.055] text-orange-100/70'}`}>
            Step {index + 1}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {currentStep.microSteps.map((micro, index) => (
          <button key={micro.id} type="button" onClick={() => goTo(stepIndex, index)} className={`min-h-10 min-w-20 rounded-full px-3 text-sm ${index === microIndex ? 'bg-sky-400 font-bold text-slate-950' : 'border border-orange-200/12 bg-white/[0.055] text-orange-100/70'}`}>
            小步 {index + 1}
          </button>
        ))}
      </div>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-3">
        <div className="grid grid-cols-3 gap-2">
          <ActionButton label="上小步" onClick={prevMicro} muted />
          <ActionButton label={playing ? '暂停' : '播放'} onClick={() => setPlaying((value) => !value)} primary />
          <ActionButton label="下小步" onClick={nextMicro} muted />
          <ActionButton label="大步骤" icon={<Plus size={18} />} onClick={addStep} />
          <ActionButton label="小步骤" icon={<Plus size={18} />} onClick={addMicroStep} />
          <ActionButton label="删小步" icon={<Eraser size={18} />} onClick={deleteMicroStep} muted />
        </div>
        <p className="mt-3 text-center text-xs text-orange-100/60">
          Step {stepIndex + 1} / {steps.length} · microStep {microIndex + 1} / {currentStep.microSteps.length}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <ActionButton label="保存战术" icon={<Save size={18} />} onClick={save} primary />
        <ActionButton label="清空战术" icon={<Eraser size={18} />} onClick={clearBoard} muted />
        <ActionButton label="导出 JSON" icon={<Download size={18} />} onClick={exportJson} />
        <ActionButton label="导入 JSON" icon={<Upload size={18} />} onClick={() => fileRef.current?.click()} />
      </div>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={(event) => importJson(event.target.files?.[0])} />

      {message && <p className="rounded-[8px] border border-orange-300/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">{message}</p>}
    </div>
  )
}

function ActionButton({ label, icon, onClick, primary, muted }: { label: string; icon?: React.ReactNode; onClick: () => void; primary?: boolean; muted?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-[8px] text-sm font-bold ${
        primary ? 'bg-orange-500 text-slate-950' : muted ? 'bg-white/[0.055] text-orange-100/72' : 'border border-orange-200/12 bg-white/[0.075] text-orange-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export default CustomBoard
