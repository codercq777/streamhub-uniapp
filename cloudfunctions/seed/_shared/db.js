/**
 * 云函数公共:云开发初始化 + 数据库实例
 * 用法:
 *   const { db, _ } = require('./_shared/db')
 */

const cloud = require('wx-server-sdk')

// 自动使用当前云开发环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

module.exports = { cloud, db, _, $ }
