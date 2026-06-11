<!--
  空状态组件
  用法:
    <empty text="暂无内容" />
    <empty type="search" text="没有匹配结果" />
    <empty type="error" text="加载失败" action-text="重试" @action="onRetry" />
    <empty icon="🌱" text="旧用法,emoji 兜底" />  ← 兼容
-->
<script setup lang="ts">
type IllustrationType = 'empty' | 'search' | 'error' | 'offline' | 'like' | 'message'

interface Props {
  text?: string
  /** 预设插画类型(推荐) */
  type?: IllustrationType
  /** 旧 API:emoji 兜底,新代码用 type 即可 */
  icon?: string
  /** 行动按钮文案 */
  actionText?: string
}
withDefaults(defineProps<Props>(), {
  text: '暂无数据',
  type: 'empty',
  icon: '',
  actionText: '',
})

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <view class="empty">
    <!-- 旧 API:emoji 兜底 -->
    <text v-if="icon" class="icon-emoji">{{ icon }}</text>

    <!-- 新 API:SVG 插画 -->
    <view v-else class="illustration">
      <!-- empty: 空盒子 -->
      <svg v-if="type === 'empty'" width="200" height="160" viewBox="0 0 200 160" fill="none">
        <ellipse cx="100" cy="142" rx="56" ry="5" fill="#f0f0f0" />
        <path d="M50 64 L100 46 L150 64 L150 118 L100 136 L50 118 Z" fill="#fafafa" stroke="#e0e0e0" stroke-width="2" stroke-linejoin="round" />
        <path d="M50 64 L100 82 L150 64" stroke="#d8d8d8" stroke-width="2" fill="none" stroke-linejoin="round" />
        <line x1="100" y1="82" x2="100" y2="136" stroke="#e8e8e8" stroke-width="1.5" />
        <path d="M70 100 L86 100 M70 108 L82 108" stroke="#e8e8e8" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="138" cy="40" r="4" fill="#ff6478" opacity="0.6" />
        <circle cx="60" cy="50" r="3" fill="#ffd1d8" />
      </svg>

      <!-- search: 放大镜 -->
      <svg v-else-if="type === 'search'" width="200" height="160" viewBox="0 0 200 160" fill="none">
        <circle cx="82" cy="74" r="46" fill="#fff" stroke="#d0d0d0" stroke-width="4" />
        <circle cx="82" cy="74" r="46" fill="#fafafa" opacity="0.5" />
        <line x1="116" y1="108" x2="150" y2="142" stroke="#d0d0d0" stroke-width="6" stroke-linecap="round" />
        <circle cx="72" cy="64" r="2.5" fill="#ff6478" />
        <circle cx="92" cy="84" r="2.5" fill="#ff6478" />
        <circle cx="78" cy="86" r="2.5" fill="#ff6478" />
      </svg>

      <!-- error: 警示三角 -->
      <svg v-else-if="type === 'error'" width="200" height="160" viewBox="0 0 200 160" fill="none">
        <path d="M100 28 L172 140 L28 140 Z" fill="#fff5f6" stroke="#ff2442" stroke-width="3" stroke-linejoin="round" />
        <line x1="100" y1="68" x2="100" y2="108" stroke="#ff2442" stroke-width="5" stroke-linecap="round" />
        <circle cx="100" cy="122" r="3.5" fill="#ff2442" />
      </svg>

      <!-- offline: WiFi 断开 -->
      <svg v-else-if="type === 'offline'" width="200" height="160" viewBox="0 0 200 160" fill="none">
        <path d="M40 80 Q100 30 160 80" stroke="#d8d8d8" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M62 100 Q100 70 138 100" stroke="#d8d8d8" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="100" cy="124" r="5" fill="#d8d8d8" />
        <line x1="42" y1="42" x2="158" y2="142" stroke="#ff2442" stroke-width="5" stroke-linecap="round" />
      </svg>

      <!-- like: 心形轮廓 -->
      <svg v-else-if="type === 'like'" width="200" height="160" viewBox="0 0 200 160" fill="none">
        <path d="M100 132 C 100 132 36 96 36 64 C 36 48 49 38 64 38 C 78 38 92 48 100 64 C 108 48 122 38 136 38 C 151 38 164 48 164 64 C 164 96 100 132 100 132 Z"
              fill="#fff" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" />
      </svg>

      <!-- message: 空消息气泡 -->
      <svg v-else-if="type === 'message'" width="200" height="160" viewBox="0 0 200 160" fill="none">
        <path d="M28 50 Q28 30 48 30 L152 30 Q172 30 172 50 L172 100 Q172 120 152 120 L82 120 L52 148 L52 120 Q28 120 28 100 Z"
              fill="#fff" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" />
        <circle cx="76" cy="75" r="4" fill="#d8d8d8" />
        <circle cx="100" cy="75" r="4" fill="#d8d8d8" />
        <circle cx="124" cy="75" r="4" fill="#d8d8d8" />
      </svg>
    </view>

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
  padding: 120rpx 32rpx;

  .icon-emoji {
    font-size: 120rpx;
    margin-bottom: $spacing-4;
  }

  .illustration {
    margin-bottom: $spacing-7;
    line-height: 0;
  }

  .text {
    font-size: $font-size-base;
    color: $text-tertiary;
    margin-bottom: $spacing-4;
    letter-spacing: 1rpx;
  }

  .action {
    font-size: $font-size-base;
    color: $primary;
    border: 1px solid $primary;
    padding: $spacing-3 $spacing-7;
    border-radius: $radius-pill;
    transition: opacity $duration $ease-out;

    &:active {
      opacity: 0.7;
    }
  }
}
</style>
