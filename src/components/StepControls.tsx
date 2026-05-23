import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

type StepControlsProps = {
  index: number
  total: number
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
}

function StepControls({ index, total, playing, onPrev, onNext, onTogglePlay }: StepControlsProps) {
  const progress = total <= 1 ? 100 : (index / (total - 1)) * 100

  return (
    <div className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-3">
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-white/8 text-sm text-orange-50 disabled:opacity-40"
          disabled={index === 0}
        >
          <SkipBack size={18} />
          上一步
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-orange-500 text-sm font-bold text-slate-950"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
          {playing ? '暂停' : '播放'}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-white/8 text-sm text-orange-50 disabled:opacity-40"
          disabled={index === total - 1}
        >
          下一步
          <SkipForward size={18} />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-orange-100/60">
        Step {index + 1} / {total}
      </p>
    </div>
  )
}

export default StepControls
