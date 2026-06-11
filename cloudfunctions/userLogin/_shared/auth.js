/**
 * 云函数公共:鉴权辅助
 * 微信云开发自带 OPENID 注入,这里给个统一封装
 */

const { db } = require('./db')

/**
 * 从 event(用户传入)或 context(系统注入)里拿 openid
 * 同时校验是否已登录(必须有 openid)
 *
 * 返回: { openid } 或 throws '未登录'
 */
function requireOpenid(cloudContext) {
  const openid = cloudContext.OPENID
  if (!openid) {
    const err = new Error('未登录')
    err.code = 401
    throw err
  }
  return { openid }
}

/**
 * 拿当前用户文档
 * 返回 UserDoc 或 null
 */
async function getCurrentUser(cloudContext) {
  const { openid } = requireOpenid(cloudContext)
  const res = await db.collection('users').where({ _openid: openid }).limit(1).get()
  return res.data[0] || null
}

module.exports = { requireOpenid, getCurrentUser }
