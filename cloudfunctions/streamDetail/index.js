/**
 * streamDetail 云函数
 * 入参: { id: note _id }
 * 出参: { code: 0, data: NoteItem }
 *
 * 顺手 +1 views
 */
const { db, _ } = require('../_shared/db')
const { ok, fail } = require('../_shared/response')

exports.main = async (event) => {
  const { id } = event
  if (!id) return fail(400, '缺少 id')

  try {
    const notesCol = db.collection('notes')
    const res = await notesCol.doc(id).get()
    if (!res.data) return fail(404, '笔记不存在')

    // +1 浏览数(异步,不阻塞返回)
    notesCol.doc(id).update({
      data: {
        'stats.views': _.inc(1),
      },
    }).catch((e) => console.warn('[streamDetail] views inc fail:', e))

    return ok({ ...res.data, liked: false, collected: false })
  } catch (err) {
    console.error('[streamDetail] error:', err)
    return fail(500, err.message || '查询失败')
  }
}
