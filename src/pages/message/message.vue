<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMessageList } from '@/api/user'
import { formatRelativeTime } from '@/utils/format'
import Empty from '@/components/Empty/Empty.vue'

interface Message {
  _id: string
  type: 'like' | 'comment' | 'follow'
  from_user: { nickname: string; avatar: string }
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
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getMessageList({ page: 1 })
    list.value = res.list || []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <view class="page">
    <view v-if="list.length" class="list">
      <view v-for="m in list" :key="m._id" class="item" :class="{ unread: !m.read }">
        <image :src="m.from_user.avatar" class="avatar" />
        <view class="info">
          <text class="nickname">{{ m.from_user.nickname }}</text>
          <text class="content">{{ m.content }}</text>
          <text class="time">{{ formatRelativeTime(m.created_at) }}</text>
        </view>
        <text class="type-icon">{{ typeIcon[m.type] }}</text>
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
