import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Tactic } from '../types/tactic'

type TacticCardProps = {
  tactic: Tactic
}

function TacticCard({ tactic }: TacticCardProps) {
  return (
    <Link
      to={`/tactic/${tactic.id}`}
      className="block rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4 shadow-lg shadow-black/20 transition hover:border-orange-300/30 hover:bg-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-orange-50">{tactic.name}</h3>
          <p className="mt-1 text-xs text-orange-100/58">{tactic.scenario}</p>
        </div>
        <ChevronRight className="mt-1 shrink-0 text-orange-300" size={20} />
      </div>
      <p className="mt-3 text-sm leading-6 text-orange-50/78">{tactic.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-slate-950">{tactic.difficulty}</span>
        {tactic.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-orange-200/15 px-2.5 py-1 text-xs text-orange-100/70">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default TacticCard
