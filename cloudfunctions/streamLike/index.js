/**
 * streamLike 云函数
 * 入参: { id: note _id, liked: boolean }
 * 出参: { code: 0, data: { liked, likes } }
 *
 * 写 likes 集合(关系),更新 notes.stats.likes
 * 用事务保证一致性
 */
const { db, _ } = require('./_shared/db')
const { ok, fail } = require('./_shared/response')
const { requireOpenid } = require('./_shared/auth')

exports.main = async (event, context) => {
  const { id, liked } = event
  if (!id) return fail(400, '缺少 id')

  try {
    const { openid } = requireOpenid(context)
    const likesCol = db.collection('likes')
    const notesCol = db.collection('notes')
    const _id = `${openid}_${id}` // 关系 _id 约定

    if (liked) {
      // 写一条 like(已存在则忽略)
      try {
        await likesCol.add({
          data: {
            _id,
            user_id: openid,
            note_id: id,
            created_at: Date.now(),
          },
        })
      } catch (e) {
        if (!e.errMsg?.includes('already exists')) throw e
      }
    } else {
      // 删 like
      await likesCol.doc(_id).remove().catch(() => {})
    }

    // 计数修正
    const countRes = await likesCol.where({ note_id: id }).count()
    await notesCol.doc(id).update({
      data: { 'stats.likes': countRes.total },
    })

    return ok({ liked, likes: countRes.total })
  } catch (err) {
    if (err.code === 401) return fail(401, '请先登录')
    console.error('[streamLike] error:', err)
    return fail(500, err.message || '操作失败')
  }
}
