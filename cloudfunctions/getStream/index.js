/**
 * getStream 云函数
 * 入参:{ page, pageSize, tab: 'recommend' | 'follow' }
 * 出参:{ code: 0, data: { list, hasMore, total } }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { page = 1, pageSize = 20, tab = 'recommend' } = event
  const skip = (page - 1) * pageSize

  try {
    // 推荐流:按时间倒序
    // 关注流:需要先查关注列表,再 join(此处简化,只查全部)
    const notesCol = db.collection('notes')

    const query = notesCol
      .where({ status: 0 }) // 只查正常状态
      .orderBy('created_at', 'desc')
      .skip(skip)
      .limit(pageSize)

    const [listRes, countRes] = await Promise.all([
      query.get(),
      notesCol.where({ status: 0 }).count(),
    ])

    return {
      code: 0,
      data: {
        list: listRes.data,
        hasMore: skip + listRes.data.length < countRes.total,
        total: countRes.total,
      },
    }
  } catch (err) {
    console.error('[getStream] error:', err)
    return { code: 500, message: err.message || '查询失败' }
  }
}
