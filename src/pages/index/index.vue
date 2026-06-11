<!--
  首页信息流 - 整个 demo 的门面
  涉及:下拉刷新、上拉加载、Tab 切换、双列瀑布流、点赞乐观更新
-->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { useStreamStore, type StreamTab } from '@/stores/stream'
import StreamCard from '@/components/StreamCard/StreamCard.vue'
import Empty from '@/components/Empty/Empty.vue'
import LoadMore from '@/components/LoadMore/LoadMore.vue'
import SkeletonCard from '@/components/SkeletonCard/SkeletonCard.vue'

const store = useStreamStore()
const leftList = computed(() => store.list.filter((_, i) => i % 2 === 0))
const rightList = computed(() => store.list.filter((_, i) => i % 2 === 1))

// 初始加载:列表空 + loading → 显示骨架
const showSkeleton = computed(() => store.loading && store.list.length === 0)
// 骨架填充数据(让高度有变化,避免左右两列错位难看)
const skeletonSeeds = [0, 1, 2, 3, 4, 5]

const loadMoreStatus = computed<'loading' | 'nomore' | 'error' | 'idle'>(() => {
  if (store.loading) return 'loading'
  if (!store.hasMore) return 'nomore'
  return 'idle'
})

onMounted(() => {
  if (store.list.length === 0) {
    store.loadMore()
  }
})

// 下拉刷新
onPullDownRefresh(async () => {
  await store.refresh()
  uni.stopPullDownRefresh()
})

// 触底加载
onReachBottom(() => {
  store.loadMore()
})

function onTabChange(tab: StreamTab) {
  if (store.tab === tab) return
  store.switchTab(tab)
}

function onCardTap(id: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
}

function onLike(id: string) {
  store.toggleLikeLocal(id)
  // 真实场景:这里要 await 接口,失败回滚
  uni.showToast({ title: '已点赞', icon: 'none', duration: 800 })
}

function onRetry() {
  store.loadMore()
}
</script>

<template>
  <view class="page">
    <!-- 顶部 Tab 切换 -->
    <view class="tabs">
      <view
        v-for="t in (['recommend', 'follow'] as StreamTab[])"
        :key="t"
        class="tab"
        :class="{ active: store.tab === t }"
        @tap="onTabChange(t)"
      >
        {{ t === 'recommend' ? '推荐' : '关注' }}
      </view>
    </view>

    <!-- 骨架屏(初始加载) -->
    <view v-if="showSkeleton" class="columns">
      <view class="column">
        <skeleton-card
          v-for="(s, i) in skeletonSeeds.filter((_, idx) => idx % 2 === 0)"
          :key="`sk-l-${i}`"
          :seed="s"
        />
      </view>
      <view class="column">
        <skeleton-card
          v-for="(s, i) in skeletonSeeds.filter((_, idx) => idx % 2 === 1)"
          :key="`sk-r-${i}`"
          :seed="s"
        />
      </view>
    </view>

    <!-- 列表内容 -->
    <view v-else-if="store.list.length > 0" class="columns">
      <view class="column">
        <stream-card
          v-for="item in leftList"
          :key="item._id"
          :note="item"
          @like="onLike"
          @click="onCardTap"
        />
      </view>
      <view class="column">
        <stream-card
          v-for="item in rightList"
          :key="item._id"
          :note="item"
          @like="onLike"
          @click="onCardTap"
        />
      </view>
    </view>

    <!-- 空状态 -->
    <empty v-else-if="!store.loading" type="empty" text="还没有内容,下拉刷新试试" />

    <!-- 加载状态 -->
    <view v-if="store.list.length > 0" class="footer">
      <load-more :status="loadMoreStatus" @retry="onRetry" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
}

.tabs {
  display: flex;
  background: $bg-card;
  border-bottom: 1rpx solid $border-color;
  position: sticky;
  top: 0;
  z-index: 10;

  .tab {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 30rpx;
    color: $text-secondary;
    position: relative;

    &.active {
      color: $text-primary;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 8rpx;
        transform: translateX(-50%);
        width: 48rpx;
        height: 4rpx;
        background: $primary;
        border-radius: 2rpx;
      }
    }
  }
}

.columns {
  display: flex;
  gap: 16rpx;
  padding: 16rpx;
}

.column {
  flex: 1;
  min-width: 0;
}

.footer {
  padding: 0 16rpx 32rpx;
}
</style>
