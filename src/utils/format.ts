/**
 * 格式化工具
 */

/** 相对时间:刚刚 / X 分钟前 / X 小时前 / X 天前 / 具体日期 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour

  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`

  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 数字格式化:超过 1000 显示 1.2k,超过 10000 显示 1.5w */
export function formatCount(count: number): string {
  if (!count) return '0'
  if (count < 1000) return String(count)
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`
  return `${(count / 10000).toFixed(1)}w`
}

/** 文本截断 */
export function truncate(text: string, max = 50): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}
