/**
 * 全局地图状态管理
 */

import { reactive, computed, watch } from 'vue'
import { isTimeBetween, timeToMinutes } from '../utils/timeUtils'
import { gcj02ToWgs84 } from '../utils/coordUtils'

const state = reactive({
  currentTime: '21:00',
  heightMode: 'rating',  // 'rating' 或 'cost'
  showHeatmap: false,    // 热力图开关
  selectedCategories: [
    '中餐厅', '火锅', '咖啡', '家常菜', '烧烤夜市', '酒吧',
    '特色餐饮', '饮品', '甜品糕点', '地方菜系', '快餐',
    '异国料理', '清真菜馆'
  ],
  // 评分筛选范围 (3.0-5.0，实际数据0.2-4.8)
  ratingRange: [3.0, 5.0],
  // 价格筛选范围 (元)
  priceRange: [0, 500],
  viewState: {
    longitude: 106.713,
    latitude: 26.575,
    zoom: 13,
    pitch: 60,
    bearing: -20
  },
  hoveredFeature: null,
  selectedFeature: null,
  foodData: [],
  roadData: null,
  isLoading: false,
  error: null
})

export function useMapState() {
  // 所有美食类别
  const ALL_CATEGORIES = [
    '中餐厅', '火锅', '咖啡', '家常菜', '烧烤夜市', '酒吧',
    '特色餐饮', '饮品', '甜品糕点', '地方菜系', '快餐',
    '异国料理', '清真菜馆'
  ]

  const filteredData = computed(() => {
    // 预计算当前时间的分钟数
    const currentMinutes = timeToMinutes(state.currentTime)

    return state.foodData.filter(shop => {
      // 类别筛选
      if (!state.selectedCategories.includes(shop.category)) {
        return false
      }

      // 营业时间筛选（使用预计算的时间索引）
      if (!shop.isOpen24Hours) {
        const { openMinutes, closeMinutes } = shop
        // 处理跨天营业
        if (closeMinutes < openMinutes) {
          // 跨天：当前时间需要在 openMinutes 之后 或 closeMinutes 之前
          if (currentMinutes < openMinutes && currentMinutes >= closeMinutes) {
            return false
          }
        } else {
          // 正常营业时间
          if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
            return false
          }
        }
      }

      // 评分筛选 (直接使用原始评分)
      const rating = shop.rating || 3.5
      if (rating < state.ratingRange[0] || rating > state.ratingRange[1]) {
        return false
      }

      // 价格筛选
      const cost = shop.cost || 0
      if (cost < state.priceRange[0] || cost > state.priceRange[1]) {
        return false
      }

      return true
    })
  })

  // 切换类别选择状态
  function toggleCategory(category) {
    const index = state.selectedCategories.indexOf(category)
    if (index > -1) {
      state.selectedCategories.splice(index, 1)
    } else {
      state.selectedCategories.push(category)
    }
  }

  // 全选类别
  function selectAllCategories() {
    state.selectedCategories = [...ALL_CATEGORIES]
  }

  // 清空类别选择
  function deselectAllCategories() {
    state.selectedCategories = []
  }

  // 获取实际存在的类别（从数据中提取）
  function getAvailableCategories() {
    const categories = new Set()
    state.foodData.forEach(shop => {
      categories.add(shop.category)
    })
    return Array.from(categories)
  }

  // 设置高度模式
  function setHeightMode(mode) {
    state.heightMode = mode
  }

  // 设置评分范围
  function setRatingRange(range) {
    state.ratingRange = range
  }

  // 设置价格范围
  function setPriceRange(range) {
    state.priceRange = range
  }

  // 切换热力图显示
  function toggleHeatmap() {
    state.showHeatmap = !state.showHeatmap
  }

  async function loadData() {
    if (state.isLoading) return

    state.isLoading = true
    state.error = null

    try {
      console.log('开始加载美食数据...')

      // 直接使用 fetch 加载 JSON
      const foodResponse = await fetch(new URL('../assets/data/guiyang_food_data_fixed.json', import.meta.url))
      if (!foodResponse.ok) throw new Error(`HTTP error! status: ${foodResponse.status}`)
      let rawData = await foodResponse.json()

      // 预处理数据：预先转换坐标并添加时间索引
      const startTime = performance.now()
      rawData = rawData.map(shop => {
        const [lon, lat] = gcj02ToWgs84(shop.longitude, shop.latitude)

        // 预计算营业时间范围（分钟数），方便快速过滤
        let openMinutes = 0
        let closeMinutes = 24 * 60
        let isOpen24Hours = false

        if (shop.open_time && shop.close_time) {
          openMinutes = timeToMinutes(shop.open_time)
          closeMinutes = timeToMinutes(shop.close_time)

          // 处理跨天营业时间（如 22:00 - 02:00）
          if (closeMinutes < openMinutes) {
            isOpen24Hours = false
          } else if (closeMinutes - openMinutes >= 23 * 60) {
            // 营业超过23小时视为全天营业
            isOpen24Hours = true
          }
        }

        return {
          ...shop,
          // 预转换的 WGS84 坐标
          wgs84_lon: lon,
          wgs84_lat: lat,
          // 预计算的时间索引
          openMinutes,
          closeMinutes,
          isOpen24Hours
        }
      })

      state.foodData = rawData
      const preprocessTime = performance.now() - startTime
      console.log(`美食数据加载成功: ${state.foodData.length} 条 (预处理耗时: ${preprocessTime.toFixed(0)}ms)`)

      console.log('开始加载路网数据...')
      const roadResponse = await fetch(new URL('../assets/data/guiyang_map_data.geojson', import.meta.url))
      if (!roadResponse.ok) throw new Error(`HTTP error! status: ${roadResponse.status}`)
      state.roadData = await roadResponse.json()
      console.log(`路网数据加载成功: ${state.roadData.features.length} 条`)

      // 检查路网数据中有多少条道路
      const roadCount = state.roadData.features.filter(f => f.properties && f.properties.highway).length
      console.log(`其中道路数据: ${roadCount} 条`)

    } catch (error) {
      console.error('数据加载失败:', error)
      state.error = error.message
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(() => state.currentTime, (newTime, oldTime) => {
    if (oldTime) {
      console.log(`时间变化: ${oldTime} -> ${newTime}, 显示店铺: ${filteredData.value.length}`)
    }
  })

  // 研究预设配置
  const RESEARCH_PRESETS = {
    nightlife: {
      name: '夜经济活力',
      description: '深夜11点，当大部分店铺打烊时，哪些区域依然灯火通明？烧烤和酒吧是夜经济的主力军。观察热力图可以发现夜经济的活跃区域：老城区沿街分布，新城则集中在商业综合体周边。',
      config: {
        currentTime: '23:00',
        selectedCategories: ['烧烤夜市', '酒吧'],
        heightMode: 'rating',
        ratingRange: [3.5, 5.0],
        priceRange: [0, 500],
        showHeatmap: true
      }
    },
    coffee: {
      name: '咖啡文化地图',
      description: '咖啡馆的分布反映了一个城市的现代程度和生活节奏。下午2点是咖啡馆的活跃时段，观察热力图可以发现：老城区的咖啡馆与街巷有机融合，新城则更多依附于写字楼和商业中心。这种分布差异体现了两区域不同的城市气质和消费习惯。',
      config: {
        currentTime: '14:00',
        selectedCategories: ['咖啡'],
        heightMode: 'rating',
        ratingRange: [3.5, 5.0],
        priceRange: [0, 500],
        showHeatmap: true
      }
    },
    oldNewCompare: {
      name: '老城新城对比',
      description: '开启热力图和分组模式，对比老城区（南明+云岩）与现代新城（观山湖）的餐饮分布差异。老城区餐饮沿街自然生长，与路网高度契合，呈现"毛细血管式"的密集分布；新城餐饮则以购物中心为核心向外辐射，形成以商业体为中心的节点分布。这揭示了两种截然不同的城市发展模式。',
      config: {
        currentTime: '19:00',
        selectedCategories: [...ALL_CATEGORIES],
        heightMode: 'rating',
        ratingRange: [3.0, 5.0],
        priceRange: [0, 500],
        showHeatmap: true
      }
    },
    value: {
      name: '高性价比寻味',
      description: '哪些区域既有高评分餐厅，价格又亲民？筛选出4.5分以上、人均150元以下的店铺，可以找到真正的"美食高地"。这些高光柱代表的店铺往往是本地人常去的老字号或性价比极高的新兴店，是品尝地道美食的最佳选择。',
      config: {
        currentTime: '12:00',
        selectedCategories: [...ALL_CATEGORIES],
        heightMode: 'rating',
        ratingRange: [4.5, 5.0],
        priceRange: [0, 150],
        showHeatmap: false
      }
    }
  }

  // 应用研究预设
  function applyResearchPreset(presetKey) {
    const preset = RESEARCH_PRESETS[presetKey]
    if (!preset) return

    const config = preset.config

    // 应用配置
    state.currentTime = config.currentTime
    state.selectedCategories = [...config.selectedCategories]
    state.heightMode = config.heightMode
    state.ratingRange = [...config.ratingRange]
    state.priceRange = [...config.priceRange]
    state.showHeatmap = config.showHeatmap

    console.log(`应用研究预设: ${preset.name}`)
  }

  // 获取当前激活的研究预设信息
  function getResearchPresetInfo(presetKey) {
    const preset = RESEARCH_PRESETS[presetKey]
    return preset ? { name: preset.name, description: preset.description } : null
  }

  // 获取所有研究预设列表
  function getResearchPresets() {
    return Object.entries(RESEARCH_PRESETS).map(([key, preset]) => ({
      key,
      name: preset.name,
      description: preset.description
    }))
  }

  return {
    state,
    filteredData,
    loadData,
    toggleCategory,
    selectAllCategories,
    deselectAllCategories,
    getAvailableCategories,
    setHeightMode,
    setRatingRange,
    setPriceRange,
    toggleHeatmap,
    applyResearchPreset,
    getResearchPresetInfo,
    getResearchPresets
  }
}
