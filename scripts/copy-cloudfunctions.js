#!/usr/bin/env node
/**
 * 同步 cloudfunctions/ 到 build 输出
 *
 * 用途:
 *   uni-app 不会自动把源码 cloudfunctions/ 复制到 dist/dev/mp-weixin/cloudfunctions/,
 *   导致 微信开发者工具 看不到,无法上传云函数。
 *
 * 用法:
 *   node scripts/copy-cloudfunctions.js          # 单次复制
 *   node scripts/copy-cloudfunctions.js --watch  # 监听源码变化自动复制
 *
 * 典型流程:
 *   1. 终端 A: npm run dev:mp-weixin
 *   2. 终端 B: npm run copy:cf -- --watch
 *   3. 改了云函数代码,自动同步到 build 输出
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'cloudfunctions');
const DEST = path.join(ROOT, 'dist', 'dev', 'mp-weixin', 'cloudfunctions');

function copy() {
  if (!fs.existsSync(SRC)) {
    console.error(`❌ 源码目录不存在: ${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(DEST, { recursive: true });
  // 先清空 DEST 避免残留文件
  if (fs.existsSync(DEST)) {
    fs.rmSync(DEST, { recursive: true, force: true });
  }
  fs.mkdirSync(DEST, { recursive: true });
  execSync(`cp -r "${SRC}/." "${DEST}/"`, { stdio: 'inherit' });
  const count = fs.readdirSync(DEST).length;
  console.log(`✅ cloudfunctions/ → dist/dev/mp-weixin/cloudfunctions/  (${count} 项)`);
}

if (process.argv.includes('--watch')) {
  console.log('👀 监听 cloudfunctions/ 变化...');
  copy();
  // 用 fs.watch 简单监听(够用,不依赖 chokidar)
  let timer = null;
  fs.watch(SRC, { recursive: true }, () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log('\n🔄 检测到变化,重新复制...');
      copy();
    }, 200);
  });
} else {
  copy();
}
