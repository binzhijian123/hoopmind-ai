const sources = [
  'FIBA / WABC Coaches Manual：Zone Offence、Offence Against Zone Defence、Pick and Roll Against Zone',
  'USA Basketball Youth Development Guidebook：球员发展、教学分层、训练课程设计',
  'Basketball for Coaches：2-3 Zone Defense、3-2 Zone Offense、Pick and Roll Guide',
  'Coach’s Clipboard：2-3 Zone Offense Plays、Zone Offense Principles',
  'Breakthrough Basketball：Zone Offense Strategies、Pick and Roll Fundamentals',
  'Frontiers in Psychology：The Pick-and-Roll in Basketball From Deep Interviews of Elite Coaches',
  'Collective Behaviour in Basketball: A Systematic Review',
]

function Sources() {
  return (
    <div className="page-enter space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-300">About</p>
        <h1 className="mt-2 text-2xl font-black text-orange-50">参考资料 / 项目说明</h1>
      </header>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
        <p className="text-sm leading-7 text-orange-50/78">
          本项目不是发明新战术，而是将已有篮球教练知识结构化成可交互战术板，并根据双方球员特点进行规则推荐和动态演示。
        </p>
        <p className="mt-3 text-sm leading-7 text-orange-50/78">
          本系统将常见篮球战术原则进行结构化、可视化和智能推荐，适用于篮球教学、校队训练和体育科技项目展示。
        </p>
      </section>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
        <h2 className="text-base font-bold text-orange-50">参考资料</h2>
        <div className="mt-3 space-y-2">
          {sources.map((source) => (
            <p key={source} className="rounded-[8px] bg-black/20 px-3 py-3 text-sm leading-6 text-orange-100/70">
              {source}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
        <h2 className="text-base font-bold text-orange-50">技术实现</h2>
        <p className="mt-3 text-sm leading-7 text-orange-100/70">
          前端采用 React、Vite、TypeScript、Tailwind CSS 和 React Router。战术板使用 SVG 半场坐标系，所有球员与路线都以 0-100 百分比坐标保存。自定义战术使用 localStorage 本地保存，不依赖真实后端和真实 AI API。
        </p>
      </section>
    </div>
  )
}

export default Sources
