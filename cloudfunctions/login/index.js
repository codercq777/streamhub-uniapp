/**
 * login 云函数
 * 入参:{ code: 微信 code, nickname?, avatar? }
 * 出参:{ code: 0, data: { token, userInfo } }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

const WX_APPID = '请替换为你的小程序 appid'
const WX_SECRET = '请替换为你的小程序 secret'

exports.main = async (event) => {
  const { code, nickname, avatar } = event

  if (!code) {
    return { code: 400, message: '缺少 code' }
  }

  try {
    // 1. 用 code 换 openid + session_key
    const wxRes = await cloud.openapi.auth.code2Session({
      appid: WX_APPID,
      secret: WX_SECRET,
      js_code: code,
      grant_type: 'authorization_code',
    })

    const openid = wxRes.openid
    if (!openid) {
      return { code: 500, message: '微信授权失败' }
    }

    // 2. 查询用户,不存在则创建
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
          followers: 0,
          following: 0,
          notes_count: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      })
      userInfo = { _id: addRes._id, _openid: openid, nickname, avatar }
    } else {
      userInfo = exist.data[0]
    }

    // 3. 生成自定义 token(简单实现,生产建议用 JWT)
    const token = `tk_${openid}_${Date.now()}`

    return {
      code: 0,
      data: { token, userInfo },
    }
  } catch (err) {
    console.error('[login] error:', err)
    return { code: 500, message: err.message || '登录失败' }
  }
}
