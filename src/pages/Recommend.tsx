import { useState } from 'react'
import { Link } from 'react-router-dom'
import FeatureSelector from '../components/FeatureSelector'
import { recommendTactic, type Recommendation } from '../utils/recommendEngine'

const teamOptions = ['控卫突破强', '控卫传球好', '三分强', '内线强', '有高位策应中锋', '球队速度快', '篮板强', '投篮不稳定', '身高劣势', '新手较多']
const opponentOptions = ['2-3联防', '3-2联防', '1-3-1联防', '人盯人', '内线高大', '中锋移动慢', '外线压迫强', '协防慢', '喜欢包夹', '体能差']

function Recommend() {
  const [team, setTeam] = useState<string[]>([])
  const [opponent, setOpponent] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Recommendation | null>(null)

  const generate = () => {
    setLoading(true)
    setResult(null)
    window.setTimeout(() => {
      setResult(recommendTactic(team, opponent))
      setLoading(false)
    }, 800)
  }

  return (
    <div className="page-enter space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-300">AI Recommend</p>
        <h1 className="mt-2 text-2xl font-black text-orange-50">AI打法推荐</h1>
        <p className="mt-2 text-sm leading-6 text-orange-100/62">先选择双方特点，系统会用规则推荐模拟智能分析。</p>
      </header>

      <FeatureSelector title="己方球员特点" options={teamOptions} selected={team} onChange={setTeam} />
      <FeatureSelector title="对方球员特点" options={opponentOptions} selected={opponent} onChange={setOpponent} />

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="min-h-14 w-full rounded-[8px] bg-orange-500 text-base font-black text-slate-950 shadow-glow disabled:opacity-70"
      >
        {loading ? '智能分析中...' : '生成推荐打法'}
      </button>

      {loading && (
        <div className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-500" />
          </div>
          <p className="mt-3 text-sm text-orange-100/65">正在匹配防守形态、球员优势和执行风险...</p>
        </div>
      )}

      {result && (
        <section className="rounded-[8px] border border-orange-300/20 bg-orange-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-orange-300">推荐战术</p>
              <h2 className="mt-1 text-xl font-black text-orange-50">{result.tacticName}</h2>
            </div>
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-slate-950">置信度 {result.confidence}%</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-orange-50/78">{result.reason}</p>

          <ResultList title="执行步骤" items={result.steps} />
          <ResultList title="适合球员" items={result.suitablePlayers} />
          <ResultList title="风险提醒" items={result.risks} />

          {result.tacticId && (
            <Link to={`/tactic/${result.tacticId}`} className="mt-4 block min-h-12 rounded-[8px] bg-orange-500 py-3 text-center font-bold text-slate-950">
              查看战术演示
            </Link>
          )}
        </section>
      )}
    </div>
  )
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-orange-300">{title}</h3>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-[8px] bg-black/20 px-3 py-2 text-sm leading-6 text-orange-100/72">
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}

export default Recommend
