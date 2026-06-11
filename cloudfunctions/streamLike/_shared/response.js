/**
 * 云函数公共:统一响应格式
 *
 * 约定:
 *   { code: 0, data: ... }      成功
 *   { code: 4xx, message: ... } 客户端错误
 *   { code: 5xx, message: ... } 服务端错误
 *
 * 前端 request.ts 会按 code 判断
 */

function ok(data) {
  return { code: 0, data }
}

function fail(code, message) {
  return { code, message }
}

module.exports = { ok, fail }
