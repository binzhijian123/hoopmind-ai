import { BookOpen, Bot, ClipboardList, Home, Layers, Save } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: '首页', icon: Home },
  { to: '/custom', label: '战术板', icon: ClipboardList },
  { to: '/library', label: '战术库', icon: BookOpen },
  { to: '/recommend', label: '推荐', icon: Bot },
  { to: '/saved', label: '收藏', icon: Save },
  { to: '/sources', label: '说明', icon: Layers },
]

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-orange-200/10 bg-[#090d14]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur">
      <div className="grid grid-cols-6 gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-[8px] text-[11px] transition ${
                isActive ? 'bg-orange-500 text-slate-950' : 'text-orange-100/70 hover:bg-white/5 hover:text-orange-100'
              }`
            }
          >
            <Icon size={19} strokeWidth={2.3} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
