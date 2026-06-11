/**
 * _seed 云函数(开发用)
 * 用途:往数据库灌一批测试数据,方便联调
 *
 * 使用:
 *   1. 部署到云开发
 *   2. 在云开发面板"云函数 → _seed → 测试",传入 {}
 *   3. 或者在小程序里调一次(需要鉴权,所以用云开发面板更方便)
 *
 * 幂等:已存在的 _id 不会重复插入(用 notes._id 前缀判断)
 * 重新调用会再插一批新的(不清理旧的)
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 测试用图片(用 picsum 随机图,带 seed 保证可复现)
function picsum(seed, w = 400, h = 400) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}
function pravatar(seed) {
  return `https://i.pravatar.cc/200?img=${seed}`
}

const TAGS = ['旅行', '美食', '生活', '摄影', '科技', '健身', '读书', '音乐']

// 30 条笔记数据(覆盖 5 个标签)
function buildNotes() {
  const notes = []
  for (let i = 0; i < 30; i++) {
    const authorIdx = (i % 5) + 1
    notes.push({
      _id: `seed_note_${String(i + 1).padStart(3, '0')}`,
      title: `${TAGS[i % TAGS.length]}笔记 #${i + 1}`,
      content: '一段示例内容,展示卡片的基本样式。包含文字、tag、作者信息等元素。点击可进入详情页查看完整内容。',
      images: [picsum(`note${i}`, 400, 300 + (i % 3) * 100)],
      tags: [TAGS[i % TAGS.length], TAGS[(i + 1) % TAGS.length]],
      author: {
        _id: `seed_user_${authorIdx}`,
        nickname: `创作者${authorIdx}`,
        avatar: pravatar(authorIdx),
      },
      stats: {
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        collects: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 100),
      },
      status: 'approved',
      liked: false,
      collected: false,
      created_at: Date.now() - i * 3600000,
      updated_at: Date.now() - i * 3600000,
    })
  }
  return notes
}

// 5 个测试用户
function buildUsers() {
  const users = []
  for (let i = 1; i <= 5; i++) {
    users.push({
      _id: `seed_user_${i}`,
      _openid: `seed_openid_${i}`, // 模拟,真用户登录会换成真实 openid
      nickname: `创作者${i}`,
      avatar: pravatar(i),
      bio: ['热爱生活的摄影师', '前端工程师', '旅行博主', '健身教练', '美食家'][i - 1],
      role: 'user',
      followers: Math.floor(Math.random() * 500),
      following: Math.floor(Math.random() * 200),
      notes_count: 6,
      created_at: Date.now() - 86400000 * 30,
      updated_at: Date.now() - 86400000,
    })
  }
  return users
}

// 10 条系统消息(给第一个用户)
function buildMessages() {
  const messages = []
  const types = ['like', 'comment', 'follow']
  for (let i = 0; i < 10; i++) {
    messages.push({
      _id: `seed_msg_${String(i + 1).padStart(3, '0')}`,
      type: types[i % 3],
      from_user: {
        _id: `seed_user_${(i % 5) + 1}`,
        nickname: `创作者${(i % 5) + 1}`,
        avatar: pravatar((i % 5) + 1),
      },
      to_user_id: 'seed_openid_1', // 给第一个用户
      content: types[i % 3] === 'like'
        ? '赞了你的笔记'
        : types[i % 3] === 'comment'
          ? '评论:太棒了!'
          : '关注了你',
      read: i > 5, // 前 5 条未读
      created_at: Date.now() - i * 3600000,
    })
  }
  return messages
}

exports.main = async (event, context) => {
  const OPENID = context.OPENID
  const result = { notes: 0, users: 0, messages: 0, errors: [] }

  try {
    // notes — 并行写,避免超时
    const notes = buildNotes()
    const noteResults = await Promise.allSettled(
      notes.map((n) => db.collection('notes').doc(n._id).set({ data: n }))
    )
    noteResults.forEach((r, i) => {
      if (r.status === 'fulfilled') result.notes++
      else result.errors.push(`note ${notes[i]._id}: ${r.reason?.message}`)
    })

    // users(只在没有 OPENID 时插入模拟用户,有 OPENID 时跳过避免污染)
    if (!OPENID) {
      const users = buildUsers()
      const userResults = await Promise.allSettled(
        users.map((u) => db.collection('users').doc(u._id).set({ data: u }))
      )
      userResults.forEach((r, i) => {
        if (r.status === 'fulfilled') result.users++
        else result.errors.push(`user ${users[i]._id}: ${r.reason?.message}`)
      })
    } else {
      result.users = 'skipped (有 OPENID,不插模拟用户)'
    }

    // messages
    const messages = buildMessages()
    const msgResults = await Promise.allSettled(
      messages.map((m) => db.collection('messages').doc(m._id).set({ data: m }))
    )
    msgResults.forEach((r, i) => {
      if (r.status === 'fulfilled') result.messages++
      else result.errors.push(`msg ${messages[i]._id}: ${r.reason?.message}`)
    })

    return { code: 0, data: result }
  } catch (err) {
    console.error('[seed] error:', err)
    return { code: 500, message: err.message, data: result }
  }
}
