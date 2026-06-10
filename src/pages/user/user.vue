<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useStreamStore } from '@/stores/stream'

const userStore = useUserStore()
const streamStore = useStreamStore()

const stats = [
  { label: '发布', value: 0, key: 'notes' },
  { label: '关注', value: 0, key: 'following' },
  { label: '粉丝', value: 0, key: 'followers' },
  { label: '获赞', value: 0, key: 'likes' },
]

function onLoginTap() {
  uni.navigateTo({ url: '/pages/login/login' })
}

function onLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗?',
    success: (res) => {
      if (res.confirm) userStore.logout()
    },
  })
}
</script>

<template>
  <view class="page">
    <!-- 头部信息 -->
    <view class="header">
      <view class="user-info" v-if="userStore.isLoggedIn">
        <image :src="userStore.userInfo?.avatar" class="avatar" />
        <view class="info">
          <text class="nickname">{{ userStore.userInfo?.nickname }}</text>
          <text class="bio">{{ userStore.userInfo?.bio || '这个人很懒,什么都没写' }}</text>
        </view>
      </view>
      <view class="user-info placeholder" v-else @tap="onLoginTap">
        <view class="avatar default">👤</view>
        <view class="info">
          <text class="nickname">点击登录</text>
          <text class="bio">登录后享受更多功能</text>
        </view>
      </view>

      <!-- 数据 -->
      <view class="stats">
        <view v-for="s in stats" :key="s.key" class="stat">
          <text class="num">{{ s.value }}</text>
          <text class="label">{{ s.label }}</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu">
      <view class="menu-item">
        <text class="icon">📝</text>
        <text class="text">我的发布</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="icon">⭐</text>
        <text class="text">我的收藏</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="icon">🔔</text>
        <text class="text">消息通知</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="icon">⚙️</text>
        <text class="text">设置</text>
        <text class="arrow">›</text>
      </view>
      <view v-if="userStore.isLoggedIn" class="menu-item" @tap="onLogout">
        <text class="icon">🚪</text>
        <text class="text">退出登录</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="footer-text">
      <text>StreamHub Demo · v1.0.0</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
}

.header {
  background: linear-gradient(135deg, $primary, $primary-light);
  padding: $spacing-lg $spacing-md;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-lg;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
      background: #fff;
    }

    .avatar.default {
      background: rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 60rpx;
      text-align: center;
      line-height: 120rpx;
    }

    .info {
      margin-left: $spacing-md;
      color: #fff;

      .nickname {
        font-size: 36rpx;
        font-weight: 600;
        display: block;
      }

      .bio {
        font-size: 24rpx;
        opacity: 0.8;
        margin-top: 8rpx;
        display: block;
      }
    }
  }

  .stats {
    display: flex;
    background: rgba(255, 255, 255, 0.15);
    border-radius: $border-radius;
    padding: $spacing-md 0;

    .stat {
      flex: 1;
      text-align: center;
      color: #fff;

      .num {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
      }

      .label {
        display: block;
        font-size: 24rpx;
        opacity: 0.85;
        margin-top: 4rpx;
      }
    }
  }
}

.menu {
  background: $bg-card;
  margin: $spacing-md;
  border-radius: $border-radius;
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    padding: $spacing-md;
    border-bottom: 1rpx solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    .icon {
      width: 60rpx;
      font-size: 32rpx;
    }

    .text {
      flex: 1;
      font-size: 30rpx;
      color: $text-primary;
    }

    .arrow {
      color: $text-placeholder;
      font-size: 36rpx;
    }
  }
}

.footer-text {
  text-align: center;
  font-size: 22rpx;
  color: $text-placeholder;
  padding: $spacing-md 0 $spacing-xl;
}
</style>
