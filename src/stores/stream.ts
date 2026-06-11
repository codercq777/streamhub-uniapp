/**
 * 信息流状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStreamList, type NoteItem } from '@/api/stream'

export type StreamTab = 'recommend' | 'follow'

export const useStreamStore = defineStore('stream', () => {
  const list = ref<NoteItem[]>([])
  const tab = ref<StreamTab>('recommend')
  const page = ref(1)
  const pageSize = 20
  const hasMore = ref(true)
  const loading = ref(false)
  const refreshing = ref(false)

  /** 切换 tab 时调用 */
  async function switchTab(newTab: StreamTab) {
    tab.value = newTab
    list.value = []
    page.value = 1
    hasMore.value = true
    await loadMore()
  }

  /** 上拉加载 / 初始化加载 */
  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const res = await getStreamList({ page: page.value, pageSize, tab: tab.value })
      // 首次加载用 = 替换,后续用 push 追加
      if (page.value === 1) {
        list.value = res.list || []
      } else {
        list.value = [...list.value, ...(res.list || [])]
      }
      hasMore.value = !!res.hasMore
      page.value++
    } finally {
      loading.value = false
    }
  }

  /** 下拉刷新 */
  async function refresh() {
    refreshing.value = true
    page.value = 1
    hasMore.value = true
    try {
      const res = await getStreamList({ page: 1, pageSize, tab: tab.value })
      list.value = res.list || []
      hasMore.value = !!res.hasMore
      page.value = 2
    } finally {
      refreshing.value = false
    }
  }

  /** 点赞切换(乐观更新,失败回滚) */
  function toggleLikeLocal(id: string) {
    const idx = list.value.findIndex((n) => n._id === id)
    if (idx === -1) return
    const item = list.value[idx]
    const wasLiked = item.liked
    item.liked = !wasLiked
    item.stats.likes += wasLiked ? -1 : 1
  }

  /** 累加当前 list 中所有笔记的 likes(用户视角的"获赞") */
  const totalLikes = computed(() => {
    if (!Array.isArray(list.value)) return 0
    return list.value.reduce((sum, n) => sum + (n.stats?.likes || 0), 0)
  })

  return {
    list,
    tab,
    page,
    hasMore,
    loading,
    refreshing,
    totalLikes, // 用户发布笔记的总获赞数(累加 list 中所有 note 的 likes)
    switchTab,
    loadMore,
    refresh,
    toggleLikeLocal,
  }
})
