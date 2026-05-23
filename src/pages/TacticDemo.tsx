import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Court from '../components/Court'
import EmptyState from '../components/EmptyState'
import { formationTemplates } from '../data/formationTemplates'
import { getTacticById } from '../data/tactics'
import type { TacticStep } from '../types/tactic'
import { validateTacticFormation } from '../utils/formationValidator'
import { describeDefensiveActions, getShotWindowExplanation, isShotOptionCreatedByDefense } from '../utils/shotWindow'
import { getCustomTactics } from '../utils/storage'

function TacticDemo() {
  const { id = '' } = useParams()
  const tactic = useMemo(() => getTacticById(id) ?? getCustomTactics().find((item) => item.id === id), [id])
  const [stepIndex, setStepIndex] = useState(0)
  const [microIndex, setMicroIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showAllLabels, setShowAllLabels] = useState(false)
  const [showOffenseActions, setShowOffenseActions] = useState(true)
  const [showDefenseRotations, setShowDefenseRotations] = useState(true)
  const [showShotOptions, setShowShotOptions] = useState(true)

  const step = tactic?.steps[Math.min(stepIndex, (tactic?.steps.length ?? 1) - 1)]
  const micro = step?.microSteps[Math.min(microIndex, (step?.microSteps.length ?? 1) - 1)]
  const totalMicro = tactic?.steps.reduce((sum, item) => sum + item.microSteps.length, 0) ?? 0
  const flatIndex = tactic ? getFlatIndex(tactic.steps, stepIndex, microIndex) : 0
  const formation = tactic ? formationTemplates[tactic.defenseFormation] : undefined
  const formationValidation = useMemo(() => (tactic ? validateTacticFormation(tactic) : null), [tactic])

  const goTo = useCallback((nextStep: number, nextMicro: number) => {
    if (!tactic) return
    const safeStep = Math.max(0, Math.min(tactic.steps.length - 1, nextStep))
    const safeMicro = Math.max(0, Math.min(tactic.steps[safeStep].microSteps.length - 1, nextMicro))
    setStepIndex(safeStep)
    setMicroIndex(safeMicro)
  }, [tactic])

  const nextMicro = useCallback(() => {
    if (!tactic) return
    const currentStep = tactic.steps[stepIndex]
    if (microIndex < currentStep.microSteps.length - 1) {
      goTo(stepIndex, microIndex + 1)
      return
    }
    if (stepIndex < tactic.steps.length - 1) goTo(stepIndex + 1, 0)
  }, [goTo, microIndex, stepIndex, tactic])

  const prevMicro = () => {
    if (!tactic) return
    if (microIndex > 0) {
      goTo(stepIndex, microIndex - 1)
      return
    }
    if (stepIndex > 0) {
      const prevStep = tactic.steps[stepIndex - 1]
      goTo(stepIndex - 1, prevStep.microSteps.length - 1)
    }
  }

  const reset = () => {
    setPlaying(false)
    goTo(0, 0)
  }

  useEffect(() => {
    if (!playing || !tactic) return
    const timer = window.setInterval(() => {
      const lastStep = stepIndex === tactic.steps.length - 1
      const lastMicro = microIndex === tactic.steps[stepIndex].microSteps.length - 1
      if (lastStep && lastMicro) {
        setPlaying(false)
        return
      }
      nextMicro()
    }, 1250)
    return () => window.clearInterval(timer)
  }, [microIndex, nextMicro, playing, stepIndex, tactic])

  if (!tactic || !step || !micro) {
    return (
      <div className="page-enter space-y-4">
        <EmptyState title="没有找到战术" description="该战术可能已被删除，返回战术库选择其他演示。" />
        <Link to="/library" className="block min-h-12 rounded-[8px] bg-orange-500 py-3 text-center font-bold text-slate-950">
          返回战术库
        </Link>
      </div>
    )
  }

  const progress = totalMicro <= 1 ? 100 : (flatIndex / (totalMicro - 1)) * 100

  return (
    <div className="page-enter space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Tactic Demo</p>
        <h1 className="mt-2 text-2xl font-black leading-8 text-orange-50">{tactic.name}</h1>
        <p className="mt-2 text-sm leading-6 text-orange-100/62">{tactic.scenario}</p>
        {formation && (
          <p className="mt-2 inline-flex rounded-full border border-orange-200/15 bg-white/[0.055] px-3 py-1 text-xs font-bold text-orange-200">
            防守阵型：{formation.name}
          </p>
        )}
      </header>

      {formation && (
        <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-orange-50">阵型说明</h2>
              <p className="mt-2 text-sm leading-6 text-orange-100/68">{formation.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-slate-950">{formation.id}</span>
          </div>
          <div className="mt-3 grid gap-2">
            {formation.teachingPoints.slice(0, 3).map((point) => (
              <p key={point} className="rounded-[8px] bg-black/20 px-3 py-2 text-xs leading-5 text-orange-100/65">
                {point}
              </p>
            ))}
          </div>
        </section>
      )}

      {import.meta.env.DEV && formationValidation && !formationValidation.valid && (
        <section className="rounded-[8px] border border-yellow-300/35 bg-yellow-400/10 p-3 text-sm leading-6 text-yellow-100">
          {formationValidation.message}
        </section>
      )}

      <Court
        players={micro.players}
        actions={micro.actions}
        defensiveActions={micro.defensiveActions}
        shotOptions={micro.shotOptions}
        focusPlayers={micro.focusPlayers}
        ballHandler={micro.ballHandler}
        showAllLabels={showAllLabels}
        showOffenseActions={showOffenseActions}
        showDefenseRotations={showDefenseRotations}
        showShotOptions={showShotOptions}
        readonly
        animated
      />
      <section className="grid grid-cols-2 gap-2">
        <ToggleButton label="显示进攻路线" active={showOffenseActions} onClick={() => setShowOffenseActions((value) => !value)} />
        <ToggleButton label="显示防守轮转" active={showDefenseRotations} onClick={() => setShowDefenseRotations((value) => !value)} />
        <ToggleButton label="显示出手机会" active={showShotOptions} onClick={() => setShowShotOptions((value) => !value)} />
        <ToggleButton label="显示全部标注" active={showAllLabels} onClick={() => setShowAllLabels((value) => !value)} />
      </section>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-3">
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ControlButton label="上小步" icon={<SkipBack size={17} />} onClick={prevMicro} disabled={flatIndex === 0} />
          <ControlButton label={playing ? '暂停' : '自动播放'} icon={playing ? <Pause size={17} /> : <Play size={17} />} onClick={() => setPlaying((value) => !value)} primary />
          <ControlButton label="下小步" icon={<SkipForward size={17} />} onClick={nextMicro} disabled={flatIndex === totalMicro - 1} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <ControlButton label="上大步" onClick={() => goTo(stepIndex - 1, 0)} disabled={stepIndex === 0} />
          <ControlButton label="重置" icon={<RotateCcw size={17} />} onClick={reset} />
          <ControlButton label="下大步" onClick={() => goTo(stepIndex + 1, 0)} disabled={stepIndex === tactic.steps.length - 1} />
        </div>
        <p className="mt-3 text-center text-xs text-orange-100/60">
          Step {stepIndex + 1} / {tactic.steps.length} · microStep {microIndex + 1} / {step.microSteps.length}
        </p>
      </section>

      <section className="space-y-3 rounded-[8px] border border-orange-300/20 bg-orange-500/10 p-4">
        <div>
          <p className="text-xs text-orange-300">当前大步骤</p>
          <h2 className="mt-1 text-lg font-black text-orange-50">{step.title}</h2>
          <p className="mt-2 text-sm leading-6 text-orange-100/70">{step.text}</p>
        </div>
        <div className="rounded-[8px] bg-black/20 p-3">
          <p className="text-xs text-orange-300">当前小步</p>
          <p className="mt-1 text-sm leading-6 text-orange-50/82">{micro.text}</p>
        </div>
        <CoachRow label="重点球员" value={(micro.focusPlayers?.length ? micro.focusPlayers.join('号、') + '号' : '按场上高亮球员执行').replaceAll('X号', 'X')} />
        <CoachRow label="当前持球人" value={`${micro.ballHandler}号`} />
        <CoachRow label="当前进攻动作" value={micro.actions.length ? micro.actions.map((action) => action.label ?? action.type).join('，') : '本小步主要观察站位。'} />
        <CoachRow label="当前防守轮转" value={describeDefensiveActions(micro.defensiveActions)} />
        <CoachRow label="战术目的" value={micro.purpose ?? '保持空间、制造防守轮转压力。'} />
        <CoachRow label="优势产生" value={micro.teachingPoint} />
        <div>
          <p className="text-xs font-bold text-orange-300">当前可能出手机会</p>
          <div className="mt-2 space-y-2">
            {(micro.shotOptions?.length ? micro.shotOptions : []).map((shot) => (
              <p key={shot.id} className="rounded-[8px] bg-black/20 px-3 py-2 text-sm leading-6 text-orange-100/76">
                {shot.priority} · {shot.label}：{shot.description}
                <br />
                产生原因：{getShotWindowExplanation(shot)}
                <br />
                相关防守人：{shot.relatedDefenders.join('、') || '无'} · {isShotOptionCreatedByDefense(shot, micro.defensiveActions) ? '由防守轮转创造' : '由站位空间创造'}
              </p>
            ))}
            {!micro.shotOptions?.length && <p className="rounded-[8px] bg-black/20 px-3 py-2 text-sm text-orange-100/55">本小步以跑位和传导为主，暂不出手。</p>}
          </div>
        </div>
        <CoachRow label="教练提示" value={micro.coachTip ?? '先看第一选择，再看第二选择，动作要连贯。'} />
      </section>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
        <h2 className="text-base font-bold text-orange-50">只看当前 Step</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {step.microSteps.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(stepIndex, index)}
              className={`min-h-10 min-w-20 rounded-full px-3 text-sm ${
                index === microIndex ? 'bg-orange-500 font-bold text-slate-950' : 'border border-orange-200/12 bg-white/[0.055] text-orange-100/70'
              }`}
            >
              小步 {index + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <InfoBlock title="执行要点" items={tactic.keyPoints} />
        <InfoBlock title="风险提醒" items={tactic.risks} />
      </section>
    </div>
  )
}

function getFlatIndex(steps: TacticStep[], stepIndex: number, microIndex: number) {
  return steps.slice(0, stepIndex).reduce((sum, item) => sum + item.microSteps.length, 0) + microIndex
}

function ControlButton({ label, icon, onClick, disabled, primary }: { label: string; icon?: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[8px] text-xs font-bold disabled:opacity-40 ${
        primary ? 'bg-orange-500 text-slate-950' : 'bg-white/8 text-orange-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ToggleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-[8px] text-xs font-bold ${
        active ? 'bg-orange-500 text-slate-950' : 'border border-orange-200/12 bg-white/[0.055] text-orange-100/70'
      }`}
    >
      {label}
    </button>
  )
}

function CoachRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-black/20 p-3">
      <p className="text-xs font-bold text-orange-300">{label}</p>
      <p className="mt-1 text-sm leading-6 text-orange-50/78">{value}</p>
    </div>
  )
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
      <h2 className="text-base font-bold text-orange-50">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-[8px] bg-black/20 px-3 py-2 text-sm leading-6 text-orange-100/68">
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}

export default TacticDemo
