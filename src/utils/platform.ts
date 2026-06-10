/**
 * 平台判断
 * Vue 2 时代:用条件编译 // #ifdef MP-WEIXIN
 * Vue 3 + TS: 仍可用条件编译,但运行时用 process.env.UNI_PLATFORM
 */

export const PLATFORM = {
  isH5: process.env.UNI_PLATFORM === 'h5',
  isMpWeixin: process.env.UNI_PLATFORM === 'mp-weixin',
  isApp: process.env.UNI_PLATFORM === 'app-plus',
  isAppIOS: process.env.UNI_PLATFORM === 'app-ios',
  isAppAndroid: process.env.UNI_PLATFORM === 'app-android',
} as const

/** 统一 showToast,避免重复写 icon: 'none' */
export function toast(title: string, icon: 'none' | 'success' | 'error' | 'loading' = 'none') {
  uni.showToast({ title, icon, duration: 1800 })
}
