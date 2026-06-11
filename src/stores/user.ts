/**
 * 用户状态
 * Vue 2 时代:Vuex 的 modules + mutations + actions 三件套
 * Vue 3 + Pinia:一个 store 一个文件,直接 setup 写法,清爽很多
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, clearAuth, getUserInfo, setUserInfo } from '@/utils/auth'
import { login as loginApi, type UserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // ---- state ----
  const token = ref<string>(getToken())
  const userInfo = ref<UserInfo | null>(getUserInfo<UserInfo>())

  // ---- getters ----
  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => userInfo.value?._id || '')

  // ---- actions ----
  /** 启动时尝试恢复登录态 */
  function bootstrap() {
    token.value = getToken()
    userInfo.value = getUserInfo<UserInfo>()
  }

  /** 微信登录(小程序) / 模拟登录(H5) */
  async function doLogin(payload?: { nickname?: string; avatar?: string }) {
    let code: string
    // #ifdef MP-WEIXIN
    const res = await uni.login({ provider: 'weixin' })
    code = (res as any).code || ''
    // #endif
    // #ifdef H5
    code = 'mock_code_h5'
    // #endif

    const result = await loginApi({
      code,
      nickname: payload?.nickname,
      avatar: payload?.avatar,
    })

    token.value = result.token
    userInfo.value = result.userInfo
    setToken(result.token)
    setUserInfo(result.userInfo)
    return result
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    clearAuth()
    uni.reLaunch({ url: '/pages/login/login' })
  }

  function updateUserInfo(patch: Partial<UserInfo>) {
    userInfo.value = { ...(userInfo.value || {}), ...patch } as UserInfo
    setUserInfo(userInfo.value)
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userId,
    bootstrap,
    doLogin,
    logout,
    updateUserInfo,
  }
})
