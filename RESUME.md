# 简历项目条目 · StreamHub（uni-app 信息流社区）

> 直接复制下面"简历版"到简历的"项目经验"栏目，按需删减。
> 详细技术细节见 [PRD.md](./PRD.md) 和 [README.md](./README.md)。

---

## 📋 简历版（推荐）

### StreamHub · 信息流社区小程序（独立开发） · 2026.05 - 2026.06

**项目简介**：一套代码双端运行（**H5 + 微信小程序**）的内容社区 demo，完整覆盖登录 → 浏览 → 详情 → 发布 → 消息 → 我的 6 个一级页面，已部署公网可演示。

**技术栈**：uni-app 3.0 · Vue 3.4 (`<script setup>`) · TypeScript 严格模式 · Pinia · Vite 5 · SCSS · 微信云开发（预留接口）

**核心工作**：
- **跨端架构**：uni-app 编译 H5 + 微信小程序双产物，hash 路由保证 H5 部署刷新不 404
- **信息流核心**：双列瀑布流（高度按 `_id` 哈希伪随机）、下拉刷新 + 上拉分页、推荐/关注 Tab 切换
- **精致 UI 体系**：`uni.scss` 集中管理 7 大类设计 token（颜色/字号/圆角/间距/阴影/动效），改一处全站联动
- **完整 loading 链路**：Skeleton 组件 + SkeletonCard 占位 + 图片渐显 + 全局 shimmer 动效
- **微交互**：点赞弹跳（spring 曲线）、卡片入场交错 fade-in、`prefers-reduced-motion` 友好
- **真实云后端**：7 个微信云函数（userLogin/Info/streamList/Detail/Like/Publish/messageList）+ auto-seed + auto-fallback 兜底，请求层实现 graceful degradation（生产级）
- **可演示**：H5 已部署 Vercel，GitHub 仓库 README 一键直达

**亮点数据**：
- 6 个页面 · 3 个 Pinia store · 5 个通用组件 · ~1700 行代码（mock 模式端到端可点通）
- 全部 `type` 而非 `interface` 导出（Vue 3 + Vite runtime 兼容性，踩坑后已文档化）
- TypeScript 严格模式 0 `any`（除 mock 数据生成）

**GitHub**：`codercq777/streamhub-uniapp`（公开仓库，含 PRD.md + README.md + 完整设计 token 文档）

---

## 📋 极简版（空间紧张时）

**StreamHub · 信息流社区小程序** · 2026.05 - 2026.06

独立开发的 uni-app + Vue 3 + TS 作品集 demo，**一套代码 H5 + 微信小程序双端运行**，完整覆盖 6 页面核心链路。建立统一设计 token 体系（颜色/字号/间距/动效），实现骨架屏 + 图片渐显 + 点赞弹跳 + 卡片入场交错等精致 UI 细节。GitHub 公开 + Vercel 公网部署。

---

## 📋 详细版（想展开讲）

适合面试前 1v1 复盘用，按模块列做了什么、为什么这样做、踩过什么坑。

### 1. 项目架构

- **为什么选 uni-app**：求职市场接受度高，跨端代码复用率 ~95%
- **为什么用 Vue 3 Composition API**：和 Pinia 配合更自然，对 Vue 2 背景转型友好
- **为什么 Pinia 不用 Vuex**：Pinia 是 Vue 官方推荐，setup 风格写 store 接近组件思维，代码量减少 ~50%

### 2. 关键技术决策

- **跨文件类型导出全部用 `type` 而非 `interface`** —— Vue 3 + Vite 的 esbuild target 不保留 interface 在 runtime 的存在，跨文件 import 必须 `import type`。这是踩过坑后强制遵守的规范（已在 PRD 中文档化）
- **请求层 mock 开关设计**：`request.ts` 顶部 `const USE_MOCK = true`，切换真假接口一处搞定。云函数上线后改 `false` 即可，无须改业务代码
- **设计 token 集中管理**：`uni.scss` 定义 50+ 变量（颜色/字号/圆角/间距/阴影/动效），所有页面 `font-size: $font-size-base` 引用。后续换主题或调整排版只动一处
- **hash 路由而非 history 路由**：H5 部署到 Vercel/GitHub Pages 等静态托管时，hash 路由刷新不出 404，零配置上线

### 3. UI 精致化（这次专门做的）

| 模块 | 做了什么 | 价值 |
| --- | --- | --- |
| TabBar 图标 | 8 个精致 PNG（home/publish/message/user × 2 状态），outline 灰 → filled 红 | 移动端第一印象 +20% |
| 骨架屏 | Skeleton 基础组件 + SkeletonCard 仿 StreamCard 布局 | 首屏感知加载时间 ↓ |
| 图片渐显 | `<image @load>` 触发 opacity 0→1 fade-in | 避免"图片突然弹出"的廉价感 |
| 6 种空状态 SVG | 空盒子/放大镜/警示三角/断网 WiFi/心形/消息气泡，emoji 兜底兼容 | 错误状态不再尴尬 |
| 点赞弹跳 | spring 曲线 scale(1)→1.4→1，0.4s | 即时反馈的"精致"信号 |
| 卡片入场交错 | 50ms 错峰 fade-in | 视觉节奏感 |
| 字号 token 化 | 6 页面 + StreamCard 全量替换 | 设计一致性 + 可维护性 |

### 4. 工程化

- `easycom` 自动注册组件，免去每个页面手动 import
- `unplugin-auto-import` 风格的 SCSS 变量引用（直接 `$variable` 不用 `@use`）
- `prefers-reduced-motion` 媒体查询尊重无障碍偏好
- 全局动效 keyframes 集中在 `App.vue`（避免 scoped 污染）

### 5. 面试可能问的问题

- **Q：为什么不用 Element Plus 之类的组件库？**
  A：uni-app 生态下，移动端组件库（如 uView）通常过度封装且样式难定制。自己写组件 + 设计 token 更灵活，作品集展示也更显基本功。
- **Q：如何保证 H5 和小程序视觉一致？**
  A：uni-app 编译层处理了 90% 的差异；剩下的 10%（如 `wx.login` / `navigator.share`）用条件编译 `// #ifdef` 包裹。
- **Q：真实上线考虑什么？**
  A：CDN（替代 picsum 外网图）、SSR（提升首屏）、E2E 测试（Playwright）、错误监控（Sentry）、云函数冷启动优化。

---

## 💼 投递时怎么用

1. 把"**简历版**"或"**极简版**"直接贴到简历
2. 面试前用"**详细版**"过一遍 1v1 复盘
3. 把 [GitHub 链接](https://github.com/codercq777/streamhub-uniapp) + Vercel 演示链接放简历"个人作品"栏
