import { Bot, BookOpen, ClipboardList, Flame, Save, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const entries = [
  { to: '/custom', title: '自定义战术板', text: '拖动球员、添加传球和跑位路线', icon: ClipboardList },
  { to: '/library', title: '已有战术库', text: '7 套常用教学与校队战术', icon: BookOpen },
  { to: '/recommend', title: 'AI打法推荐', text: '根据双方特点生成打法建议', icon: Bot },
  { to: '/saved', title: '我的战术收藏', text: '查看本地保存的自定义战术', icon: Save },
]

const highlights = ['动态战术演示', '自定义跑位和传球路线', '根据双方特点推荐打法', '适合篮球教学与校队训练']

function Home() {
  return (
    <div className="page-enter space-y-5">
      <section className="relative overflow-hidden rounded-[8px] border border-orange-200/10 bg-[#111827] p-5 shadow-glow">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[18px] border-orange-500/20" />
        <div className="relative">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-200/15 bg-black/20 px-3 py-1 text-xs text-orange-100/70">
            <Sparkles size={14} />
            Sports Tech Tactic Lab
          </div>
          <h1 className="font-display text-4xl font-black tracking-normal text-orange-50">HoopMind AI</h1>
          <p className="mt-3 text-sm leading-6 text-orange-100/72">移动端篮球智能战术板与打法推荐系统</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {entries.map(({ to, title, text, icon: Icon }) => (
          <Link key={to} to={to} className="min-h-36 rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4 shadow-lg shadow-black/20 transition hover:bg-white/[0.08]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] bg-orange-500 text-slate-950">
              <Icon size={22} strokeWidth={2.4} />
            </div>
            <h2 className="text-base font-bold text-orange-50">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-orange-100/60">{text}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
        <div className="mb-3 flex items-center gap-2 text-orange-300">
          <Flame size={18} />
          <h2 className="text-base font-bold text-orange-50">项目亮点</h2>
        </div>
        <div className="grid gap-2">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-[8px] bg-black/20 px-3 py-3 text-sm text-orange-50/78">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
