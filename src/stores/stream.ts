/**
 * 信息流状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStreamList, NoteItem } from '@/api/stream'

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

  return {
    list,
    tab,
    page,
    hasMore,
    loading,
    refreshing,
    switchTab,
    loadMore,
    refresh,
    toggleLikeLocal,
  }
})
