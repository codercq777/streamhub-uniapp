# 微信云开发接入指南

> 走完下面 6 步,小程序真机就能从 mock 切到真实云函数。
> 预估耗时:30 分钟(含注册 appid 时间)

## 0. 当前状态

代码已经写好,只差你的配置:

- ✅ 7 个云函数代码已就位（`cloudfunctions/` 目录）
- ✅ `_shared/` 公共模块 + `_seed` 测试数据灌入函数
- ✅ `request.ts` 双模式开关 (`USE_MOCK` 常量)
- ✅ `main.ts` 预留 `CLOUD_ENV_ID` 配置位
- ⚠️ `manifest.json` 的 `mp-weixin.appid` 是占位符
- ⚠️ `main.ts` 的 `CLOUD_ENV_ID` 是空字符串
- ⚠️ `request.ts` 的 `USE_MOCK = true`(默认走 mock)

---

## 1. 注册小程序 AppID(5 分钟)

> 已经有 appid 跳过此步。

1. 打开 [微信公众平台](https://mp.weixin.qq.com/) → 立即注册
2. 选 **小程序** 类别
3. 用邮箱注册主体(选 **个人** 即可,免认证费)
4. 拿到 **AppID(小程序 ID)** —— 形如 `wx1234567890abcdef`

---

## 2. 安装微信开发者工具(5 分钟,已有跳过)

下载:https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

---

## 3. 创建云开发环境(2 分钟)

1. 打开微信开发者工具
2. 临时新建一个空小程序项目(只是为了打开云开发面板):
   - AppID 填第 1 步拿到的
   - 后端服务选 **微信云开发**
   - 不勾选"不使用云服务"
3. 项目加载后,左上角点 **"云开发"** 按钮
4. 同意服务协议,点 **创建新环境**
   - 环境名:随意(比如 `streamhub-dev`)
   - 环境付费:选 **免费版**(足够 demo)
5. 创建完成后,在 **设置 → 环境设置** 里看 **环境 ID**(形如 `streamhub-abc-123456`)
6. **复制这个环境 ID**,后面要用

---

## 4. 配置项目(2 分钟)

### 4.1 填 AppID

打开 `src/manifest.json`,找到 `"mp-weixin"`:

```json
"mp-weixin": {
  "appid": "请替换为你的小程序 appid",  ← 改成你的 appid
  ...
}
```

### 4.2 填环境 ID

打开 `src/main.ts`,找到:

```ts
export const CLOUD_ENV_ID = '' // ← 改成你的 envId
```

改成:

```ts
export const CLOUD_ENV_ID = 'streamhub-abc-123456'  // 你的环境 ID
```

### 4.3 关闭 mock

打开 `src/api/request.ts`,找到:

```ts
export const USE_MOCK = true
```

改成:

```ts
export const USE_MOCK = false
```

---

## 5. 部署云函数(10 分钟)

> 这一步是**关键**。

### 5.1 准备项目目录

回到我们这个项目:

```bash
cd /path/to/streamhub-uniapp
npm install
npm run dev:mp-weixin
# 产物在 dist/dev/mp-weixin
```

### 5.2 在开发者工具里打开

1. 微信开发者工具 → **导入项目**
2. 目录选 `dist/dev/mp-weixin`
3. AppID 填你的
4. 后端服务:**微信云开发**
5. 点 **导入**

### 5.3 上传云函数

1. 左侧文件树找到 `cloudfunctions/` 目录(如果看不到,先确认 `manifest.json` 里 `cloudfunctionRoot: "../cloudfunctions/"` 配置正确)
2. **右键 `cloudfunctions/userLogin`** → **"上传并部署:云端安装依赖"**
3. 等 1-2 分钟(它在云端装 `wx-server-sdk`)
4. 同样上传以下 7 个 + 1 个 seed:

```
cloudfunctions/userLogin
cloudfunctions/userInfo
cloudfunctions/streamList
cloudfunctions/streamDetail
cloudfunctions/streamLike
cloudfunctions/streamPublish
cloudfunctions/messageList
cloudfunctions/_seed      ← 测试数据,可选
```

> ⚠️ 如果右键没有"上传并部署",检查 `project.config.json` 里 `cloudfunctionRoot` 字段是否指向 `cloudfunctions/`。

### 5.4 灌入测试数据(可选)

如果上传了 `_seed`:

1. 左侧文件树展开 `cloudfunctions/_seed`
2. 右键 `index.js` → **"云端测试"**
3. 弹窗直接点 **"运行"** (不传参)
4. 看返回结果 `data.notes = 30, data.users = 5, data.messages = 10` 即成功

> 这会在数据库里插 30 条笔记 + 5 个模拟用户 + 10 条消息。重复调用会再插一批(不冲突)。

---

## 6. 真机调试(5 分钟)

1. 微信开发者工具顶部点 **"真机调试"** → **"二维码真机调试"**
2. 微信扫码,手机端会弹小程序
3. 验证:
   - 首页瀑布流能看到数据(说明 streamList 通了)
   - 点发布 → 填标题 → 发布 → 跳回首页能看到新数据(streamPublish 通了)
   - 退到登录页 → 微信一键登录 → 跳回首页(userLogin 通了)
   - 消息页能拉到 10 条测试数据(messageList 通了)
4. **大功告成** 🎉

---

## 7. 遇到问题?

### Q: 云函数上传后调用返回 "cloud has not been initialized"
A: 检查 `main.ts` 里 `CLOUD_ENV_ID` 是否填了,以及 `appid` 是否对应到这个云环境。

### Q: 401 未登录
A: 真机调云函数前需要先登录(走 userLogin 一次拿到 token)。可以打开 "我的" → "点击登录" → "微信一键登录"。

### Q: H5 模式提示"H5 暂不支持云函数"
A: 当前实现如此。云开发 HTTP API 配置较复杂,demo 阶段直接在小程序里调试。H5 部署保持 `USE_MOCK = true`。

### Q: 上传云函数超时
A: 第一次会上传依赖,等 2-3 分钟。后续只传代码,几秒完事。

### Q: 想清空测试数据重新 seed
A: 云开发面板 → 数据库 → 选集合 → 删除所有文档。然后重跑 `_seed`。

---

## 8. 回退到 mock 模式

任何时候想回退:

1. `src/api/request.ts` → `USE_MOCK = true`
2. H5 模式 (`npm run dev:h5`) 立即可用,不依赖任何云开发配置

mock 模式和真模式业务代码完全一样,只是数据源不同。
