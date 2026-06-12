# StreamHub · 信息流社区小程序

> 一套代码双端运行（H5 + 微信小程序）的轻量级内容社区 demo。
> 技术栈：**uni-app + Vue 3 + Vite + TypeScript + Pinia + 微信云开发**

![tech](https://img.shields.io/badge/uni--app-3.0-ff2442) ![vue](https://img.shields.io/badge/Vue-3.4-42b883) ![ts](https://img.shields.io/badge/TypeScript-5.3-3178c6)

---

## ✨ 特性

- ✅ **跨端运行**：H5（PC Web）+ 微信小程序，一套代码两套产物
- ✅ **Vue 3 + Composition API**：`<script setup>` 写法，更现代
- ✅ **TypeScript**：完整类型定义，IDE 友好
- ✅ **Pinia 状态管理**：替代 Vuex，简洁 50%
- ✅ **云原生后端**：微信云开发，免运维
- ✅ **工程化规范**：ESLint + Prettier，团队协作友好
- ✅ **mock 先行**：开发期不需要后端，开箱即用

---

## 📁 目录结构

```
streamhub-uniapp/
├── src/
│   ├── pages/             # 页面(对应 pages.json)
│   │   ├── index/         # 首页 - 信息流
│   │   ├── detail/        # 详情页
│   │   ├── publish/       # 发布页
│   │   ├── message/       # 消息中心
│   │   ├── user/          # 个人中心
│   │   └── login/         # 登录页
│   ├── components/        # 公共组件
│   │   ├── StreamCard/    # 信息流卡片(瀑布流核心)
│   │   ├── Empty/         # 空状态
│   │   └── LoadMore/      # 加载更多(loading/nomore/error 三态)
│   ├── stores/            # Pinia 状态
│   │   ├── user.ts        # 用户状态
│   │   └── stream.ts      # 信息流状态
│   ├── api/               # 接口层
│   │   ├── request.ts     # 请求封装(支持 mock/云函数切换)
│   │   ├── stream.ts      # 信息流接口
│   │   └── user.ts        # 用户接口
│   ├── utils/             # 工具
│   │   ├── auth.ts        # 鉴权(token 存储)
│   │   ├── format.ts      # 格式化(时间/数字)
│   │   └── platform.ts    # 平台判断
│   ├── static/            # 静态资源
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口
│   ├── manifest.json      # uni-app 应用配置
│   ├── pages.json         # 路由 + tabBar
│   └── uni.scss           # 全局 SCSS 变量
├── cloudfunctions/        # 微信云函数
│   ├── login/             # 登录云函数
│   └── getStream/         # 信息流查询
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd streamhub-uniapp
npm install
```

> ⚠️ 遇到依赖冲突时，可使用 `npm install --legacy-peer-deps`

### 2. 启动 H5（PC Web 端）

```bash
npm run dev:h5
```

浏览器自动打开 `http://localhost:8080` ，**不需要任何后端，mock 数据已就位**。

### 3. 启动微信小程序

#### 3.1 准备
- 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册一个小程序账号（个人订阅号即可），拿到 **AppID**

#### 3.2 修改配置
打开 `src/manifest.json`，找到 `mp-weixin.appid`，替换为你的 AppID：
```json
"mp-weixin": {
  "appid": "wx1234567890abcdef"
}
```

#### 3.3 编译
```bash
npm run dev:mp-weixin
```

编译产物在 `unpackage/dist/dev/mp-weixin`，用微信开发者工具"导入项目"指向该目录即可。

### 4. 接入云函数（可选）

默认跑 mock 数据。要接真实云开发：

1. 微信开发者工具左上角点击"云开发" → 创建环境（免费额度足够 demo）
2. 在云开发控制台"数据库"创建集合：`users`、`notes`、`comments`、`messages`
3. 右键 `cloudfunctions/login` → "上传并部署：云端安装依赖"
4. 同样上传 `cloudfunctions/getStream`
5. 打开 `src/api/request.ts`，将 `const USE_MOCK = true` 改为 `false`
6. 同时把 `request.ts` 中的 HTTP 模式改为 `wx.cloud.callFunction` 模式（注释里有提示）

### 5. 打包上线

```bash
# H5
npm run build:h5
# 产物在 dist/build/h5

# 小程序
npm run build:mp-weixin
# 产物在 dist/build/mp-weixin,微信开发者工具上传
```

---

## 🌐 一键部署到 Vercel

仓库已配 `vercel.json`，**直接 import** 即可：

1. 登录 [Vercel](https://vercel.com)
2. **Add New → Project → Import** `codercq777/streamhub-uniapp`
3. Framework Preset 选 **Other**（Vercel 不认识 uni-app）
4. 其他保持默认：
   - Build Command: `npm run build:h5`
   - Output Directory: `dist/build/h5`
   - Install Command: `npm install`
5. 点 **Deploy**

> 部署后访问根路径即可。H5 用 hash 路由，刷新不出 404。

---

## ☁️ 接入微信云开发（可选）

代码已就位（7 个云函数 + auto-seed + request 双模式），只差你的配置。

**详细步骤见 [CLOUD_SETUP.md](./CLOUD_SETUP.md)**。

**关键设计：请求层 Graceful Degradation** —— `wx.cloud.callFunction` 失败时自动 fallback 到本地 mock，**演示永远能跑**。Console 里看到红色 `[⚠️ FALLBACK]` 警告就知道当前是 mock 模式。

调用方零感知，弱网 / 云函数冷启动超时 / 配额耗尽时应用不崩。

---

## 快速预览接入步骤

1. 注册小程序 appid → 改 `manifest.json` 的 `mp-weixin.appid`
2. 创建云开发环境 → 拿到 envId → 改 `main.ts` 的 `CLOUD_ENV_ID`
3. 微信开发者工具导入 → 上传 7 个业务云函数 + 1 个 seed
4. `request.ts` 改 `USE_MOCK = false`
5. 真机调试

> ⚠️ 微信云开发免费版单次调用 5s 硬限制 + 冷启动 3-5s，复杂云函数容易超时。本项目的 fallback 模式就是为这种情况设计。

---

## 🔑 关键代码导读

### Vue 2 → Vue 3 迁移点

| 关注点 | Vue 2 写法 | Vue 3 写法（本项目） |
|---|---|---|
| 组件入口 | `export default { data() {}, methods: {} }` | `<script setup>` + `ref()` / `defineProps` |
| 状态管理 | Vuex modules | Pinia 的 `defineStore` 组合式 API |
| 路由 | `this.$router.push` | `uni.navigateTo`（uni-app 跨端一致） |
| 生命周期 | `mounted() {}` | `onMounted(() => {})` |
| 事件总线 | `new Vue()` | 移除，必要时用 mitt |

### Pinia 写法示例（`src/stores/stream.ts`）
```typescript
export const useStreamStore = defineStore('stream', () => {
  const list = ref<NoteItem[]>([])
  const page = ref(1)
  
  async function loadMore() { /* ... */ }
  
  return { list, page, loadMore }
})
```

> 💡 这是 Pinia 的 **Setup 风格**，比 Options 风格更接近 Vue 3 组合式 API 的思维方式。

### 跨端兼容（条件编译）

如果某个 API 只在某一端可用，使用条件编译：

```vue
<script setup>
// #ifdef MP-WEIXIN
import { useShareAppMessage } from '@dcloudio/uni-app'
// #endif
</script>
```

H5 端只保留 `#ifdef H5` 之间的代码，其他平台的代码会被剥离。

---

## 📋 已实现 vs 待实现

### ✅ 已实现（开箱即用）
- [x] 6 个页面：首页、详情、发布、消息、我的、登录
- [x] 信息流双列瀑布流
- [x] 下拉刷新 + 上拉加载更多
- [x] Tab 切换（推荐 / 关注）
- [x] 详情页（图片轮播 + 互动）
- [x] 发布页（图片选择 + 标签）
- [x] 用户中心（统计 + 菜单）
- [x] 登录页（微信登录 + 跳过）
- [x] 消息中心（点赞/评论/关注）
- [x] 点赞乐观更新
- [x] mock 数据（不依赖后端）
- [x] 2 个云函数示例（login / getStream）

### 🚧 待扩展（建议学习方向）
- [ ] 评论组件与列表
- [ ] 搜索功能
- [ ] 草稿箱（本地缓存 + 云端同步）
- [ ] 内容安全（微信内容检测 API）
- [ ] 订阅消息推送
- [ ] 性能监控（自定义埋点）
- [ ] 单元测试（Vitest + Vue Test Utils）
- [ ] E2E 测试（Playwright）

---

## 🐛 常见问题

### Q1: `npm install` 报错
A: uni-app 依赖对 node 版本敏感，建议 Node 18/20 LTS。`npm install --legacy-peer-deps` 通常能解决。

### Q2: H5 端能跑,但编译小程序报 `wx.cloud is not defined`
A: H5 不支持 `wx` 全局，代码里用了条件编译 `// #ifdef MP-WEIXIN` 包裹。

### Q3: 改了 `manifest.json` 不生效
A: 重启 dev server，或删除 `node_modules/.cache` 和 `unpackage/.cache`。

### Q4: 微信开发者工具打开后白屏
A: 检查 AppID 是否填写，AppID 错误会被拒绝运行。

---

## 📚 推荐学习资源

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [TypeScript 手册](https://www.typescriptlang.org/zh/docs/handbook/intro.html)

---

## 📄 License

MIT
