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

  /**
   * 微信原生授权登录(小程序 chooseAvatar + input nickname)
   * 不走云函数(本环境云开发 5s 超时跑不通),直接用微信提供的头像/昵称
   * 存本地 storage 持久化
   */
  function loginFromWechat(payload: { avatarUrl: string; nickname: string }) {
    // 微信头像 URL 临时路径需要存到本地,否则重启会失效
    // H5 端的 https URL 可直接存
    const newUser: UserInfo = {
      _id: `local_${Date.now()}`,
      nickname: payload.nickname,
      avatar: payload.avatarUrl,
      bio: '这个人很懒,什么都没写',
      followers: 0,
      following: 0,
      notes_count: 0,
    }
    token.value = `local_token_${Date.now()}`
    userInfo.value = newUser
    setToken(token.value)
    setUserInfo(newUser)
    return newUser
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
    loginFromWechat,
    logout,
    updateUserInfo,
  }
})
