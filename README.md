# HoopMind AI

移动端篮球智能战术板与打法推荐系统。项目面向篮球教学、校队训练和体育科技作品集展示，重点是“战术推荐 + 动态战术板可视化”，不接真实后端，也不接真实 AI API。

## 核心功能

- 首页：展示项目定位、主要入口和产品亮点。
- 自定义战术板：SVG 半场战术板、Pointer Events 拖动球员、传球线、跑位线、掩护标记、步骤编辑、自动播放、保存到 localStorage。
- 已有战术库：内置 7 套专业战术，支持分类筛选。
- 战术演示页：按步骤展示球员位置、路线、讲解、执行要点和风险提醒。
- AI 打法推荐：根据己方和对方特点，用规则系统模拟智能推荐。
- 我的战术收藏：读取、查看和删除本地保存的自定义战术。
- 项目说明：展示设计边界、参考资料和技术实现。

## 技术栈

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- SVG 战术板
- localStorage

## 如何运行

```bash
npm install
npm run dev
```

## 如何打包

```bash
npm run build
```

## 项目结构

```text
src/
  main.tsx
  App.tsx
  index.css
  types/tactic.ts
  data/tactics.ts
  utils/recommendEngine.ts
  utils/storage.ts
  components/
  pages/
```

## 参考资料

- FIBA / WABC Coaches Manual：Zone Offence、Offence Against Zone Defence、Pick and Roll Against Zone
- USA Basketball Youth Development Guidebook：球员发展、教学分层、训练课程设计
- Basketball for Coaches：2-3 Zone Defense、3-2 Zone Offense、Pick and Roll Guide
- Coach’s Clipboard：2-3 Zone Offense Plays、Zone Offense Principles
- Breakthrough Basketball：Zone Offense Strategies、Pick and Roll Fundamentals
- Frontiers in Psychology：The Pick-and-Roll in Basketball From Deep Interviews of Elite Coaches
- Collective Behaviour in Basketball: A Systematic Review

## 后续可扩展方向

- 接入真实 AI API，生成更细的攻防读秒建议。
- 增加多战术文件云端同步和团队共享。
- 支持全场战术板、训练课表和球员能力档案。
- 增加战术视频导出、语音讲解和教练批注。
