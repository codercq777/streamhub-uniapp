<!--
  空状态组件
  用法:<empty text="暂无数据" icon="📭" />
-->
<script setup lang="ts">
interface Props {
  text?: string
  icon?: string
  actionText?: string
}
withDefaults(defineProps<Props>(), {
  text: '暂无数据',
  icon: '📭',
  actionText: '',
})

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <view class="empty">
    <text class="icon">{{ icon }}</text>
    <text class="text">{{ text }}</text>
    <view v-if="actionText" class="action" @tap="emit('action')">{{ actionText }}</view>
  </view>
</template>

<style lang="scss" scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .icon {
    font-size: 120rpx;
    margin-bottom: $spacing-md;
  }

  .text {
    font-size: 28rpx;
    color: $text-secondary;
    margin-bottom: $spacing-md;
  }

  .action {
    font-size: 28rpx;
    color: $primary;
    border: 2rpx solid $primary;
    padding: 12rpx 32rpx;
    border-radius: 32rpx;
  }
}
</style>
