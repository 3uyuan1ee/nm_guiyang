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
