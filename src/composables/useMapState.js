/**
 * 全局地图状态管理
 */

import { reactive, computed, watch } from 'vue'
import { isTimeBetween } from '../utils/timeUtils'

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
    return state.foodData.filter(shop => {
      // 类别筛选
      if (!state.selectedCategories.includes(shop.category)) {
        return false
      }

      // 营业时间筛选
      if (!isTimeBetween(
        state.currentTime,
        shop.open_time,
        shop.close_time
      )) {
        return false
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
      const foodResponse = await fetch(new URL('../assets/data/guiyang_food_data_enhanced.json', import.meta.url))
      if (!foodResponse.ok) throw new Error(`HTTP error! status: ${foodResponse.status}`)
      state.foodData = await foodResponse.json()
      console.log(`美食数据加载成功: ${state.foodData.length} 条`)

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
    toggleHeatmap
  }
}
