import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import type { CustomTactic } from '../types/tactic'
import { deleteCustomTactic, getCustomTactics } from '../utils/storage'

const formatTime = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })

function SavedTactics() {
  const [items, setItems] = useState<CustomTactic[]>(() => getCustomTactics())

  const refresh = () => setItems(getCustomTactics())

  const remove = (id: string) => {
    deleteCustomTactic(id)
    refresh()
  }

  return (
    <div className="page-enter space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Saved</p>
        <h1 className="mt-2 text-2xl font-black text-orange-50">我的战术收藏</h1>
        <p className="mt-2 text-sm leading-6 text-orange-100/62">本页读取 localStorage 中保存的自定义战术。</p>
      </header>

      {items.length === 0 ? (
        <EmptyState title="还没有保存战术" description="还没有保存战术，去自定义战术板创建一个吧。" />
      ) : (
        <section className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-orange-50">{item.name}</h2>
                  <p className="mt-1 text-xs text-orange-100/55">创建时间：{formatTime(item.createdAt)}</p>
                  <p className="mt-1 text-xs text-orange-100/55">步骤数量：{item.steps.length}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-red-500/12 text-red-200"
                  aria-label="删除战术"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <Link to={`/tactic/${item.id}`} className="mt-4 block min-h-12 rounded-[8px] bg-orange-500 py-3 text-center font-bold text-slate-950">
                查看演示
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

export default SavedTactics
