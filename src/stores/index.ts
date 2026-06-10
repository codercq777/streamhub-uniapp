/**
 * Pinia 入口
 * uni-app + Vue 3 中,Pinia 必须通过 createSSRApp 的 use 注入
 * (在 main.ts 中完成,这里只导出)
 */
export { useUserStore } from './user'
export { useStreamStore } from './stream'
