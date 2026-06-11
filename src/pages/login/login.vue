<!--
  登录页 - 真微信授权

  流程(小程序端):
    1. 用户点 "微信授权登录" 按钮
    2. <button open-type="chooseAvatar"> 弹微信选择头像浮层
    3. <input type="nickname"> 输入/预填昵称
    4. 点 "完成" → userStore.loginFromWechat 保存到本地 → 跳首页

  H5 端:没有 WeChat API,直接 mock 头像昵称入本地
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/platform'

const userStore = useUserStore()
const loading = ref(false)
const avatarUrl = ref('')
const nickname = ref('')

/** 微信原生:用户选了头像 */
function onChooseAvatar(e: any) {
  // #ifdef MP-WEIXIN
  avatarUrl.value = e.detail.avatarUrl
  // #endif
}

/** 微信原生:input type="nickname" 双向绑定,自动带 WeChat 预填的昵称 */

/** H5 端:点击"选择头像"按钮时给个 mock 头像 */
function onChooseAvatarClick() {
  // #ifdef H5
  const seed = Math.floor(Math.random() * 70) + 1
  avatarUrl.value = `https://i.pravatar.cc/300?img=${seed}`
  // #endif
}

/** 主登录:保存到 userStore,跳首页 */
async function onConfirm() {
  if (!avatarUrl.value) {
    toast('请先选择头像')
    return
  }
  if (!nickname.value.trim()) {
    toast('请填写昵称')
    return
  }
  loading.value = true
  try {
    userStore.loginFromWechat({
      avatarUrl: avatarUrl.value,
      nickname: nickname.value.trim(),
    })
    toast('登录成功', 'success')
    setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 600)
  } catch (e) {
    toast('登录失败')
  } finally {
    loading.value = false
  }
}

/** 跳过登录:保留未登录态 */
function onSkip() {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="page">
    <!-- Logo -->
    <view class="logo">
      <text class="logo-text">StreamHub</text>
      <text class="slogan">记录生活,发现精彩</text>
    </view>

    <!-- 头像选择 -->
    <view class="avatar-section">
      <button
        class="avatar-btn"
        open-type="chooseAvatar"
        @chooseavatar="onChooseAvatar"
        @tap="onChooseAvatarClick"
      >
        <image v-if="avatarUrl" :src="avatarUrl" class="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder">
          <text class="placeholder-icon">📷</text>
          <text class="placeholder-text">点击选择头像</text>
        </view>
      </button>
      <text class="avatar-tip">点击选择您的微信头像</text>
    </view>

    <!-- 昵称输入 -->
    <view class="nickname-section">
      <text class="label">昵称</text>
      <input
        v-model="nickname"
        class="nickname-input"
        type="nickname"
        placeholder="请输入昵称(微信将自动预填)"
        maxlength="20"
        placeholder-class="placeholder"
      />
    </view>

    <!-- 操作 -->
    <view class="actions">
      <button
        class="btn-primary"
        :disabled="loading || !avatarUrl || !nickname"
        @tap="onConfirm"
      >
        {{ loading ? '登录中...' : '完成登录' }}
      </button>
      <button class="btn-ghost" @tap="onSkip">先逛逛</button>
    </view>

    <view class="agreement">
      <text>登录即代表同意《用户协议》与《隐私政策》</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-card;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx $spacing-7 0;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;

  .logo-text {
    font-size: 64rpx;
    font-weight: $font-weight-bold;
    color: $primary;
    letter-spacing: 4rpx;
  }

  .slogan {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-top: $spacing-4;
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-9;

  .avatar-btn {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    overflow: hidden;
    padding: 0;
    background: transparent;
    line-height: 0;
    border: 4rpx solid $border-color;
    transition: border-color $duration $ease-out;

    &::after {
      border: none; // 去除 button 默认边框
    }

    &:active {
      border-color: $primary;
    }
  }

  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: $bg-page;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $text-tertiary;

    .placeholder-icon {
      font-size: 64rpx;
      line-height: 1;
      margin-bottom: $spacing-2;
    }

    .placeholder-text {
      font-size: $font-size-xs;
    }
  }

  .avatar-tip {
    margin-top: $spacing-4;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}

.nickname-section {
  width: 100%;
  margin-bottom: $spacing-9;

  .label {
    display: block;
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-3;
    padding-left: $spacing-1;
  }

  .nickname-input {
    width: 100%;
    height: 88rpx;
    background: $bg-page;
    border-radius: $radius-md;
    padding: 0 $spacing-5;
    font-size: $font-size-base;
    color: $text-primary;
    box-sizing: border-box;

    &:focus {
      background: $bg-card;
      box-shadow: 0 0 0 2rpx $primary;
    }
  }

  .placeholder {
    color: $text-placeholder;
  }
}

.actions {
  width: 100%;

  .btn-primary {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: $primary;
    color: #fff;
    font-size: $font-size-lg;
    border-radius: $radius-pill;
    margin-bottom: $spacing-4;
    font-weight: $font-weight-medium;
    box-shadow: $shadow-primary;
    transition: opacity $duration $ease-out, transform $duration $ease-out;

    &:active {
      opacity: 0.85;
      transform: scale(0.99);
    }

    &[disabled] {
      background: $text-placeholder;
      color: #fff;
      box-shadow: none;
      opacity: 0.6;
    }
  }

  .btn-ghost {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: transparent;
    color: $text-regular;
    font-size: $font-size-base;
    border-radius: $radius-pill;
  }
}

.agreement {
  position: fixed;
  bottom: $spacing-9;
  left: 0;
  right: 0;
  text-align: center;
  font-size: $font-size-xs;
  color: $text-placeholder;
}
</style>
