<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNoteDetail, type NoteItem } from '@/api/stream'
import { formatCount, formatRelativeTime } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const note = ref<NoteItem | null>(null)
const loading = ref(true)
const likeBounce = ref(false)

onLoad(async (query) => {
  const id = query?.id as string
  if (!id) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    return
  }
  try {
    note.value = await getNoteDetail(id)
  } finally {
    loading.value = false
  }
})

function onLikeTap() {
  if (!note.value) return
  const wasLiked = note.value.liked
  note.value.liked = !wasLiked
  note.value.stats.likes += wasLiked ? -1 : 1
  likeBounce.value = true
  uni.showToast({ title: wasLiked ? '已取消' : '已点赞', icon: 'none', duration: 800 })
}

function onShare() {
  // #ifdef MP-WEIXIN
  // 小程序分享:复制链接到剪贴板(demo 不接 onShareAppMessage)
  uni.setClipboardData({
    data: `StreamHub - ${note.value?.title || '看个笔记'}`,
    success: () => uni.showToast({ title: '标题已复制', icon: 'success' }),
  })
  // #endif
  // #ifdef H5
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      uni.showToast({ title: '链接已复制', icon: 'success' })
    })
  } else {
    uni.showToast({ title: '分享功能开发中', icon: 'none' })
  }
  // #endif
}

function onCommentTap() {
  // 评论组件 P2 待实现,这里先弹个 toast 让用户知道是点哪
  uni.showToast({
    title: '评论功能开发中(P2)',
    icon: 'none',
    duration: 1500,
  })
}
</script>

<template>
  <view class="page" v-if="note">
    <!-- 顶部大图 -->
    <swiper v-if="note.images.length > 1" class="swiper" indicator-dots autoplay>
      <swiper-item v-for="(img, i) in note.images" :key="i">
        <image :src="img" class="swiper-img" mode="aspectFill" />
      </swiper-item>
    </swiper>
    <image v-else :src="note.images[0]" class="cover" mode="widthFix" />

    <!-- 内容区 -->
    <view class="content">
      <view class="title">{{ note.title }}</view>
      <view class="meta">
        <image :src="note.author.avatar" class="avatar" />
        <view class="meta-info">
          <text class="nickname">{{ note.author.nickname }}</text>
          <text class="time">{{ formatRelativeTime(note.created_at) }}</text>
        </view>
      </view>
      <view class="text">{{ note.content }}</view>
      <view v-if="note.tags.length" class="tags">
        <text v-for="t in note.tags" :key="t" class="tag">#{{ t }}</text>
      </view>
      <view class="stats">
        <text>👀 {{ formatCount(note.stats.views) }}</text>
        <text>💬 {{ formatCount(note.stats.comments) }}</text>
        <text>⭐ {{ formatCount(note.stats.collects) }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer safe-area-bottom">
      <view
        class="action"
        :class="{ active: note.liked, bouncing: likeBounce }"
        @tap="onLikeTap"
        @animationend="likeBounce = false"
      >
        <text class="icon">{{ note.liked ? '❤️' : '🤍' }}</text>
        <text class="label">{{ formatCount(note.stats.likes) }}</text>
      </view>
      <view class="action" @tap="onCommentTap">
        <text class="icon">💬</text>
        <text class="label">评论</text>
      </view>
      <view class="action" @tap="onShare">
        <text class="icon">↗️</text>
        <text class="label">分享</text>
      </view>
    </view>
  </view>
  <view v-else-if="loading" class="loading">加载中...</view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 120rpx;
}

.swiper {
  width: 100%;
  height: 750rpx;
  background: #000;
  .swiper-img {
    width: 100%;
    height: 100%;
  }
}

.cover {
  width: 100%;
  display: block;
  background: #eee;
}

.content {
  background: $bg-card;
  padding: $spacing-md;
  margin-top: $spacing-sm;

  .title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    line-height: $line-height-tight;
    margin-bottom: $spacing-md;
  }

  .meta {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-md;

    .avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      margin-right: $spacing-sm;
    }

    .meta-info {
      display: flex;
      flex-direction: column;

      .nickname {
        font-size: $font-size-base;
        color: $text-primary;
        font-weight: $font-weight-medium;
      }

      .time {
        font-size: 22rpx;
        color: $text-secondary;
        margin-top: 4rpx;
      }
    }
  }

  .text {
    font-size: $font-size-md;
    color: $text-primary;
    line-height: $line-height-relaxed;
    margin-bottom: $spacing-md;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: $spacing-md;

    .tag {
      font-size: $font-size-sm;
      color: $primary;
      background: rgba(255, 36, 66, 0.08);
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
    }
  }

  .stats {
    display: flex;
    gap: $spacing-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    padding-top: $spacing-md;
    border-top: 1rpx solid $border-color;
  }
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: $bg-card;
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
  border-top: 1rpx solid $border-color;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);

  .action {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $text-secondary;
    padding: $spacing-2 $spacing-5;
    border-radius: $radius;
    transition: background $duration-fast $ease-out, color $duration $ease-out;
    transform-origin: center;

    &:active {
      background: $bg-overlay;
    }

    &.active .icon {
      color: $primary;
    }

    &.bouncing .icon {
      animation: like-bounce 0.4s $ease-spring;
    }

    .icon {
      font-size: $font-size-2xl;
    }

    .label {
      font-size: 22rpx;
      margin-top: 4rpx;
    }
  }
}

@keyframes like-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

/* 减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .action.bouncing .icon {
    animation: none;
  }
}

.loading {
  padding: 200rpx 0;
  text-align: center;
  color: $text-secondary;
}
</style>
