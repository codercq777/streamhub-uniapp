/**
 * messageList 云函数
 * 入参: { page, pageSize }
 * 出参: { code: 0, data: { list, hasMore } }
 *
 * 取当前用户的所有消息,按时间倒序
 */
const { db, _ } = require('../_shared/db')
const { ok, fail } = require('../_shared/response')
const { requireOpenid } = require('../_shared/auth')

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20 } = event
  const skip = (page - 1) * pageSize

  try {
    const { openid } = requireOpenid(context)
    const msgCol = db.collection('messages')

    const query = msgCol
      .where({ to_user_id: openid })
      .orderBy('created_at', 'desc')
      .skip(skip)
      .limit(pageSize)

    const [listRes, countRes] = await Promise.all([
      query.get(),
      msgCol.where({ to_user_id: openid }).count(),
    ])

    return ok({
      list: listRes.data,
      hasMore: skip + listRes.data.length < countRes.total,
      total: countRes.total,
    })
  } catch (err) {
    if (err.code === 401) return fail(401, '请先登录')
    console.error('[messageList] error:', err)
    return fail(500, err.message || '查询失败')
  }
}
