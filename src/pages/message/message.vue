<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMessageList } from '@/api/user'
import { formatRelativeTime } from '@/utils/format'
import Empty from '@/components/Empty/Empty.vue'

interface Message {
  _id: string
  type: 'like' | 'comment' | 'follow' | 'system'
  from_user?: { _id: string; nickname: string; avatar: string }
  content: string
  read: boolean
  created_at: number
}

const list = ref<Message[]>([])
const loading = ref(false)

const typeIcon: Record<string, string> = {
  like: '❤️',
  comment: '💬',
  follow: '➕',
  system: '📢',
}

async function loadList() {
  loading.value = true
  try {
    const res = await getMessageList({ page: 1 })
    list.value = res.list || []
  } finally {
    loading.value = false
  }
}

onMounted(loadList)
// 切回 tab 时重新拉(用户从详情页返回时数据可能变化)
onShow(loadList)

/** 点击消息项:点赞/评论/关注 → 跳对应来源;系统消息 → toast */
function onItemTap(m: Message) {
  // 标记已读
  m.read = true
  switch (m.type) {
    case 'like':
    case 'comment':
      // 跳详情页(如果有 note_id)
      uni.showToast({ title: '打开对应笔记(P2)', icon: 'none', duration: 1200 })
      break
    case 'follow':
      // 跳用户主页(P3)
      uni.showToast({ title: '打开用户主页(P3)', icon: 'none', duration: 1200 })
      break
    case 'system':
      uni.showToast({ title: m.content, icon: 'none', duration: 1500 })
      break
    default:
      uni.showToast({ title: '查看消息详情', icon: 'none', duration: 1200 })
  }
}
</script>

<template>
  <view class="page">
    <view v-if="list.length" class="list">
      <view
        v-for="m in list"
        :key="m._id"
        class="item"
        :class="{ unread: !m.read }"
        @tap="onItemTap(m)"
      >
        <image v-if="m.from_user" :src="m.from_user.avatar" class="avatar" />
        <view v-else class="avatar system-avatar">📢</view>
        <view class="info">
          <text class="nickname">{{ m.from_user?.nickname || '系统消息' }}</text>
          <text class="content">{{ m.content }}</text>
          <text class="time">{{ formatRelativeTime(m.created_at) }}</text>
        </view>
        <text class="type-icon">{{ typeIcon[m.type] || '📢' }}</text>
      </view>
    </view>
    <empty v-else-if="!loading" type="message" text="暂无消息" />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
}

.list {
  background: $bg-card;
  margin-top: $spacing-sm;
}

.item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid $border-color;
  position: relative;

  &.unread::before {
    content: '';
    position: absolute;
    left: 16rpx;
    top: 32rpx;
    width: 12rpx;
    height: 12rpx;
    background: $primary;
    border-radius: 50%;
  }

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: $spacing-md;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .nickname {
      font-size: $font-size-base;
      color: $text-primary;
      font-weight: $font-weight-medium;
    }

    .content {
      font-size: 26rpx;
      color: $text-regular;
    }

    .time {
      font-size: 22rpx;
      color: $text-placeholder;
    }
  }

  .type-icon {
    font-size: $font-size-3xl;
    margin-left: $spacing-sm;
  }
}
</style>
