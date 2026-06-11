<!--
  加载更多 / 没有更多 / 加载失败
  三态合一
-->
<script setup lang="ts">
interface Props {
  status: 'loading' | 'nomore' | 'error' | 'idle'
  loadingText?: string
  nomoreText?: string
  errorText?: string
}
withDefaults(defineProps<Props>(), {
  status: 'idle',
  loadingText: '加载中',
  nomoreText: '没有更多了',
  errorText: '加载失败,点击重试',
})

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <view v-if="status !== 'idle'" class="load-more" :class="status">
    <!-- 加载中 -->
    <template v-if="status === 'loading'">
      <view class="spinner" />
      <text class="text">{{ loadingText }}</text>
    </template>

    <!-- 没有更多 - 带装饰线 -->
    <template v-else-if="status === 'nomore'">
      <view class="line" />
      <text class="text">{{ nomoreText }}</text>
      <view class="line" />
    </template>

    <!-- 错误 - 重试按钮 -->
    <template v-else>
      <view class="retry-btn" @tap="emit('retry')">
        <text class="retry-icon">!</text>
        <text class="text">{{ errorText }}</text>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-7 0;
  font-size: $font-size-sm;
  color: $text-tertiary;
  gap: $spacing-3;

  .spinner {
    width: 24rpx;
    height: 24rpx;
    border: 3rpx solid $border-color;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .line {
    flex: 1;
    max-width: 120rpx;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, $border-color, transparent);
  }

  .text {
    letter-spacing: 1rpx;
  }

  .retry-btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-5;
    border-radius: $radius-pill;
    background: $primary-lighter;
    transition: opacity $duration $ease-out, transform $duration $ease-out;

    &:active {
      opacity: 0.7;
      transform: scale(0.97);
    }

    .retry-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32rpx;
      height: 32rpx;
      background: $primary;
      color: $text-on-primary;
      border-radius: 50%;
      font-size: $font-size-base;
      font-weight: $font-weight-bold;
      line-height: 1;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    border-top-color: $border-color;
  }
}
</style>
