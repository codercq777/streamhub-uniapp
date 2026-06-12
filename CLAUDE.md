# StreamHub Mini · 项目规范

> 给 AI 编码助手（Claude Code 等）阅读的项目级上下文。
> 任何 AI 在这个仓库里改代码前**必须**先读完本文。
> 真人开发者也建议阅读 —— 这是项目里的"宪法"。

---

## 1. 项目一句话

基于 **uni-app 3.0** 的双端（H5 + 微信小程序）轻量级内容社区。
用户侧：信息流双列瀑布流 + 发布 + 互动 + 个人中心。
后端：7 个微信云函数 + 1 个 seed + 一套 mock fallback 机制。

## 2. 技术栈（不要随便换版本）

| 类别 | 选型 | 锁定版本 |
|---|---|---|
| 跨端框架 | uni-app | `3.0.0-4060620250520001`（DCloud 官方 alpha 系列）|
| 视图层 | Vue 3 | `3.4.21`（必须 `<script setup>`）|
| 语言 | TypeScript | `^5.3.3`，**`strict: true` 强制开启** |
| 状态管理 | Pinia | `2.1.7`（**Setup Store 风格**，不要写 Options Store）|
| 构建 | Vite | `5.2.8` |
| 样式 | SCSS + 设计 token | 走 `src/uni.scss` 集中管理 |
| 后端 | 微信云开发 | 7 个云函数 + auto-seed |
| 包管理 | npm | 装不上时用 `--legacy-peer-deps` |

**为什么锁版本**：uni-app 的 alpha 版本号和 vue/dcloudio 多个子包强绑定，跨版本升级会导致 `Cannot find module '@dcloudio/uni-h5'` 这种诡异报错。

## 3. 目录结构（不要随意新建一级目录）

```
streamhub-uniapp/
├── src/
│   ├── pages/              # 页面(对应 src/pages.json 路由)
│   │   ├── index/          # 首页(双列瀑布流 + tab 切换)
│   │   ├── detail/         # 详情页(图文 + 评论占位)
│   │   ├── publish/        # 发布(图选 + 标签)
│   │   ├── message/        # 消息中心
│   │   ├── user/           # 个人中心
│   │   └── login/          # 登录
│   ├── components/         # 通用组件
│   │   ├── StreamCard/     # 瀑布流卡片(核心)
│   │   ├── Empty/          # 空状态(SVG 插画)
│   │   ├── LoadMore/       # 上拉加载三态
│   │   ├── Skeleton/       # 骨架屏基础
│   │   └── SkeletonCard/   # 卡片骨架
│   ├── stores/             # Pinia stores
│   │   ├── stream.ts       # 信息流状态
│   │   ├── user.ts         # 用户状态
│   │   └── index.ts        # createPinia 导出
│   ├── api/                # 请求层 + 业务接口
│   │   ├── request.ts      # 请求封装(mock/云函数双模式)
│   │   ├── stream.ts       # streamList / Detail / Like / Publish
│   │   └── user.ts         # login / info
│   ├── utils/              # 纯函数工具
│   │   ├── auth.ts         # token 存取
│   │   ├── format.ts       # 时间/数字格式化
│   │   └── platform.ts     # 平台判断
│   ├── static/             # 静态资源(图标/tabbar)
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口(挂 Pinia + 读 manifest)
│   ├── manifest.json       # uni-app 应用配置(appid 等)
│   ├── pages.json          # 路由 + tabBar
│   └── uni.scss            # 50+ 设计 token(SCSS 变量)
├── cloudfunctions/         # 微信云函数
│   ├── userLogin/          # 登录
│   ├── userInfo/           # 用户信息
│   ├── streamList/         # 信息流列表
│   ├── streamDetail/       # 详情
│   ├── streamLike/         # 点赞
│   ├── streamPublish/      # 发布
│   ├── messageList/        # 消息列表
│   └── seed/               # 启动时灌数据(auto-seed)
├── scripts/
│   └── copy-cloudfunctions.js  # 编译时把云函数拷到 unpackage
├── vercel.json             # H5 部署配置
└── package.json
```

## 4. 关键设计（改这些地方前先想清楚）

### 4.1 双列瀑布流（`src/pages/index`）
- **核心实现**：`StreamCard` 的高度按 `_id` 哈希做伪随机，**避免异步图片加载导致高度抖动**。
- **性能要点**：列表用 `recycle-view` 思路（uni-app 提供），不要用 `v-for` 直接铺所有 DOM。
- **不要**用图片真实高度做瀑布流，uni-app 双端图片加载时序不一致，会闪。

### 4.2 TypeScript 严格模式
- **全量 `type` 导出，不用 `interface`** —— 原因：Vue 3 + Vite 编译产物不保留 `interface`，运行时拿不到类型。
- 任何 `any` 出现必须 review 后给出 `// eslint-disable-next-line` + 注释理由。
- 7 个 Pinia store / API 层 0 any 是硬指标。

### 4.3 请求层 Graceful Degradation（核心亮点）
文件：`src/api/request.ts`

```ts
// 设计:wx.cloud.callFunction 失败 → 自动 fallback 到本地 mock
// 业务代码零感知,演示永远能跑
const USE_MOCK = true   // 改 false 接真实云开发
```

**改这块前必须确认**：
- 失败重试次数
- mock 标记字段（`__isMock`）是否还在
- 降级日志格式（`[⚠️ FALLBACK]` 前缀）

### 4.4 auto-seed（`cloudfunctions/seed`）
- streamList 第一次调用时检测集合为空 → 自动调用 seed → 灌入 36 条 mock 笔记
- **不要**在 seed 里写业务逻辑，seed 必须是**纯数据**。
- seed 修改后记得在 `streamList` 里加版本号字段，触发重新灌数据。

### 4.5 设计 token（`src/uni.scss`）
- 50+ SCSS 变量集中管理
- 改颜色/间距/字号**只改这里**，不要在组件里写死
- 新增组件用 token，不引入新的 magic number

## 5. 开发规范

### 5.1 命名
- 文件：组件 PascalCase（`StreamCard.vue`），工具/函数 camelCase（`format.ts`）
- 变量：camelCase，常量 UPPER_SNAKE
- 类型：PascalCase，**全用 `type`，不用 `interface`**
- 云函数目录：camelCase（`userLogin` 不是 `user-login`）

### 5.2 组件规范
- **必须**用 `<script setup lang="ts">`
- Props 用 `defineProps<Props>()`，**不要**用 `defineProps({})` 对象写法
- Emit 用 `defineEmits<{...}>()`
- 跨端兼容逻辑用 `// #ifdef MP-WEIXIN` / `// #ifdef H5` 条件编译

### 5.3 API 规范
- 所有请求走 `src/api/request.ts` 封装，**禁止**在页面里直接 `uni.request` 或 `wx.cloud.callFunction`
- 接口参数/返回值必须有 TS 类型，放在 `src/api/` 对应文件里
- 接口命名：`getStreamList` / `getStreamDetail` / `toggleStreamLike` / `publishStream` / `getMessageList` / `userLogin` / `getUserInfo`

### 5.4 状态管理
- **Setup Store 风格**：`defineStore('xxx', () => { ... })`
- 跨页面共享状态放 store，页面内部状态用 `ref` 不要污染 store
- store 里的 `list` 必须是 `ref<NoteItem[]>([])`，不要直接 `[]`（响应式丢失）

## 6. 常用命令

```bash
# 开发
npm run dev:h5            # H5 端,默认 8080
npm run dev:mp-weixin     # 编译到 unpackage/dist/dev/mp-weixin

# 构建
npm run build:h5          # 产物 dist/build/h5
npm run build:mp-weixin   # 产物 dist/build/mp-weixin

# 类型检查(必须 0 错误)
npm run type-check

# 云函数同步(开发时 watch 模式)
npm run copy:cf
npm run copy:cf:watch
```

## 7. 必读子文档

- `README.md` —— 项目总览、部署流程
- `CLOUD_SETUP.md` —— 微信云开发环境搭建（必须先读完再动云函数）

## 8. AI 协作约定（重要）

### 8.1 AI 可以做
- ✅ 写新组件、新页面（按 §5 规范）
- ✅ 写新云函数（按 §4 业务领域拆分）
- ✅ 重构工具函数、加单元测试
- ✅ 修复 bug（**改完后必须手跑一遍 dev:h5**）
- ✅ 优化性能、加日志

### 8.2 AI **不要**碰
- ❌ `src/manifest.json` 的 `appid` 字段（值是真实的，AI 写 placeholder 会破坏配置）
- ❌ `src/main.ts` 的 `CLOUD_ENV_ID`（同上）
- ❌ `vercel.json`（部署关键配置）
- ❌ `package.json` 里 `@dcloudio/*` 包的版本（强绑定，改了崩）
- ❌ 删 `src/utils/` 下任何文件（即使看起来没用）

### 8.3 必须人工把关
- 🔒 涉及登录、支付、权限的代码（哪怕 AI 写得像模像样）
- 🔒 云函数改 schema（影响前后端协议）
- 🔒 Pinia store 改对外暴露的字段名
- 🔒 路由表（`pages.json`）

### 8.4 提交规范
- **commit message 自己手写**，不直接用 AI 生成的
- 单次 diff 超过 300 行必须拆 PR
- type-check 0 错误 + H5 能跑 + 小程序能编译才能提

## 9. 调试常见坑

- **H5 跑得起来，小程序报 `wx.cloud is not defined`** → 代码没加 `// #ifdef MP-WEIXIN`
- **改了 `manifest.json` 不生效** → 重启 dev server + 删 `node_modules/.cache` + `unpackage/.cache`
- **依赖装不上** → `npm install --legacy-peer-deps`
- **Type 改了不生效** → 重启 IDE，Vite HMR 对类型不敏感

---

**最后一条规则**：如果你（AI）不确定一个改动会不会影响其他模块，**先读相关文件再下手**，不要靠"猜"写代码。错了的代价是线上事故。
