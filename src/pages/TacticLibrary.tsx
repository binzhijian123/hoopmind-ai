import { useMemo, useState } from 'react'
import TacticCard from '../components/TacticCard'
import { tactics } from '../data/tactics'

const filters = ['全部', '破2-3联防', '破3-2联防', '破1-3-1联防', '挡拆', '人盯人', '基础进攻']

function TacticLibrary() {
  const [active, setActive] = useState('全部')
  const filtered = useMemo(
    () => (active === '全部' ? tactics : tactics.filter((tactic) => tactic.category === active || tactic.tags.includes(active))),
    [active],
  )

  return (
    <div className="page-enter space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Tactic Library</p>
        <h1 className="mt-2 text-2xl font-black text-orange-50">已有战术库</h1>
        <p className="mt-2 text-sm leading-6 text-orange-100/62">按防守类型和打法快速筛选，进入后可逐步播放战术演示。</p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex min-w-max gap-2 pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              className={`min-h-11 rounded-full px-4 text-sm ${
                active === filter ? 'bg-orange-500 font-bold text-slate-950' : 'border border-orange-200/15 bg-white/[0.055] text-orange-50/75'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        {filtered.map((tactic) => (
          <TacticCard key={tactic.id} tactic={tactic} />
        ))}
      </section>
    </div>
  )
}

export default TacticLibrary
