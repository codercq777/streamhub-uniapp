/**
 * userInfo 云函数
 * 入参: (无)
 * 出参: { code: 0, data: UserInfo }
 *
 * 流程: 从 context.OPENID 拿当前用户
 */
const { db } = require('../_shared/db')
const { ok, fail } = require('../_shared/response')
const { getCurrentUser } = require('../_shared/auth')

exports.main = async (event, context) => {
  try {
    const user = await getCurrentUser(context)
    if (!user) {
      return fail(404, '用户不存在')
    }
    return ok(user)
  } catch (err) {
    if (err.code === 401) return fail(401, '未登录')
    console.error('[userInfo] error:', err)
    return fail(500, err.message || '查询失败')
  }
}
