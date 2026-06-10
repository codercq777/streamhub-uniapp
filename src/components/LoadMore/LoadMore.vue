<!--
  加载更多 / 没有更多 / 加载失败
  三态合一
-->
<script setup lang="ts">
interface Props {
  status: 'loading' | 'nomore' | 'error'
  loadingText?: string
  nomoreText?: string
  errorText?: string
}
withDefaults(defineProps<Props>(), {
  loadingText: '加载中...',
  nomoreText: '- 没有更多了 -',
  errorText: '加载失败,点击重试',
})

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <view class="load-more" :class="status">
    <template v-if="status === 'loading'">
      <view class="spinner" />
      <text class="text">{{ loadingText }}</text>
    </template>
    <template v-else-if="status === 'nomore'">
      <text class="text">{{ nomoreText }}</text>
    </template>
    <template v-else>
      <text class="text retry" @tap="emit('retry')">{{ errorText }}</text>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
  font-size: 24rpx;
  color: $text-secondary;

  .spinner {
    width: 28rpx;
    height: 28rpx;
    border: 3rpx solid #ddd;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 12rpx;
  }

  .retry {
    color: $primary;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
