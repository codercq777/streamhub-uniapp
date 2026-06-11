<!--
  基础骨架块
  用法:
    <skeleton width="100%" height="40rpx" radius="8rpx" />
    <skeleton circle width="80rpx" height="80rpx" />
-->
<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  radius?: string
  /** 圆形(头像/图标占位) */
  circle?: boolean
}
withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '24rpx',
  radius: '8rpx',
  circle: false,
})
</script>

<template>
  <view
    class="skeleton"
    :class="{ circle }"
    :style="{
      width,
      height,
      borderRadius: circle ? '50%' : radius,
    }"
  />
</template>

<style lang="scss" scoped>
.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.04) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s $ease-in-out infinite;
}

/* 减少动效偏好 - 全局已处理 */
</style>
