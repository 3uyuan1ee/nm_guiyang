<template>
  <div class="dashboard-overlay" :class="{ open: isOpen }" @click.self="handleClose">
    <div class="dashboard-panel">
      <header class="dashboard-header">
        <div>
          <h2>数据分析仪表板</h2>
        </div>
        <div class="header-actions">
          <button class="close-btn" @click="handleClose">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- 1. 城市热力指纹：24小时"呼吸"曲线 -->
        <section class="chart-section full-width">
          <div class="section-header">
            <h3>城市热力指纹：24小时"呼吸"曲线</h3>
            <p class="section-desc">基于营业时间加权的24小时活跃度分布，分析区域时空行为模式差异</p>
          </div>
          <div class="vitality-chart">
            <svg viewBox="0 0 800 200" class="area-chart">
              <!-- 网格线 -->
              <line v-for="i in 5" :key="'grid-' + i"
                :x1="60" :y1="20 + (i - 1) * 40"
                :x2="780" :y2="20 + (i - 1) * 40"
                stroke="rgba(255,255,255,0.1)" stroke-dasharray="4"/>
              <!-- Y轴标签 -->
              <text v-for="(label, i) in vitalityYLabels" :key="'label-' + i"
                :x="50" :y="25 + i * 40"
                text-anchor="end" fill="rgba(255,255,255,0.5)" font-size="10">{{ label }}</text>
              <!-- X轴标签 -->
              <text v-for="(label, i) in 24" :key="'hour-' + i"
                :x="60 + i * 30" :y="195"
                :text-anchor="i % 6 === 0 ? 'middle' : 'start'"
                fill="rgba(255,255,255,0.4)" font-size="9">{{ i }}时</text>
              <!-- 观山湖区面积 -->
              <path :d="newCityAreaPath"
                fill="rgba(34, 211, 238, 0.3)"
                stroke="rgba(34, 211, 238, 0.8)" stroke-width="2"/>
              <!-- 老城区面积 -->
              <path :d="oldCityAreaPath"
                fill="rgba(236, 72, 153, 0.3)"
                stroke="rgba(236, 72, 153, 0.8)" stroke-width="2"/>
              <!-- 图例 -->
              <g transform="translate(620, 15)">
                <rect width="12" height="12" fill="rgba(236, 72, 153, 0.6)" rx="2"/>
                <text x="18" y="10" fill="rgba(255,255,255,0.8)" font-size="11">老城区</text>
                <rect y="20" width="12" height="12" fill="rgba(34, 211, 238, 0.6)" rx="2"/>
                <text x="18" y="30" fill="rgba(255,255,255,0.8)" font-size="11">观山湖区</text>
              </g>
            </svg>
            <div class="vitality-insight">
              <span class="insight-text">{{ vitalityInsight }}</span>
            </div>
          </div>
        </section>

        <!-- 2. 性价比散点图：四象限分析 -->
        <section class="chart-section full-width">
          <div class="section-header">
            <h3>性价比散点图：老城 vs 新城</h3>
            <p class="section-desc">价格-评分二维分布分析，识别高性价比聚集区域（评分≥3.8且价格≤120元）</p>
          </div>
          <div class="scatter-comparison">
            <!-- 老城区散点图 -->
            <div class="scatter-panel">
              <h4 class="scatter-title">老城区 (南明+云岩)</h4>
              <svg viewBox="0 0 280 250" class="scatter-svg-small">
                <!-- 象限背景 -->
                <rect x="60" y="20" width="90" height="90" fill="rgba(251, 191, 36, 0.08)"/>
                <rect x="60" y="110" width="90" height="90" fill="rgba(34, 197, 94, 0.15)"/>
                <rect x="150" y="110" width="90" height="90" fill="rgba(239, 68, 68, 0.08)"/>
                <!-- 坐标轴 -->
                <line x1="60" y1="20" x2="60" y2="200" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                <line x1="60" y1="110" x2="240" y2="110" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                <!-- Y轴标签 -->
                <text x="52" y="28" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">5分</text>
                <text x="52" y="110" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">3.8分</text>
                <!-- X轴标签 -->
                <text x="60" y="215" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8">0</text>
                <text x="240" y="215" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">300元</text>
                <!-- 散点 -->
                <circle v-for="(point, i) in oldCityScatterPoints" :key="'old-scatter-' + i"
                  :cx="point.cx" :cy="point.cy" :r="point.r"
                  :fill="point.color" fill-opacity="0.7"/>
              </svg>
              <div class="scatter-stats-old">
                <span>高性价比占比: <strong>{{ oldValuePercent }}%</strong></span>
                <span>均价: {{ oldAvgPrice }}元</span>
              </div>
            </div>

            <!-- 新城区散点图 -->
            <div class="scatter-panel">
              <h4 class="scatter-title">新城区 (观山湖)</h4>
              <svg viewBox="0 0 280 250" class="scatter-svg-small">
                <!-- 象限背景 -->
                <rect x="60" y="20" width="90" height="90" fill="rgba(251, 191, 36, 0.08)"/>
                <rect x="60" y="110" width="90" height="90" fill="rgba(34, 197, 94, 0.15)"/>
                <rect x="150" y="110" width="90" height="90" fill="rgba(239, 68, 68, 0.08)"/>
                <!-- 坐标轴 -->
                <line x1="60" y1="20" x2="60" y2="200" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                <line x1="60" y1="110" x2="240" y2="110" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                <!-- Y轴标签 -->
                <text x="52" y="28" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">5分</text>
                <text x="52" y="110" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">3.8分</text>
                <!-- X轴标签 -->
                <text x="60" y="215" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8">0</text>
                <text x="240" y="215" text-anchor="end" fill="rgba(255,255,255,0.4)" font-size="8">300元</text>
                <!-- 散点 -->
                <circle v-for="(point, i) in newCityScatterPoints" :key="'new-scatter-' + i"
                  :cx="point.cx" :cy="point.cy" :r="point.r"
                  :fill="point.color" fill-opacity="0.7"/>
              </svg>
              <div class="scatter-stats-new">
                <span>高性价比占比: <strong>{{ newValuePercent }}%</strong></span>
                <span>均价: {{ newAvgPrice }}元</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. 餐饮多样性：香农熵指数 -->
        <section class="chart-section full-width">
          <div class="section-header">
            <h3>餐饮多样性：香农熵指数</h3>
            <p class="section-desc">基于香农熵的品类多样性测度，极坐标玫瑰图展示6大核心业态的空间分布特征</p>
          </div>
          <div class="diversity-chart">
            <div class="rose-charts">
              <!-- 老城区玫瑰图 -->
              <div class="rose-container">
                <h4>老城区 (南明+云岩)</h4>
                <svg viewBox="0 0 240 240" class="rose-svg">
                  <g transform="translate(120, 120)">
                    <!-- 同心圆 -->
                    <circle r="25" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2"/>
                    <circle r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2"/>
                    <circle r="75" fill="none" stroke="rgba(255,255,255,0.05)" stroke-dasharray="2"/>
                    <!-- 花瓣 -->
                    <path v-for="(petal, i) in oldCityPetals" :key="'old-petal-' + i"
                      :d="petal.d" :fill="petal.fill" :opacity="0.7"/>
                    <!-- 类别标签 -->
                    <text v-for="(label, i) in roseCategories" :key="'old-label-' + i"
                      :x="120 + Math.cos(i * Math.PI / 3 - Math.PI / 2) * 95"
                      :y="120 + Math.sin(i * Math.PI / 3 - Math.PI / 2) * 95"
                      text-anchor="middle" dominant-baseline="middle"
                      fill="rgba(255,255,255,0.6)" font-size="7">{{ label }}</text>
                  </g>
                </svg>
                <div class="entropy-value">
                  <span class="entropy-label">香农熵指数</span>
                  <span class="entropy-number">{{ oldCityEntropy.toFixed(2) }}</span>
                  <span class="entropy-desc">最大值{{ maxEntropy.toFixed(2) }}</span>
                </div>
              </div>
              <!-- 观山湖区玫瑰图 -->
              <div class="rose-container">
                <h4>观山湖区</h4>
                <svg viewBox="0 0 240 240" class="rose-svg">
                  <g transform="translate(120, 120)">
                    <!-- 同心圆 -->
                    <circle r="25" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2"/>
                    <circle r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2"/>
                    <circle r="75" fill="none" stroke="rgba(255,255,255,0.05)" stroke-dasharray="2"/>
                    <!-- 花瓣 -->
                    <path v-for="(petal, i) in newCityPetals" :key="'new-petal-' + i"
                      :d="petal.d" :fill="petal.fill" :opacity="0.7"/>
                    <!-- 类别标签 -->
                    <text v-for="(label, i) in roseCategories" :key="'new-label-' + i"
                      :x="Math.cos(i * Math.PI / 3 - Math.PI / 2) * 88"
                      :y="Math.sin(i * Math.PI / 3 - Math.PI / 2) * 88"
                      text-anchor="middle" dominant-baseline="middle"
                      fill="rgba(255,255,255,0.6)" font-size="7">{{ label }}</text>
                  </g>
                </svg>
                <div class="entropy-value">
                  <span class="entropy-label">香农熵指数</span>
                  <span class="entropy-number">{{ newCityEntropy.toFixed(2) }}</span>
                  <span class="entropy-desc">多样性</span>
                </div>
              </div>
            </div>
            <div class="diversity-insight">
              <span class="insight-text">{{ diversityInsight }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  filteredData: { type: Array, default: () => [] },
  allData: { type: Array, default: () => [] },
  currentTime: { type: String, default: '21:00' }
})

const emit = defineEmits(['close'])

const maxEntropy = computed(() => Math.log(6)) // 6个类别的最大熵

// 类别时间权重（用于呼吸曲线计算）
const categoryTimeWeights = {
  '烧烤夜市': { peak: [22, 2], base: 0.3 },     // 深夜活跃
  '酒吧': { peak: [21, 1], base: 0.2 },         // 深夜活跃
  '火锅': { peak: [18, 22], base: 0.5 },        // 晚餐高峰
  '中餐厅': { peak: [11, 19], base: 0.4 },      // 午晚高峰
  '家常菜': { peak: [12, 18], base: 0.5 },      // 午晚高峰
  '快餐': { peak: [11, 12], base: 0.7 },        // 白天活跃
  '咖啡': { peak: [14, 16], base: 0.3 },        // 下午活跃
  '甜品糕点': { peak: [14, 20], base: 0.4 },    // 下午晚上
  '饮品': { peak: [13, 22], base: 0.5 },        // 白天晚上
  '地方菜系': { peak: [18, 20], base: 0.5 },
  '特色餐饮': { peak: [19, 21], base: 0.4 },
  '异国料理': { peak: [18, 21], base: 0.3 },
  '清真菜馆': { peak: [12, 19], base: 0.5 }
}

// ========== 1. 24小时呼吸曲线 ==========
const vitalityYLabels = ['100%', '75%', '50%', '25%', '0%']

// 计算区域在各时段的活跃度
function calculateDistrictVitality(data) {
  const hourly = Array(24).fill(0)
  const districtData = {
    oldCity: { nanming: [], yunyan: [] },
    newCity: { guanshan: [] }
  }

  // 分类数据
  data.forEach(shop => {
    const d = shop.district || ''
    if (d.includes('南明')) districtData.oldCity.nanming.push(shop)
    else if (d.includes('云岩')) districtData.oldCity.yunyan.push(shop)
    else if (d.includes('观山湖')) districtData.newCity.guanshan.push(shop)
  })

  // 计算各时段活跃度
  const oldCityShops = [...districtData.oldCity.nanming, ...districtData.oldCity.yunyan]
  const newCityShops = [...districtData.newCity.guanshan]

  function calcHourlyActive(shops) {
    const result = Array(24).fill(0)
    shops.forEach(shop => {
      const weights = categoryTimeWeights[shop.category] || { peak: [11, 19], base: 0.5 }
      const { peak, base } = weights

      for (let h = 0; h < 24; h++) {
        let factor = base
        if (shop.isOpen24Hours) {
          factor = base
        } else {
          const open = shop.openMinutes || 0
          const close = shop.closeMinutes || 1440
          const hourStart = h * 60
          const hourEnd = (h + 1) * 60

          let isOpen = false
          if (close < open) {
            isOpen = hourStart >= open || hourEnd <= close
          } else {
            isOpen = hourStart >= open && hourEnd <= close
          }

          if (!isOpen) {
            factor = 0
          } else {
            // 计算时间权重
            if (peak[0] <= peak[1]) {
              if (h >= peak[0] && h <= peak[1]) factor = 1
              else if (h >= peak[0] - 2 && h < peak[0]) factor = 0.7
              else if (h > peak[1] && h <= peak[1] + 2) factor = 0.7
            } else {
              // 跨天峰值
              if (h >= peak[0] || h <= peak[1]) factor = 1
            }
          }
        }
        result[h] += factor
      }
    })
    return result
  }

  const oldCityHourly = calcHourlyActive(oldCityShops)
  const newCityHourly = calcHourlyActive(newCityShops)

  const maxVal = Math.max(...oldCityHourly, ...newCityHourly, 1)

  return {
    oldCity: oldCityHourly.map(v => v / maxVal),
    newCity: newCityHourly.map(v => v / maxVal)
  }
}

const vitalityData = computed(() => {
  // 如果面板未打开，返回空数据
  if (!props.isOpen || !props.allData.length) {
    return { oldCity: Array(24).fill(0), newCity: Array(24).fill(0) }
  }
  return calculateDistrictVitality(props.allData)
})

const oldCityAreaPath = computed(() => {
  const data = vitalityData.value.oldCity
  let path = `M 60 180`
  data.forEach((val, i) => {
    const y = 180 - val * 150
    path += ` L ${60 + i * 30} ${y}`
  })
  path += ` L 780 180 Z`
  return path
})

const newCityAreaPath = computed(() => {
  const data = vitalityData.value.newCity
  let path = `M 60 180`
  data.forEach((val, i) => {
    const y = 180 - val * 150
    path += ` L ${60 + i * 30} ${y}`
  })
  path += ` L 780 180 Z`
  return path
})

const vitalityInsight = computed(() => {
  const oldNight = vitalityData.value.oldCity.slice(22).concat(vitalityData.value.oldCity.slice(0, 4))
  const newNight = vitalityData.value.newCity.slice(22).concat(vitalityData.value.newCity.slice(0, 4))
  const oldAvg = oldNight.reduce((a, b) => a + b, 0) / 4
  const newAvg = newNight.reduce((a, b) => a + b, 0) / 4
  const ratio = (oldAvg / newAvg).toFixed(2)

  if (oldAvg > newAvg * 1.3) {
    return `数据洞察：老城区22:00-02:00时段活跃度为新城的${ratio}倍，呈现显著的夜间经济集聚效应`
  } else if (oldAvg > newAvg * 1.1) {
    return `数据洞察：老城区夜间活跃度领先新城${((oldAvg - newAvg) / newAvg * 100).toFixed(0)}%，时空分布不均衡`
  } else if (newAvg > oldAvg * 1.1) {
    return `数据洞察：新城夜间活跃度超越老城${((newAvg - oldAvg) / oldAvg * 100).toFixed(0)}%，消费格局趋同`
  } else {
    return '数据洞察：两区夜间活跃度基本持平，时空行为模式趋同'
  }
})

// ========== 2. 性价比散点图 ==========
// 生成散点数据的辅助函数
function generateScatterPoints(data, maxPoints = 60) {
  if (!data.length) return []
  const sample = data.length > maxPoints
    ? data.filter((_, i) => i % Math.ceil(data.length / maxPoints) === 0)
    : data

  return sample.map(shop => {
    const rating = shop.rating || 3.5
    const cost = shop.cost || 50
    const cx = 60 + Math.min(cost / 300, 1) * 180
    const cy = 200 - ((rating - 2.5) / 2.5) * 180

    let color = '#94a3b8'
    if (rating >= 3.8 && cost <= 120) color = '#22c55e' // 平民之光
    else if (rating >= 4.0 && cost > 120) color = '#fbbf24' // 高价高质
    else if (rating < 3.8 && cost > 120) color = '#ef4444' // 避雷区

    return {
      cx: Math.max(70, Math.min(230, cx)),
      cy: Math.max(30, Math.min(190, cy)),
      r: 5,
      color
    }
  })
}

const oldCityScatterPoints = computed(() => {
  if (!props.isOpen) return []
  const oldCityData = props.allData.filter(s =>
    s.district?.includes('南明区') || s.district?.includes('云岩区')
  )
  return generateScatterPoints(oldCityData)
})

const newCityScatterPoints = computed(() => {
  if (!props.isOpen) return []
  const newCityData = props.allData.filter(s =>
    s.district?.includes('观山湖区')
  )
  return generateScatterPoints(newCityData)
})

// 计算均价
const oldAvgPrice = computed(() => {
  if (!props.isOpen) return '0'
  const oldCityPrices = props.allData
    .filter(s => (s.district?.includes('南明区') || s.district?.includes('云岩区')) && s.cost > 0)
    .map(s => s.cost)
  if (!oldCityPrices.length) return '0'
  return (oldCityPrices.reduce((a, b) => a + b, 0) / oldCityPrices.length).toFixed(0)
})

const newAvgPrice = computed(() => {
  if (!props.isOpen) return '0'
  const newCityPrices = props.allData
    .filter(s => s.district?.includes('观山湖区') && s.cost > 0)
    .map(s => s.cost)
  if (!newCityPrices.length) return '0'
  return (newCityPrices.reduce((a, b) => a + b, 0) / newCityPrices.length).toFixed(0)
})

// 计算平民之光占比
const oldValuePercent = computed(() => {
  if (!props.isOpen) return '0.0'
  const oldCityData = props.allData.filter(s =>
    s.district?.includes('南明区') || s.district?.includes('云岩区')
  )
  const valueShops = oldCityData.filter(s => (s.rating || 0) >= 3.8 && (s.cost || 0) <= 120)
  return oldCityData.length > 0
    ? ((valueShops.length / oldCityData.length) * 100).toFixed(1)
    : '0.0'
})

const newValuePercent = computed(() => {
  if (!props.isOpen) return '0.0'
  const newCityData = props.allData.filter(s =>
    s.district?.includes('观山湖区')
  )
  const valueShops = newCityData.filter(s => (s.rating || 0) >= 3.8 && (s.cost || 0) <= 120)
  return newCityData.length > 0
    ? ((valueShops.length / newCityData.length) * 100).toFixed(1)
    : '0.0'
})

// ========== 3. 餐饮多样性香农熵 ==========
// 使用6个类别（排除正餐大类）：火锅、烧烤夜市、咖啡、酒吧、快餐、甜品糕点
const roseCategories = ['火锅', '烧烤夜市', '咖啡', '酒吧', '快餐', '甜品糕点']

// 计算香农熵
function calculateEntropy(categoryCounts) {
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
  if (total === 0) return 0

  let entropy = 0
  for (const count of Object.values(categoryCounts)) {
    if (count > 0) {
      const p = count / total
      entropy -= p * Math.log(p)
    }
  }
  return entropy
}

const oldCityEntropy = computed(() => {
  if (!props.isOpen || !props.allData.length) return 0

  const counts = {}
  roseCategories.forEach(cat => counts[cat] = 0)

  props.allData.forEach(shop => {
    if ((shop.district?.includes('南明') || shop.district?.includes('云岩')) && roseCategories.includes(shop.category)) {
      counts[shop.category] = (counts[shop.category] || 0) + 1
    }
  })
  return calculateEntropy(counts)
})

const newCityEntropy = computed(() => {
  if (!props.isOpen || !props.allData.length) return 0

  const counts = {}
  roseCategories.forEach(cat => counts[cat] = 0)

  props.allData.forEach(shop => {
    if (shop.district?.includes('观山湖') && roseCategories.includes(shop.category)) {
      counts[shop.category] = (counts[shop.category] || 0) + 1
    }
  })
  return calculateEntropy(counts)
})

// 生成玫瑰图花瓣数据
function generateRosePetals(districtFilter) {
  if (!props.isOpen || !props.allData.length) {
    return roseCategories.map(() => ({
      d: 'M 0 0 L 0 0 A 0 0 0 0 0 0 0 L 0 0 A 0 0 0 0 0 0 0 Z',
      fill: 'rgba(255,255,255,0.1)',
      count: 0
    }))
  }

  const counts = {}
  roseCategories.forEach(c => counts[c] = 0)

  let total = 0
  props.allData.forEach(shop => {
    if (districtFilter(shop) && roseCategories.includes(shop.category)) {
      counts[shop.category] = (counts[shop.category] || 0) + 1
      total++
    }
  })

  // 使用平方根缩放，让小数量类别也能看见，大数量不会太大
  const maxCount = Math.max(...Object.values(counts), 1)
  const colors = [
    'rgba(239, 68, 68, 0.8)',     // 火锅 - 红
    'rgba(34, 197, 94, 0.8)',      // 烧烤夜市 - 绿
    'rgba(34, 211, 238, 0.8)',     // 咖啡 - 青
    'rgba(168, 85, 247, 0.8)',     // 酒吧 - 紫
    'rgba(251, 191, 36, 0.8)',     // 快餐 - 黄
    'rgba(251, 146, 60, 0.8)'      // 甜品糕点 - 橙
  ]

  return roseCategories.map((cat, i) => {
    const count = counts[cat] || 0
    const innerR = 12
    // 使用平方根缩放：sqrt(count/maxCount)，让差异更平滑
    const scale = count > 0 ? Math.sqrt(count / maxCount) : 0
    const outerR = innerR + scale * 55  // 最大外半径 12 + 55 = 67
    const angle = (i * Math.PI / 3) - Math.PI / 2
    const nextAngle = ((i + 1) * Math.PI / 3) - Math.PI / 2

    const x1 = Math.cos(angle) * innerR
    const y1 = Math.sin(angle) * innerR
    const x2 = Math.cos(angle) * outerR
    const y2 = Math.sin(angle) * outerR
    const x3 = Math.cos(nextAngle) * outerR
    const y3 = Math.sin(nextAngle) * outerR
    const x4 = Math.cos(nextAngle) * innerR
    const y4 = Math.sin(nextAngle) * innerR

    // 简化 largeArc 判断
    const largeArc = scale > 0.5 ? 1 : 0

    return {
      d: `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`,
      fill: colors[i],
      count
    }
  })
}

const oldCityPetals = computed(() => generateRosePetals(shop =>
  shop.district?.includes('南明') || shop.district?.includes('云岩')
))

const newCityPetals = computed(() => generateRosePetals(shop =>
  shop.district?.includes('观山湖')
))

const diversityInsight = computed(() => {
  const oldEntropy = oldCityEntropy.value
  const newEntropy = newCityEntropy.value
  const maxEntropy = Math.log(6)
  const oldRatio = (oldEntropy / maxEntropy * 100).toFixed(0)
  const newRatio = (newEntropy / maxEntropy * 100).toFixed(0)
  const diff = Math.abs(oldEntropy - newEntropy).toFixed(2)

  if (oldEntropy > newEntropy) {
    return `数据洞察：老城区熵值${oldEntropy.toFixed(2)}（达理论最大值${oldRatio}%），显著高于新城${newEntropy.toFixed(2)}，业态多样性呈现空间分异特征，差值${diff}`
  } else if (newEntropy > oldEntropy) {
    return `数据洞察：新城熵值${newEntropy.toFixed(2)}（达理论最大值${newRatio}%），超越老城区${oldEntropy.toFixed(2)}，新兴区域业态结构更趋多元化，差值${diff}`
  } else {
    return `数据洞察：两区熵值均为${oldEntropy.toFixed(2)}（达理论最大值${oldRatio}%），业态分布结构趋同，空间异质性不显著`
  }
})

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.dashboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.dashboard-overlay.open {
  opacity: 1;
  visibility: visible;
}

.dashboard-panel {
  width: 92vw;
  max-width: 1200px;
  max-height: 90vh;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-header h2 {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  transform: rotate(90deg);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.dashboard-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.dashboard-content::-webkit-scrollbar {
  width: 6px;
}

.dashboard-content::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.chart-section {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s;
}

.chart-section:hover {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.15);
}

.chart-section.full-width {
  grid-column: 1 / -1;
}

.chart-section.half-width {
  grid-column: span 1;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 6px 0;
}

.section-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 面积图 */
.area-chart {
  width: 100%;
  height: 200px;
}

.vitality-insight {
  padding: 12px 16px;
  background: rgba(236, 72, 153, 0.1);
  border-left: 3px solid #ec4899;
  border-radius: 0 8px 8px 0;
}

.insight-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

/* 散点图对比 */
.scatter-comparison {
  display: flex;
  gap: 20px;
}

.scatter-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scatter-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 10px 0;
}

.scatter-svg-small {
  width: 100%;
  height: 180px;
}

.scatter-stats-old {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(236, 72, 153, 0.9);
}

.scatter-stats-new {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(34, 211, 238, 0.9);
}

/* 玫瑰图 */
.diversity-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rose-charts {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.rose-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.rose-container h4 {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.rose-svg {
  width: 160px;
  height: 160px;
}

.entropy-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.entropy-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.entropy-number {
  font-size: 20px;
  font-weight: 700;
  color: #a78bfa;
}

.entropy-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.diversity-insight {
  padding: 12px 16px;
  background: rgba(167, 139, 250, 0.1);
  border-left: 3px solid #a78bfa;
  border-radius: 0 8px 8px 0;
}

@media (max-width: 900px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  .half-width {
    grid-column: span 1;
  }
  .rose-charts {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
