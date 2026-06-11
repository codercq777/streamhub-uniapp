import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

/**
 * 云开发环境 ID
 * - 在云开发面板 → 设置 → 环境概览里看
 * - 留空时,云函数调用会失败(但 mock 模式不受影响)
 * - 真小程序真机调试时必须填
 */
export const CLOUD_ENV_ID = 'cloud1-d5g91df8y79653f7a'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())

  // 初始化云开发(仅小程序端有效)
  // #ifdef MP-WEIXIN
  if (CLOUD_ENV_ID) {
    // @ts-ignore
    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true, // 记录用户访问,便于排查
    })
    console.log('[cloud] init env:', CLOUD_ENV_ID)
  } else {
    console.warn('[cloud] CLOUD_ENV_ID 未配置,云函数将无法调用')
  }
  // #endif

  return { app }
}
