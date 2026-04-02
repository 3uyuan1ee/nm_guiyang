/**
 * 坐标系转换工具
 * 用于将 GCJ-02 (火星坐标) 转换为 WGS84 (国际标准坐标)
 */

const PI = 3.1415926535897932384626
const a = 6378245.0 // 长半轴
const ee = 0.00669342162296594323 // 扁率

/**
 * 判断是否在中国境内
 */
function isInChina(lon, lat) {
  return lon >= 72.004 && lon <= 137.8347 && lat >= 0.8293 && lat <= 55.8271
}

/**
 * 转换纬度
 */
function transformLat(x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0
  return ret
}

/**
 * 转换经度
 */
function transformLon(x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0
  return ret
}

/**
 * GCJ-02 (火星坐标) 转 WGS84
 * @param {number} lon - 经度
 * @param {number} lat - 纬度
 * @returns {[number, number]} [经度, 纬度]
 */
export function gcj02ToWgs84(lon, lat) {
  if (!isInChina(lon, lat)) {
    return [lon, lat]
  }

  let dLat = transformLat(lon - 105.0, lat - 35.0)
  let dLon = transformLon(lon - 105.0, lat - 35.0)
  let radLat = lat / 180.0 * PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  let sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI)
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI)
  let mgLat = lat + dLat
  let mgLon = lon + dLon

  return [lon * 2 - mgLon, lat * 2 - mgLat]
}

/**
 * WGS84 转 GCJ-02
 * @param {number} lon - 经度
 * @param {number} lat - 纬度
 * @returns {[number, number]} [经度, 纬度]
 */
export function wgs84ToGcj02(lon, lat) {
  if (!isInChina(lon, lat)) {
    return [lon, lat]
  }

  let dLat = transformLat(lon - 105.0, lat - 35.0)
  let dLon = transformLon(lon - 105.0, lat - 35.0)
  let radLat = lat / 180.0 * PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  let sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI)
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI)
  let mgLat = lat + dLat
  let mgLon = lon + dLon

  return [mgLon, mgLat]
}

/**
 * 计算两点间的大圆距离（单位：米）
 * 使用 Haversine 公式
 * @param {number} lon1 - 点1经度
 * @param {number} lat1 - 点1纬度
 * @param {number} lon2 - 点2经度
 * @param {number} lat2 - 点2纬度
 * @returns {number} 距离（米）
 */
export function haversineDistance(lon1, lat1, lon2, lat2) {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 计算点到线段的最短距离
 * @param {number} px - 点经度
 * @param {number} py - 点纬度
 * @param {number} x1 - 线段起点经度
 * @param {number} y1 - 线段起点纬度
 * @param {number} x2 - 线段终点经度
 * @param {number} y2 - 线段终点纬度
 * @returns {number} 距离（米）
 */
function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) param = dot / lenSq

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  return haversineDistance(px, py, xx, yy)
}

/**
 * 计算点到水岸（河流/湖泊）的最短距离
 * @param {number} lon - 点经度
 * @param {number} lat - 点纬度
 * @param {object} waterData - 水体数据 GeoJSON
 * @returns {number} 距离（米），如果无水体数据返回 Infinity
 */
export function distanceToWater(lon, lat, waterData) {
  if (!waterData || !waterData.features) return Infinity

  let minDistance = Infinity

  for (const feature of waterData.features) {
    if (!feature.geometry) continue

    const { type, coordinates } = feature.geometry

    if (type === 'LineString') {
      // 河流 - 计算到线段的距离
      for (let i = 0; i < coordinates.length - 1; i++) {
        const [lon1, lat1] = coordinates[i]
        const [lon2, lat2] = coordinates[i + 1]
        const dist = pointToSegmentDistance(lon, lat, lon1, lat1, lon2, lat2)
        minDistance = Math.min(minDistance, dist)
      }
    } else if (type === 'Polygon') {
      // 湖泊 - 计算到多边形边界的距离
      for (const ring of coordinates) {
        for (let i = 0; i < ring.length - 1; i++) {
          const [lon1, lat1] = ring[i]
          const [lon2, lat2] = ring[i + 1]
          const dist = pointToSegmentDistance(lon, lat, lon1, lat1, lon2, lat2)
          minDistance = Math.min(minDistance, dist)
        }
      }
    } else if (type === 'MultiLineString') {
      // 复杂河流
      for (const line of coordinates) {
        for (let i = 0; i < line.length - 1; i++) {
          const [lon1, lat1] = line[i]
          const [lon2, lat2] = line[i + 1]
          const dist = pointToSegmentDistance(lon, lat, lon1, lat1, lon2, lat2)
          minDistance = Math.min(minDistance, dist)
        }
      }
    } else if (type === 'MultiPolygon') {
      // 复杂湖泊
      for (const polygon of coordinates) {
        for (const ring of polygon) {
          for (let i = 0; i < ring.length - 1; i++) {
            const [lon1, lat1] = ring[i]
            const [lon2, lat2] = ring[i + 1]
            const dist = pointToSegmentDistance(lon, lat, lon1, lat1, lon2, lat2)
            minDistance = Math.min(minDistance, dist)
          }
        }
      }
    }
  }

  return minDistance
}
