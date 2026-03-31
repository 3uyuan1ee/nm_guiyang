import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

// 排除的类别（非餐饮类别）
const EXCLUDED_CATEGORIES = new Set([
  '便民商店/便利店',
  '服装鞋帽皮具店',
  '汽车维修',
  '购物相关场所',
  '专营店'
])

// T002: 营业时间默认配置
const DEFAULT_HOURS = {
  '酒吧': { open: '21:00', close: '04:00' },
  '烧烤': { open: '17:00', close: '03:00' },
  '火锅': { open: '11:00', close: '02:00' },
  '咖啡馆': { open: '09:00', close: '01:00' },
  '夜市': { open: '18:00', close: '02:30' },
  '特色餐饮': { open: '10:00', close: '23:00' },
  '中餐厅': { open: '10:00', close: '22:00' },
  '广东菜(粤菜)': { open: '10:00', close: '22:00' }
}

// T003: 时间随机扰动函数（以半小时为单位）
function addRandomOffset(time, offsetSlots = 1) {
  const [hour, minute] = time.split(':').map(Number)
  const totalMinutes = hour * 60 + minute

  // 偏移量以30分钟为单位（-30, 0, +30, -60, +60...）
  const offsetInSlots = Math.floor(Math.random() * (offsetSlots * 2 + 1)) - offsetSlots
  const offsetMinutes = offsetInSlots * 30

  const newMinutes = totalMinutes + offsetMinutes
  const newHour = Math.floor(newMinutes / 60) % 24
  const newMinute = newMinutes % 60

  // 确保分钟部分始终是 00 或 30
  const alignedMinute = Math.round(newMinute / 30) * 30 % 60
  const adjustedHour = newMinute >= 60 ? (newHour + 1) % 24 : (newMinute < 0 ? (newHour - 1 + 24) % 24 : newHour)

  return `${adjustedHour.toString().padStart(2, '0')}:${alignedMinute.toString().padStart(2, '0')}`
}

// T004: 单条数据增强函数
function enhanceFoodRecord(shop) {
  // 如果类别被排除，返回null
  if (EXCLUDED_CATEGORIES.has(shop.type)) {
    return null
  }

  // 保留原始类别
  const category = shop.type
  const defaultHours = DEFAULT_HOURS[category] || { open: '10:00', close: '22:00' }

  return {
    id: uuidv4(),
    name: shop.name,
    category: category,
    longitude: shop.lng,
    latitude: shop.lat,
    heat_index: Math.round(shop.rating * 20),
    cost: shop.cost,
    address: shop.address,
    open_time: addRandomOffset(defaultHours.open),
    close_time: addRandomOffset(defaultHours.close),
    review_count: Math.floor(Math.random() * 500) + 100
  }
}

// T005: 批量数据增强和文件输出
console.log('📂 正在加载完整美食数据...')

const rawData = JSON.parse(
  fs.readFileSync('src/assets/data/guiyang_food_full.json', 'utf-8')
)

console.log(`✅ 原始数据加载成功：${rawData.length} 条记录`)

// 处理数据并过滤无效类别
const enhancedData = rawData
  .map(enhanceFoodRecord)
  .filter(shop => shop !== null)

fs.writeFileSync(
  'src/assets/data/guiyang_food_data_enhanced.json',
  JSON.stringify(enhancedData, null, 2)
)

console.log(`\n🎉 数据增强完成！`)
console.log(`📊 原始数据：${rawData.length} 条记录`)
console.log(`📊 增强数据：${enhancedData.length} 条记录（过滤掉 ${rawData.length - enhancedData.length} 条不支持类别）`)
console.log(`📁 输出文件：src/assets/data/guiyang_food_data_enhanced.json`)

// 统计信息
const categoryCount = {}
enhancedData.forEach(shop => {
  categoryCount[shop.category] = (categoryCount[shop.category] || 0) + 1
})

console.log(`\n📈 类别分布：`)
Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} 条`)
  })
