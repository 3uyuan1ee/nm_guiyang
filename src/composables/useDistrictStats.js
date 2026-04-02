import { ref, computed } from 'vue'

// 5 个区 + 2 个分组（老城、新城）的配置
const DISTRICT_CONFIG = {
  // 单独的区
  '南明区': { id: 'nanming', name: '南明区', group: 'old', color: [239, 68, 68, 180] },      // 红色
  '云岩区': { id: 'yunyan', name: '云岩区', group: 'old', color: [249, 115, 22, 180] },       // 橙色
  '观山湖区': { id: 'guanshanhu', name: '观山湖区', group: 'new', color: [34, 197, 94, 180] }, // 绿色
  '花溪区': { id: 'huaxi', name: '花溪区', group: 'old', color: [168, 85, 247, 180] },        // 紫色
  '乌当区': { id: 'wudang', name: '乌当区', group: 'old', color: [236, 72, 153, 180] },       // 粉色

  // 分组模式
  '老城核心': { id: 'old-city', name: '老城核心', group: 'old', color: [251, 146, 60, 180] },  // 橘色
  '现代新城': { id: 'new-city', name: '现代新城', group: 'new', color: [59, 130, 246, 180] }   // 蓝色
}

// 与 CategoryFilter 一致的 13 个主要类别
const MAIN_CATEGORIES = [
  '中餐厅', '火锅', '咖啡', '家常菜', '烧烤夜市', '酒吧',
  '特色餐饮', '饮品', '甜品糕点', '地方菜系', '快餐',
  '异国料理', '清真菜馆'
]

// 类别分组（用于饼图）- 与主要类别对应
const CATEGORY_GROUPS = {
  '正餐': ['中餐厅', '家常菜', '地方菜系', '特色餐饮', '清真菜馆'],
  '火锅烧烤': ['火锅', '烧烤夜市'],
  '快餐': ['快餐', '甜品糕点'],
  '饮品': ['饮品', '咖啡', '酒吧'],
  '异国': ['异国料理']
}

function getCategoryGroup(category) {
  for (const [group, categories] of Object.entries(CATEGORY_GROUPS)) {
    if (categories.includes(category)) {
      return group
    }
  }
  return '其他'
}

// 判断点是否在多边形内（射线法，优化版）
function isPointInPolygon(point, polygon) {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    // 检查射线是否与边相交
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}

// 判断点是否在 MultiPolygon 内
function isPointInMultiPolygon(point, multiPolygon) {
  for (const polygon of multiPolygon) {
    // polygon 是一个 Polygon，polygon[0] 是外环
    const outerRing = polygon[0]
    if (isPointInPolygon(point, outerRing)) {
      return true
    }
  }
  return false
}

// 计算香森多样性指数
function calculateShannonIndex(counts) {
  const total = counts.reduce((sum, c) => sum + c, 0)
  if (total === 0) return 0

  let shannon = 0
  for (const count of counts) {
    if (count > 0) {
      const p = count / total
      shannon -= p * Math.log(p)
    }
  }
  return shannon
}

// 将时间字符串转换为分钟数（跨天处理）
function timeToMinutes(timeStr) {
  if (!timeStr) return null
  const [hour, minute] = timeStr.split(':').map(Number)
  return hour * 60 + minute
}

// 格式化分钟数为时间字符串
function minutesToTime(minutes) {
  if (minutes === null || minutes === undefined) return '--:--'
  const hour = Math.floor(minutes / 60) % 24
  const minute = Math.floor(minutes % 60)
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function useDistrictStats() {
  const districtData = ref(null)
  const hoveredDistrict = ref(null)

  // 加载区域边界数据
  async function loadDistrictData() {
    try {
      const response = await fetch(new URL('../assets/data/guiyang_district_boundary.geojson', import.meta.url))
      const data = await response.json()
      districtData.value = data
      console.log('区域边界数据加载成功，features:', data.features?.length)
      return data
    } catch (error) {
      console.error('加载区域边界数据失败:', error)
      return null
    }
  }

  // 给 POI 数据打上区域标签
  function assignDistrictToPOIs(pois, boundaryData) {
    if (!boundaryData) return pois

    // 构建区域边界索引
    const districtBoundaries = {}
    for (const feature of boundaryData.features) {
      const name = feature.properties?.name
      if (!name || !['南明区', '云岩区', '观山湖区', '花溪区', '乌当区'].includes(name)) {
        continue
      }

      let coordinates = null
      if (feature.geometry?.type === 'Polygon') {
        coordinates = feature.geometry.coordinates
      } else if (feature.geometry?.type === 'MultiPolygon') {
        coordinates = feature.geometry.coordinates
      }

      if (coordinates) {
        districtBoundaries[name] = {
          name,
          type: feature.geometry?.type,
          coordinates,
          feature
        }
      }
    }

    // 为每个 POI 分配区域
    const assigned = pois.map(poi => {
      // 使用原始坐标（GCJ-02），与边界数据坐标系一致
      const point = [poi.longitude, poi.latitude]
      let district = null

      for (const [name, boundary] of Object.entries(districtBoundaries)) {
        let inDistrict = false
        if (boundary.type === 'Polygon') {
          inDistrict = isPointInPolygon(point, boundary.coordinates[0])
        } else if (boundary.type === 'MultiPolygon') {
          inDistrict = isPointInMultiPolygon(point, boundary.coordinates)
        }

        if (inDistrict) {
          district = name
          break
        }
      }

      // 分组标签
      let group = null
      if (district === '南明区' || district === '云岩区') {
        group = '老城核心'
      } else if (district === '观山湖区') {
        group = '现代新城'
      }

      return {
        ...poi,
        district,
        districtGroup: group
      }
    })

    // 统计分配结果
    const stats = {}
    assigned.forEach(p => {
      const d = p.district || '未分配'
      stats[d] = (stats[d] || 0) + 1
    })
    console.log('POI 区域分配统计:', stats)

    return assigned
  }

  // 计算区域统计
  function calculateDistrictStats(pois, districtName, mode = 'district') {
    // 筛选属于该区域的 POI
    const filtered = pois.filter(poi => {
      if (mode === 'group') {
        // 在分组模式下，需要匹配 districtGroup
        if (districtName === '老城核心') {
          return poi.district === '南明区' || poi.district === '云岩区'
        } else if (districtName === '现代新城') {
          return poi.district === '观山湖区'
        }
        return poi.districtGroup === districtName
      }
      return poi.district === districtName
    })

    if (filtered.length === 0) {
      console.log(`区域 ${districtName} (${mode}) 没有数据`)
      return null
    }

    // 基础统计
    const totalCount = filtered.length
    const validRatings = filtered.filter(p => p.rating != null && p.rating > 0)
    const validCosts = filtered.filter(p => p.cost != null && p.cost > 0)

    // 平均评分
    const avgRating = validRatings.length > 0
      ? validRatings.reduce((sum, p) => sum + p.rating, 0) / validRatings.length
      : 0

    // 平均价格
    const avgCost = validCosts.length > 0
      ? validCosts.reduce((sum, p) => sum + p.cost, 0) / validCosts.length
      : 0

    // 价格区间分布 - 更有区分度的指标
    const lowPriceCount = validCosts.filter(p => p.cost <= 50).length
    const midPriceCount = validCosts.filter(p => p.cost > 50 && p.cost <= 100).length
    const highPriceCount = validCosts.filter(p => p.cost > 100).length

    // 评分区间分布 - 更有区分度的指标
    const highRatingCount = validRatings.filter(p => p.rating >= 4.0).length
    const midRatingCount = validRatings.filter(p => p.rating >= 3.5 && p.rating < 4.0).length
    const lowRatingCount = validRatings.filter(p => p.rating < 3.5).length

    // 类别统计 - 只统计主要类别
    const categoryCount = {}
    filtered.forEach(p => {
      // 只统计主要类别，其他的归为"其他"
      const cat = MAIN_CATEGORIES.includes(p.category) ? p.category : '其他'
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })

    // 类别多样性（使用类别数量作为简单指标）
    const categoryDiversity = Object.keys(categoryCount).length

    // 类别 Top 5（增加数量）
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => ({ category: cat, count, percent: (count / totalCount * 100).toFixed(1) }))

    // 类别分组统计（用于饼图）
    const groupCount = { '正餐': 0, '火锅烧烤': 0, '快餐': 0, '饮品': 0, '异国': 0, '其他': 0 }
    filtered.forEach(p => {
      const group = getCategoryGroup(p.category)
      groupCount[group]++
    })

    const categoryGroups = Object.entries(groupCount)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count, percent: (count / totalCount * 100).toFixed(1) }))

    // 评分分布（直方图）
    const ratingDistribution = [0, 0, 0, 0, 0] // <3.0, 3.0-3.5, 3.5-4.0, 4.0-4.5, >=4.5
    validRatings.forEach(p => {
      const r = p.rating
      if (r < 3.0) ratingDistribution[0]++
      else if (r < 3.5) ratingDistribution[1]++
      else if (r < 4.0) ratingDistribution[2]++
      else if (r < 4.5) ratingDistribution[3]++
      else ratingDistribution[4]++
    })

    // 平均最晚营业时间（夜经济指标）
    const closeTimes = filtered
      .map(p => {
        const close = p.close_time
        if (!close) return null

        const [closeHour, closeMinute] = close.split(':').map(Number)
        const open = p.open_time
        let openHour = 10
        if (open) {
          const [oh] = open.split(':').map(Number)
          openHour = oh
        }

        // 如果 close_time < open_time，说明跨天营业
        if (closeHour < openHour || closeHour < 6) {
          return (closeHour + 24) * 60 + closeMinute
        }
        return closeHour * 60 + closeMinute
      })
      .filter(t => t !== null)

    const avgCloseTime = closeTimes.length > 0
      ? closeTimes.reduce((sum, t) => sum + t, 0) / closeTimes.length
      : null

    // 性价比指数：高评分且价格合理的店铺占比
    // 定义：评分≥4.0 且价格≤80元
    const valueShopCount = filtered.filter(p => p.rating >= 4.0 && p.cost <= 80).length
    const valueScore = Math.round((valueShopCount / totalCount) * 100)

    return {
      name: districtName,
      mode,
      totalCount,
      avgRating: avgRating.toFixed(1),
      avgCost: Math.round(avgCost),
      // 价格分布
      lowPricePercent: (lowPriceCount / totalCount * 100).toFixed(1),
      midPricePercent: (midPriceCount / totalCount * 100).toFixed(1),
      highPricePercent: (highPriceCount / totalCount * 100).toFixed(1),
      // 评分分布
      highRatingPercent: (highRatingCount / totalCount * 100).toFixed(1),
      midRatingPercent: (midRatingCount / totalCount * 100).toFixed(1),
      lowRatingPercent: (lowRatingCount / totalCount * 100).toFixed(1),
      // 性价比：高评分低价店铺占比
      valueScore,
      // 类别丰富度
      categoryDiversity,
      // 其他
      topCategories,
      categoryGroups,
      ratingDistribution,
      avgCloseTime: minutesToTime(avgCloseTime),
      avgCloseTimeMinutes: avgCloseTime
    }
  }

  // 获取区域颜色
  function getDistrictColor(districtName, mode = 'district') {
    if (mode === 'group') {
      return DISTRICT_CONFIG[districtName]?.color || [100, 100, 100, 180]
    }
    return DISTRICT_CONFIG[districtName]?.color || [100, 100, 100, 180]
  }

  // 获取所有区域配置
  function getAllDistricts(mode = 'district') {
    if (mode === 'group') {
      return [
        { name: '老城核心', ...DISTRICT_CONFIG['老城核心'] },
        { name: '现代新城', ...DISTRICT_CONFIG['现代新城'] }
      ]
    }
    return [
      { name: '南明区', ...DISTRICT_CONFIG['南明区'] },
      { name: '云岩区', ...DISTRICT_CONFIG['云岩区'] },
      { name: '观山湖区', ...DISTRICT_CONFIG['观山湖区'] },
      { name: '花溪区', ...DISTRICT_CONFIG['花溪区'] },
      { name: '乌当区', ...DISTRICT_CONFIG['乌当区'] }
    ]
  }

  return {
    districtData,
    hoveredDistrict,
    loadDistrictData,
    assignDistrictToPOIs,
    calculateDistrictStats,
    getDistrictColor,
    getAllDistricts,
    DISTRICT_CONFIG
  }
}
