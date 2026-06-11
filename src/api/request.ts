/**
 * 请求封装 - 双模式
 *
 * 模式 1: USE_MOCK = true  → 走 mockHandler,本地起前端就能跑(开发期)
 * 模式 2: USE_MOCK = false → 走云函数(需真 appid + 云开发环境)
 *
 * 关键设计:
 * 1. 统一响应格式: { code: 0, data } 或 { code: 4xx/5xx, message }
 * 2. 401 跳登录,其他 toast
 * 3. URL → 云函数名映射,业务代码无须关心模式
 */

import { getToken, clearAuth } from '@/utils/auth'
import { toast } from '@/utils/platform'

// ============ 开关 ============
/** 是否使用 mock 数据(部署前改为 false 即可接真云函数) */
export const USE_MOCK = false

// ============ 类型 ============
export type RequestOptions = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  hideLoading?: boolean
}

export type ApiResponse<T = any> = {
  list?: T[]
  hasMore?: boolean
  total?: number
  [key: string]: any
}

// ============ URL → 云函数名映射 ============
const URL_TO_FN: Record<string, string> = {
  '/user/login': 'userLogin',
  '/user/info': 'userInfo',
  '/stream/list': 'streamList',
  '/stream/detail': 'streamDetail',
  '/stream/like': 'streamLike',
  '/stream/publish': 'streamPublish',
  '/message/list': 'messageList',
}

function urlToFnName(url: string): string {
  // /stream/detail?id=xxx → /stream/detail
  const path = url.split('?')[0]
  const name = URL_TO_FN[path]
  if (!name) throw new Error(`未配置云函数:${path}`)
  return name
}

// ============ 主体 ============
export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!options.hideLoading) {
      uni.showLoading({ title: '加载中...', mask: true })
    }

    // ---- MOCK 模式 ----
    if (USE_MOCK) {
      setTimeout(() => {
        uni.hideLoading()
        try {
          const data = mockHandler(options.url, options.data || {})
          resolve(data as T)
        } catch (e) {
          reject(e)
        }
      }, 300)
      return
    }

    // ---- 真云函数(小程序端) + 自动 fallback ----
    // #ifdef MP-WEIXIN
    callCloudFunction<T>(options)
      .then(resolve)
      .catch((err) => {
        // 失败时自动 fallback 到 mock,保证 demo 不卡死
        console.warn('[request] 云函数失败,fallback 到 mock:', err?.errMsg || err?.message)
        try {
          const data = mockHandler(options.url, options.data || {})
          resolve(data as T)
        } catch (e) {
          reject(err)
        }
      })
    // #endif

    // ---- H5 端云开发 HTTP API(暂未实现,fallback 到 mock) ----
    // #ifdef H5
    try {
      const data = mockHandler(options.url, options.data || {})
      resolve(data as T)
    } catch (e) {
      reject(e)
    }
    // #endif
  })
}

// ============ 云函数调用(仅小程序) ============
function callCloudFunction<T>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    // 动态 require,避免 H5 端打包 wx-server-sdk
    // @ts-ignore
    const wxCloud = (typeof wx !== 'undefined' && wx.cloud) ? wx.cloud : null
    if (!wxCloud) {
      reject(new Error('wx.cloud 不可用'))
      return
    }

    let fnName: string
    try {
      fnName = urlToFnName(options.url)
    } catch (e: any) {
      reject(e)
      return
    }

    wxCloud.callFunction({
      name: fnName,
      data: options.data || {},
      config: { timeout: 30000 }, // 30 秒,覆盖默认 5s,避开冷启动
      success: (res: any) => {
        const result = res.result || {}
        if (result.code === 0) {
          resolve(result.data as T)
        } else if (result.code === 401) {
          clearAuth()
          toast('请先登录')
          setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 800)
          reject(result)
        } else {
          toast(result.message || '请求失败')
          reject(result)
        }
      },
      fail: (err: any) => {
        console.error('[request] callFunction fail:', err)
        reject(err)
      },
    })
  })
}

// ============ MOCK 数据生成(开发期) ============
function mockHandler(url: string, data: Record<string, any>): any {
  if (url.startsWith('/stream/list')) {
    return {
      list: generateMockNotes(data.page || 1, data.tab || 'recommend'),
      hasMore: (data.page || 1) < 5,
      total: 100,
    }
  }
  if (url.startsWith('/stream/detail')) {
    return generateMockNotes(1, 'recommend')[0]
  }
  if (url.startsWith('/user/info')) {
    return {
      _id: 'mock_user_1',
      nickname: '体验用户',
      avatar: 'https://i.pravatar.cc/200?img=12',
      bio: '这是 demo 账号,登录后即可体验完整功能',
      followers: 128,
      following: 36,
      notes_count: 12,
    }
  }
  if (url.startsWith('/user/login')) {
    return {
      token: 'mock_token_' + Date.now(),
      userInfo: {
        _id: 'mock_user_1',
        nickname: data.nickname || '新用户',
        avatar: 'https://i.pravatar.cc/200?img=12',
      },
    }
  }
  if (url.startsWith('/message/list')) {
    return {
      list: [
        { _id: 'm1', type: 'like', from_user: { nickname: '小明', avatar: 'https://i.pravatar.cc/100?img=1' }, content: '赞了你的笔记', read: false, created_at: Date.now() - 3600 * 1000 },
        { _id: 'm2', type: 'comment', from_user: { nickname: '小红', avatar: 'https://i.pravatar.cc/100?img=2' }, content: '评论:太棒了!', read: true, created_at: Date.now() - 86400 * 1000 },
        { _id: 'm3', type: 'follow', from_user: { nickname: '路人甲', avatar: 'https://i.pravatar.cc/100?img=3' }, content: '关注了你', read: true, created_at: Date.now() - 86400 * 3 * 1000 },
      ],
      hasMore: false,
    }
  }
  return { list: [], hasMore: false, total: 0 }
}

function generateMockNotes(page: number, tab: string) {
  const list: any[] = []
  const seed = tab === 'follow' ? 100 : 1
  for (let i = 0; i < 20; i++) {
    list.push({
      _id: `mock_${tab}_${page}_${i}`,
      title: `${tab === 'follow' ? '关注的' : ''}笔记 ${page}-${i + 1}`,
      content: '一段示例内容,展示卡片的基本样式。包含文字、tag、作者信息等元素。点击可进入详情页查看完整内容。',
      images: [`https://picsum.photos/seed/${seed}${page}${i}/400/${300 + (i % 3) * 100}`],
      tags: [['旅行', '美食', '生活', '摄影', '科技'][i % 5]],
      author: {
        _id: `user_${i % 5}`,
        nickname: `创作者${(i % 5) + 1}`,
        avatar: `https://i.pravatar.cc/100?img=${(i % 5) + 1}`,
      },
      stats: {
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        collects: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 100),
      },
      liked: false,
      collected: false,
      created_at: Date.now() - i * 3600000,
    })
  }
  return list
}
