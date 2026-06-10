<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/platform'

const userStore = useUserStore()
const loading = ref(false)

async function onWechatLogin() {
  loading.value = true
  try {
    await userStore.doLogin()
    toast('登录成功', 'success')
    setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 800)
  } catch (e) {
    toast('登录失败')
  } finally {
    loading.value = false
  }
}

function onSkipLogin() {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="page">
    <view class="logo">
      <text class="logo-text">StreamHub</text>
      <text class="slogan">记录生活,发现精彩</text>
    </view>

    <view class="actions">
      <button class="btn-primary" :disabled="loading" @tap="onWechatLogin">
        {{ loading ? '登录中...' : '微信一键登录' }}
      </button>
      <button class="btn-ghost" @tap="onSkipLogin">先逛逛</button>
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
  padding: 200rpx $spacing-lg 0;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 200rpx;

  .logo-text {
    font-size: 64rpx;
    font-weight: 700;
    color: $primary;
    letter-spacing: 4rpx;
  }

  .slogan {
    font-size: 28rpx;
    color: $text-secondary;
    margin-top: $spacing-md;
  }
}

.actions {
  width: 100%;

  .btn-primary {
    width: 100%;
    background: $primary;
    color: #fff;
    font-size: 32rpx;
    border-radius: 48rpx;
    margin-bottom: $spacing-md;

    &[disabled] {
      opacity: 0.6;
    }
  }

  .btn-ghost {
    width: 100%;
    background: transparent;
    color: $text-regular;
    font-size: 28rpx;
    border-radius: 48rpx;
  }
}

.agreement {
  position: fixed;
  bottom: $spacing-xl;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 22rpx;
  color: $text-placeholder;
}
</style>
