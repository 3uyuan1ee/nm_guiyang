/**
 * 颜色工具函数模块
 * 用于类别颜色映射和颜色转换
 */

/**
 * 类别到 RGB 颜色的映射表
 * 对应 Deck.gl 所需的 [r, g, b] 格式（0-255）
 */
export const CATEGORY_COLORS = {
  '烧烤夜市': [236, 72, 153],      // #ec4899 (粉红)
  '火锅': [249, 115, 22],          // #f97316 (橙色)
  '酒吧': [139, 92, 246],          // #8b5cf6 (紫色)
  '咖啡': [251, 191, 36],          // #fbbf24 (黄色)
  '中餐厅': [20, 184, 166],        // #14b8a6 (青绿色)
  '家常菜': [16, 185, 129],        // #10b981 (绿色)
  '特色餐饮': [34, 211, 238],      // #22d3ee (青蓝)
  '饮品': [6, 182, 212],           // #06b6d4 (青色)
  '甜品糕点': [244, 114, 182],     // #f472b6 (粉色)
  '地方菜系': [251, 146, 60],      // #fb923c (橙黄)
  '快餐': [234, 179, 8],           // #eab308 (金黄)
  '异国料理': [168, 85, 247],      // #a855f7 (紫罗兰)
  '清真菜馆': [99, 102, 241]       // #6366f1 (靛蓝)
}

/**
 * 获取类别对应的 RGB 颜色数组
 * @param {string} category - 餐饮类别
 * @returns {number[]} RGB 颜色数组 [r, g, b]
 * @example
 * getCategoryColor('烧烤') // => [236, 72, 153]
 * getCategoryColor('未知') // => 使用哈希生成的颜色
 */
export function getCategoryColor(category) {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category]
  }

  // 对于未知类别，使用哈希函数生成一致的颜色
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }

  const h = Math.abs(hash % 360)
  const s = 70 + (Math.abs(hash >> 8) % 20)
  const l = 50 + (Math.abs(hash >> 16) % 15)

  return hslToRgb(h, s, l)
}

/**
 * 将 HSL 颜色转换为 RGB
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 饱和度 (0-100)
 * @param {number} l - 亮度 (0-100)
 * @returns {number[]} RGB 数组
 */
function hslToRgb(h, s, l) {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let r, g, b

  if (h < 60) {
    [r, g, b] = [c, x, 0]
  } else if (h < 120) {
    [r, g, b] = [x, c, 0]
  } else if (h < 180) {
    [r, g, b] = [0, c, x]
  } else if (h < 240) {
    [r, g, b] = [0, x, c]
  } else if (h < 300) {
    [r, g, b] = [x, 0, c]
  } else {
    [r, g, b] = [c, 0, x]
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ]
}

/**
 * 将 RGB 数组转换为 CSS 颜色字符串
 * @param {number[]} rgb - RGB 数组 [r, g, b]
 * @returns {string} CSS 颜色字符串
 * @example
 * rgbToCss([236, 72, 153]) // => 'rgb(236, 72, 153)'
 */
export function rgbToCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

/**
 * 获取类别对应的 CSS 颜色字符串
 * @param {string} category - 餐饮类别
 * @returns {string} CSS 颜色字符串
 * @example
 * getCategoryColorCss('烧烤') // => 'rgb(236, 72, 153)'
 */
export function getCategoryColorCss(category) {
  return rgbToCss(getCategoryColor(category))
}
