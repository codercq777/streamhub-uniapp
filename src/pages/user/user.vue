<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useStreamStore } from '@/stores/stream'

const userStore = useUserStore()
const streamStore = useStreamStore()

/** 从 userStore 拿真实数据,登录后才有;未登录显示 0 */
const stats = computed(() => [
  { label: '发布', value: userStore.userInfo?.notes_count ?? 0, key: 'notes' },
  { label: '关注', value: userStore.userInfo?.following ?? 0, key: 'following' },
  { label: '粉丝', value: userStore.userInfo?.followers ?? 0, key: 'followers' },
  { label: '获赞', value: streamStore.totalLikes ?? 0, key: 'likes' },
])

function onLoginTap() {
  uni.navigateTo({ url: '/pages/login/login' })
}

function onMenuTap(key: string) {
  if (!userStore.isLoggedIn && key !== 'settings') {
    // 大部分菜单需要登录,提示去登录
    uni.showModal({
      title: '需要登录',
      content: '该功能需要登录后使用,是否前往登录?',
      success: (res) => {
        if (res.confirm) uni.navigateTo({ url: '/pages/login/login' })
      },
    })
    return
  }
  // 各项菜单暂时 toast 占位(扩展功能在 P2 阶段补全)
  const messages: Record<string, string> = {
    notes: '我的发布:展示当前用户的所有笔记(P2 计划)',
    collects: '我的收藏:展示收藏的笔记(P2 计划)',
    messages: '消息通知:系统消息列表',
    settings: '设置:清缓存、关于、协议等(P3 计划)',
  }
  uni.showToast({ title: messages[key] || '功能开发中', icon: 'none', duration: 1500 })
}

function onSettingsTap() {
  // 设置不需要登录,直接进
  uni.showActionSheet({
    itemList: ['清空本地缓存', '关于 StreamHub', '用户协议', '隐私政策'],
    success: (res) => {
      const items = ['清空本地缓存', '关于 StreamHub', '用户协议', '隐私政策']
      const picked = items[res.tapIndex]
      if (picked === '清空本地缓存') {
        try {
          uni.clearStorageSync()
          uni.showToast({ title: '已清空', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清空失败', icon: 'none' })
        }
      } else {
        uni.showModal({
          title: picked,
          content: picked === '关于 StreamHub'
            ? 'StreamHub Demo v1.0.0\n基于 uni-app + Vue 3 + TypeScript\nGitee / GitHub 开源'
            : 'demo 项目,无实际协议文本',
          showCancel: false,
        })
      }
    },
  })
}

function onLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗?',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
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
      <view class="menu-item" @tap="onMenuTap('notes')">
        <text class="icon">📝</text>
        <text class="text">我的发布</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="onMenuTap('collects')">
        <text class="icon">⭐</text>
        <text class="text">我的收藏</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="onMenuTap('messages')">
        <text class="icon">🔔</text>
        <text class="text">消息通知</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="onSettingsTap">
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
        font-size: $font-size-xl;
        font-weight: $font-weight-semibold;
        display: block;
      }

      .bio {
        font-size: $font-size-sm;
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
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
      }

      .label {
        display: block;
        font-size: $font-size-sm;
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
      font-size: $font-size-lg;
    }

    .text {
      flex: 1;
      font-size: $font-size-md;
      color: $text-primary;
    }

    .arrow {
      color: $text-placeholder;
      font-size: $font-size-xl;
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
