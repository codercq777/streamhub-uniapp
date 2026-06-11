/**
 * streamPublish 云函数
 * 入参: { title, content, images, tags }
 * 出参: { code: 0, data: { _id } }
 *
 * 状态: 默认 'approved'(demo 简化,生产可改为 'pending' 走审核)
 */
const { db } = require('./_shared/db')
const { ok, fail } = require('./_shared/response')
const { getCurrentUser } = require('./_shared/auth')

exports.main = async (event, context) => {
  const { title, content, images = [], tags = [] } = event

  if (!title?.trim()) return fail(400, '标题必填')
  if (title.length > 30) return fail(400, '标题 30 字以内')
  if (content?.length > 2000) return fail(400, '正文 2000 字以内')
  if (images.length > 9) return fail(400, '图片最多 9 张')
  if (tags.length > 5) return fail(400, '标签最多 5 个')

  try {
    const user = await getCurrentUser(context)
    if (!user) return fail(401, '请先登录')

    const addRes = await db.collection('notes').add({
      data: {
        title: title.trim(),
        content: content || '',
        images,
        tags,
        author: {
          _id: user._id,
          nickname: user.nickname,
          avatar: user.avatar,
        },
        stats: {
          views: 0,
          likes: 0,
          collects: 0,
          comments: 0,
        },
        status: 'approved', // demo 简化:直接通过
        liked: false,
        collected: false,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
    })

    // 用户的笔记数 +1
    await db.collection('users').doc(user._id).update({
      data: {
        notes_count: db.command.inc(1),
        updated_at: Date.now(),
      },
    }).catch((e) => console.warn('[streamPublish] user count inc fail:', e))

    return ok({ _id: addRes._id })
  } catch (err) {
    if (err.code === 401) return fail(401, '请先登录')
    console.error('[streamPublish] error:', err)
    return fail(500, err.message || '发布失败')
  }
}
