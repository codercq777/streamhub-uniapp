/**
 * userLogin 云函数
 * 入参: { code: 微信 code, nickname?, avatar? }
 * 出参: { code: 0, data: { token, userInfo } }
 *
 * 流程:
 *   1. 用 code 换 openid + session_key
 *   2. 查 users 集合,不存在则创建
 *   3. 生成 token 返回
 */
const { db } = require('./_shared/db')
const { ok, fail } = require('./_shared/response')

const WX_APPID = process.env.WX_APPID || '请替换为你的小程序 appid'
const WX_SECRET = process.env.WX_SECRET || '请替换为你的小程序 secret'

exports.main = async (event, context) => {
  const { code, nickname, avatar } = event

  if (!code) {
    return fail(400, '缺少 code')
  }

  try {
    // 1. code → openid
    const cloud = require('wx-server-sdk')
    const wxRes = await cloud.openapi.auth.code2Session({
      appid: WX_APPID,
      secret: WX_SECRET,
      js_code: code,
      grant_type: 'authorization_code',
    })

    const openid = wxRes.openid
    if (!openid) {
      return fail(500, '微信授权失败')
    }

    // 2. 查 / 建用户
    const userCol = db.collection('users')
    const exist = await userCol.where({ _openid: openid }).limit(1).get()

    let userInfo
    if (exist.data.length === 0) {
      const addRes = await userCol.add({
        data: {
          _openid: openid,
          nickname: nickname || `用户${openid.slice(-4)}`,
          avatar: avatar || 'https://i.pravatar.cc/200',
          bio: '',
          role: 'user',
          followers: 0,
          following: 0,
          notes_count: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      })
      userInfo = {
        _id: addRes._id,
        _openid: openid,
        nickname: nickname || `用户${openid.slice(-4)}`,
        avatar: avatar || 'https://i.pravatar.cc/200',
        bio: '',
        followers: 0,
        following: 0,
        notes_count: 0,
      }
    } else {
      userInfo = exist.data[0]
    }

    // 3. token(简单实现,生产建议 JWT)
    const token = `tk_${openid.slice(-8)}_${Date.now()}`

    return ok({ token, userInfo })
  } catch (err) {
    console.error('[userLogin] error:', err)
    return fail(500, err.message || '登录失败')
  }
}
