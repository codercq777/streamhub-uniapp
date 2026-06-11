/**
 * streamList 云函数
 * 入参: { page, pageSize, tab: 'recommend' | 'follow' }
 * 出参: { code: 0, data: { list, hasMore, total } }
 *
 * 状态约定: status: 'approved' 才会被列出
 * 关注流: 简化处理,只取全部(生产环境需要 join follows)
 */
const { db, _ } = require('../_shared/db')
const { ok, fail } = require('../_shared/response')

exports.main = async (event) => {
  const { page = 1, pageSize = 20, tab = 'recommend' } = event
  const skip = (page - 1) * pageSize

  try {
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

    // 补 liked/collected 状态(当前用户视角)
    // 简化:全部 false,前端乐观更新即可
    const list = listRes.data.map((n) => ({
      ...n,
      liked: false,
      collected: false,
    }))

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
