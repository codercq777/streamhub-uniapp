<script setup lang="ts">
import { ref, computed } from 'vue'
import { publishNote } from '@/api/stream'
import { toast } from '@/utils/platform'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const title = ref('')
const content = ref('')
const images = ref<string[]>([])
const tagInput = ref('')
const tags = ref<string[]>([])
const submitting = ref(false)

const canSubmit = computed(() => title.value.trim() && (images.value.length || content.value.trim()))

function chooseImage() {
  if (images.value.length >= 9) {
    toast('最多 9 张图片')
    return
  }
  uni.chooseImage({
    count: 9 - images.value.length,
    success: (res: any) => {
      // mock 模式下:把临时路径直接当作"已上传"
      images.value.push(...(res.tempFilePaths as string[]))
    },
  })
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

function addTag() {
  const t = tagInput.value.trim().replace(/^#/, '')
  if (!t) return
  if (tags.value.length >= 5) {
    toast('最多 5 个标签')
    return
  }
  if (!tags.value.includes(t)) {
    tags.value.push(t)
  }
  tagInput.value = ''
}

function removeTag(t: string) {
  tags.value = tags.value.filter((x) => x !== t)
}

async function onSubmit() {
  if (!canSubmit.value || submitting.value) return
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  submitting.value = true
  try {
    await publishNote({
      title: title.value,
      content: content.value,
      images: images.value,
      tags: tags.value,
    })
    toast('发布成功', 'success')
    setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 1200)
  } catch {
    toast('发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="page">
    <view class="form">
      <input v-model="title" class="title-input" placeholder="写个标题吧(必填)" maxlength="30" />

      <textarea
        v-model="content"
        class="content-input"
        placeholder="说点什么... (选填,2000 字以内)"
        maxlength="2000"
        auto-height
      />

      <!-- 图片选择 -->
      <view class="images">
        <view v-for="(img, i) in images" :key="i" class="image-item">
          <image :src="img" mode="aspectFill" class="img" />
          <view class="remove" @tap="removeImage(i)">×</view>
        </view>
        <view v-if="images.length < 9" class="add-btn" @tap="chooseImage">
          <text class="plus">+</text>
          <text class="hint">{{ images.length }}/9</text>
        </view>
      </view>

      <!-- 标签 -->
      <view class="tags-row">
        <text v-for="t in tags" :key="t" class="tag" @tap="removeTag(t)">#{{ t }} ×</text>
        <input
          v-model="tagInput"
          class="tag-input"
          placeholder="添加标签(回车确认)"
          @confirm="addTag"
          maxlength="10"
        />
      </view>

      <button class="submit" :disabled="!canSubmit || submitting" @tap="onSubmit">
        {{ submitting ? '发布中...' : '发布' }}
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $spacing-sm;
}

.form {
  background: $bg-card;
  border-radius: $border-radius;
  padding: $spacing-md;
}

.title-input {
  width: 100%;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-color;
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  font-size: $font-size-base;
  padding: $spacing-md 0;
  line-height: $line-height-normal;
}

.images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin: $spacing-md 0;

  .image-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: $border-radius-sm;
    overflow: hidden;

    .img {
      width: 100%;
      height: 100%;
    }

    .remove {
      position: absolute;
      top: 4rpx;
      right: 4rpx;
      width: 40rpx;
      height: 40rpx;
      line-height: 36rpx;
      text-align: center;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border-radius: 50%;
      font-size: $font-size-lg;
    }
  }

  .add-btn {
    aspect-ratio: 1;
    background: #f5f5f5;
    border: 2rpx dashed #ccc;
    border-radius: $border-radius-sm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $text-secondary;

    .plus {
      font-size: 60rpx;
      line-height: 1;
    }
    .hint {
      font-size: 22rpx;
      margin-top: 4rpx;
    }
  }
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: $spacing-md 0;
  border-top: 1rpx solid $border-color;
  align-items: center;

  .tag {
    background: rgba(255, 36, 66, 0.08);
    color: $primary;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: $font-size-sm;
  }

  .tag-input {
    flex: 1;
    min-width: 200rpx;
    font-size: 26rpx;
    padding: 6rpx 0;
  }
}

.submit {
  width: 100%;
  background: $primary;
  color: #fff;
  font-size: $font-size-md;
  border-radius: 48rpx;
  margin-top: $spacing-lg;

  &[disabled] {
    background: $text-placeholder;
    color: #fff;
  }
}
</style>
