/**
 * 鉴权工具：本地存储 token 与用户信息
 * Vue 2 写法: uni.setStorageSync('key', val)
 * Vue 3 + TS: 同样的 API,但补上类型定义,IDE 会更友好
 */

const TOKEN_KEY = 'STREAMHUB_TOKEN'
const USER_KEY = 'STREAMHUB_USER'

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearAuth(): void {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

export function getUserInfo<T = Record<string, any>>(): T | null {
  return uni.getStorageSync(USER_KEY) || null
}

export function setUserInfo<T = Record<string, any>>(user: T): void {
  uni.setStorageSync(USER_KEY, user)
}
