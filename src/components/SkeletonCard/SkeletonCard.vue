<!--
  瀑布流卡片骨架 - 仿 StreamCard 布局
  高度伪随机(基于一个稳定 seed),避免两列对齐难看
-->
<script setup lang="ts">
import Skeleton from '@/components/Skeleton/Skeleton.vue'

interface Props {
  /** 同一列表里给一个稳定 id,用于决定卡片高度变化 */
  seed?: number
}
const props = withDefaults(defineProps<Props>(), { seed: 0 })

/**
 * 高度梯度:300/400/500/350/450 rpx
 * 与 StreamCard.coverHeight 算法保持一致
 */
const heights = [300, 400, 500, 350, 450]
const coverHeight = () => {
  // 优先用 _id 长度,fallback 到 seed
  const key = String(props.seed).length || 1
  return heights[key % heights.length] + 'rpx'
}
</script>

<template>
  <view class="skeleton-card">
    <!-- 封面图 -->
    <skeleton
      width="100%"
      :height="coverHeight()"
      radius="0"
    />
    <!-- 标题 -->
    <view class="title-row">
      <skeleton width="92%" height="32rpx" radius="6rpx" />
    </view>
    <view class="title-row">
      <skeleton width="60%" height="32rpx" radius="6rpx" />
    </view>
    <!-- 标签 -->
    <view class="tag-row">
      <skeleton width="80rpx" height="28rpx" radius="$radius-pill" />
      <skeleton width="100rpx" height="28rpx" radius="$radius-pill" />
    </view>
    <!-- 底部 -->
    <view class="footer-row">
      <view class="author">
        <skeleton circle width="40rpx" height="40rpx" />
        <skeleton width="120rpx" height="24rpx" radius="6rpx" />
      </view>
      <skeleton width="80rpx" height="24rpx" radius="6rpx" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.skeleton-card {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  margin-bottom: $spacing-4;
}

.title-row {
  padding: $spacing-2 $spacing-4 0;
  &:not(:first-of-type) {
    padding-top: $spacing-2;
  }
}

.tag-row {
  display: flex;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4 0;
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-3 $spacing-4;

  .author {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }
}
</style>
