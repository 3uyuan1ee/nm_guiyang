/**
 * 时间工具函数模块
 * 用于时间转换、比较和跨天处理
 */

/**
 * 将 "HH:mm" 格式的时间转换为分钟数
 * @param {string} time - 时间字符串，格式 "HH:mm"
 * @returns {number} 从 00:00 开始的分钟数
 * @example
 * timeToMinutes('02:30') // => 150
 * timeToMinutes('23:59') // => 1439
 */
export function timeToMinutes(time) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

/**
 * 将分钟数转换为 "HH:mm" 格式
 * @param {number} minutes - 分钟数（0-1439）
 * @returns {string} 格式化的时间字符串
 * @example
 * minutesToTime(150) // => '02:30'
 * minutesToTime(1439) // => '23:59'
 */
export function minutesToTime(minutes) {
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

/**
 * 判断 current 是否在 start 和 end 之间（支持跨天）
 * @param {string} current - 当前时间 "HH:mm"
 * @param {string} start - 开始时间 "HH:mm"
 * @param {string} end - 结束时间 "HH:mm"
 * @returns {boolean} 是否在时间范围内
 * @example
 * isTimeBetween('23:00', '21:00', '02:00') // => true (跨天)
 * isTimeBetween('20:00', '21:00', '02:00') // => false
 * isTimeBetween('22:00', '18:00', '23:00') // => true (不跨天)
 */
export function isTimeBetween(current, start, end) {
  const currentMin = timeToMinutes(current)
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)

  // 处理跨天情况（如 21:00 - 04:00）
  if (endMin < startMin) {
    return currentMin >= startMin || currentMin <= endMin
  }

  // 正常情况（如 18:00 - 23:00）
  return currentMin >= startMin && currentMin <= endMin
}
