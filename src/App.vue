<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  console.log('[App] launched')
  // 启动时尝试读取本地 token，失败则不动作
  useUserStore().bootstrap()
})
</script>

<style lang="scss">
/* 全局样式 - 注意 rpx 在 H5 与小程序均自适应 */
@import './uni.scss';

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

/* 通用类 */
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-col { display: flex; flex-direction: column; }
.text-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 安全区适配 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
