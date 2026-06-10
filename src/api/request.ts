/**
 * 请求封装 - mock 模式先行,真接口后接
 *
 * 关键设计:
 * 1. dev 环境走 mock,prod 走 wx.cloud.callFunction(小程序) / uni.request(H5)
 * 2. 统一错误处理:401 跳转登录,其他 toast
 * 3. 统一 loading 控制
 */

import { getToken } from '@/utils/auth'
import { toast } from '@/utils/platform'

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  hideLoading?: boolean
}

export interface ApiResponse<T = any> {
  list?: T[]
  hasMore?: boolean
  total?: number
  [key: string]: any
}

// 简易开关:开发期 mock,生产接云函数
const USE_MOCK = true

export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!options.hideLoading) {
      uni.showLoading({ title: '加载中...', mask: true })
    }

    // ----- MOCK 模式 -----
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

    // ----- 真实请求(暂时以 HTTP 形式给出,接云函数时改 wx.cloud.callFunction) -----
    uni.request({
      url: '/api' + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        Authorization: `Bearer ${getToken()}`,
      },
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          toast('请先登录')
          uni.removeStorageSync('STREAMHUB_TOKEN')
          setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1000)
          reject(res)
        } else {
          toast((res.data as any)?.message || '请求失败')
          reject(res)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        toast('网络异常')
        reject(err)
      },
    })
  })
}

// ---------- MOCK 数据生成 ----------
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
