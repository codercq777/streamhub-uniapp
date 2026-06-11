/**
 * streamList 云函数
 * 入参: { page, pageSize, tab: 'recommend' | 'follow' }
 * 出参: { code: 0, data: { list, hasMore, total } }
 *
 * 行为:
 * 1. 首次调用(notes 集合为空)→ 自动灌 5 条 demo 数据
 * 2. 后续调用 → 从 DB 读
 * 3. tab='follow' 简化处理,直接返回全部(关注流需要 join follows,demo 暂不做)
 */
const { db, _ } = require('./_shared/db')
const { ok, fail } = require('./_shared/response')

const TAGS = ['旅行', '美食', '生活', '摄影', '科技']
function picsum(seed, w = 400, h = 400) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}
function pravatar(seed) {
  return `https://i.pravatar.cc/200?img=${seed}`
}

const DEMO_NOTES = [
  { title: '沈阳故宫的雪', tags: ['旅行', '摄影'], author: '东北小张', seed: 'shenyang1' },
  { title: '老四季抻面推荐', tags: ['美食', '生活'], author: '本地老饕', seed: 'mian2' },
  { title: '中街逛街攻略', tags: ['生活', '旅行'], author: '沈阳小仙女', seed: 'zhongjie3' },
  { title: '前端学习路线 2026', tags: ['科技', '学习'], author: '东北小张', seed: 'fe4' },
  { title: '云开发踩坑记', tags: ['科技', '笔记'], author: '本地老饕', seed: 'cloud5' },
]

/** 首次调用时,把 5 条 demo 数据写进 DB,然后返回 */
async function ensureSeed() {
  try {
    const countRes = await db.collection('notes').where({ status: 'approved' }).count()
    if (countRes.total > 0) return // 已有数据,不重复灌
  } catch (e) {
    // 集合不存在,继续灌(set 会自动建集合)
    console.warn('[streamList] count 失败(可能集合未建),继续灌:', e.message)
  }

  const writes = DEMO_NOTES.map((d, i) => {
    const note = {
      _id: `demo_note_${String(i + 1).padStart(3, '0')}`,
      title: d.title,
      content: `示例内容:${d.title}。展示卡片基本样式,点击可进详情页。`,
      images: [picsum(d.seed, 400, 400 + (i % 3) * 100)],
      tags: d.tags,
      author: { _id: `demo_user_${(i % 3) + 1}`, nickname: d.author, avatar: pravatar((i % 3) + 1) },
      stats: {
        views: 1000 + Math.floor(Math.random() * 5000),
        likes: Math.floor(Math.random() * 500),
        collects: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50),
      },
      status: 'approved',
      liked: false,
      collected: false,
      created_at: Date.now() - i * 3600000,
      updated_at: Date.now() - i * 3600000,
    }
    return db.collection('notes').doc(note._id).set({ data: note })
  })
  await Promise.allSettled(writes)
  console.log('[streamList] auto-seeded', DEMO_NOTES.length, 'notes')
}

exports.main = async (event) => {
  const { page = 1, pageSize = 20, tab = 'recommend' } = event
  const skip = (page - 1) * pageSize

  try {
    // 首次自动灌数据
    await ensureSeed()

    const notesCol = db.collection('notes')
    const query = notesCol
      .where({ status: 'approved' })
      .orderBy('created_at', 'desc')
      .skip(skip)
      .limit(pageSize)

    const [listRes, countRes] = await Promise.all([
      query.get(),
      notesCol.where({ status: 'approved' }).count(),
    ])

    const list = listRes.data.map((n) => ({ ...n, liked: false, collected: false }))

    return ok({
      list,
      hasMore: skip + list.length < countRes.total,
      total: countRes.total,
    })
  } catch (err) {
    console.error('[streamList] error:', err)
    return fail(500, err.message || '查询失败')
  }
}
