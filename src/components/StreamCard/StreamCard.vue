<!--
  信息流卡片
  用法:<stream-card :note="item" @like="onLike" @click="onClick" />
  Vue 3 + script setup 写法,Vue 2 时代用 props 选项 + emit
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatCount, formatRelativeTime } from '@/utils/format'
import type { NoteItem } from '@/api/stream'

interface Props {
  note: NoteItem
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'like', id: string): void
  (e: 'click', id: string): void
}>()

const coverHeight = computed(() => {
  // 模拟瀑布流高度变化
  const ratios = [300, 400, 500, 350, 450]
  return ratios[props.note._id.length % ratios.length] + 'rpx'
})

/** 图片是否已加载完成 - 控制渐显 */
const imgLoaded = ref(false)
function onImgLoad() {
  imgLoaded.value = true
}
function onImgError(e: any) {
  // 兜底图,标记已加载以避免永久骨架
  e.detail.value = 'https://picsum.photos/400/400'
  imgLoaded.value = true
}

function onLikeTap() {
  emit('like', props.note._id)
  // 触发点赞弹出动画
  likeBounce.value = true
}
function onCardTap() {
  emit('click', props.note._id)
}

/** 点赞弹跳动画 - tap 时为 true,动画结束清掉 */
const likeBounce = ref(false)
</script>

<template>
  <view class="stream-card" @tap="onCardTap">
    <!-- 封面图 -->
    <view class="cover" :style="{ height: coverHeight }">
      <!-- 图片加载前的骨架 -->
      <view v-if="!imgLoaded" class="cover-skeleton" />
      <image
        class="cover-img"
        :class="{ loaded: imgLoaded }"
        :src="note.images[0]"
        mode="widthFix"
        lazy-load
        @load="onImgLoad"
        @error="onImgError"
      />
      <view v-if="note.images.length > 1" class="multi-tag">
        <text class="iconfont">📷 {{ note.images.length }}</text>
      </view>
    </view>

    <!-- 标题 -->
    <view class="title text-ellipsis-2">{{ note.title }}</view>

    <!-- 标签 -->
    <view v-if="note.tags.length" class="tags">
      <text v-for="tag in note.tags.slice(0, 2)" :key="tag" class="tag">#{{ tag }}</text>
    </view>

    <!-- 底部信息栏 -->
    <view class="footer">
      <view class="author">
        <image class="avatar" :src="note.author.avatar" mode="aspectFill" />
        <text class="nickname text-ellipsis">{{ note.author.nickname }}</text>
      </view>
      <view class="stats" @tap.stop="onLikeTap">
        <text
          class="stat-item"
          :class="{ active: note.liked, bouncing: likeBounce }"
          @animationend="likeBounce = false"
        >
          {{ note.liked ? '❤️' : '🤍' }} {{ formatCount(note.stats.likes) }}
        </text>
      </view>
    </view>

    <text class="time">{{ formatRelativeTime(note.created_at) }}</text>
  </view>
</template>

<style lang="scss" scoped>
.stream-card {
  background: $bg-card;
  border-radius: $border-radius;
  overflow: hidden;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
  transition: transform $duration $ease-out, box-shadow $duration $ease-out;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-xs;
  }
}

.cover {
  position: relative;
  width: 100%;
  background: #eee;
  overflow: hidden;

  .cover-skeleton {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.04) 0%,
      rgba(0, 0, 0, 0.08) 50%,
      rgba(0, 0, 0, 0.04) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s $ease-in-out infinite;
  }

  .cover-img {
    width: 100%;
    height: 100%;
    display: block;
    opacity: 0;
    transition: opacity $duration-slow $ease-out;

    &.loaded {
      opacity: 1;
    }
  }

  .multi-tag {
    position: absolute;
    right: 12rpx;
    bottom: 12rpx;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
  }
}

.title {
  font-size: 30rpx;
  font-weight: 500;
  color: $text-primary;
  line-height: 1.4;
  padding: $spacing-sm $spacing-sm 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  padding: 8rpx $spacing-sm 0;

  .tag {
    font-size: 22rpx;
    color: $primary;
    background: rgba(255, 36, 66, 0.08);
    padding: 2rpx 12rpx;
    border-radius: 16rpx;
  }
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm;

  .author {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    .avatar {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      margin-right: 8rpx;
      background: #eee;
    }

    .nickname {
      font-size: 24rpx;
      color: $text-regular;
      max-width: 200rpx;
    }
  }

  .stats {
    .stat-item {
      font-size: 24rpx;
      color: $text-secondary;
      display: inline-block;
      transform-origin: center;
      transition: color $duration $ease-out;

      &.active {
        color: $primary;
      }

      &.bouncing {
        animation: like-bounce 0.4s $ease-spring;
      }
    }
  }
}

.time {
  display: block;
  font-size: 22rpx;
  color: $text-placeholder;
  padding: 0 $spacing-sm $spacing-sm;
}

@keyframes like-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

/* 减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .stat-item.bouncing {
    animation: none;
  }
}
</style>
