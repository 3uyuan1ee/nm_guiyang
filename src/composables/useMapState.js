/**
 * 全局地图状态管理
 */

import { reactive, computed, watch } from 'vue'
import { isTimeBetween } from '../utils/timeUtils'

const state = reactive({
  currentTime: '21:00',
  selectedCategories: [
    '中餐厅', '火锅', '咖啡馆', '烧烤', '餐饮相关', '酒吧',
    '火锅店', '特色餐饮', '冷饮店', '特色/地方风味餐厅', '糕饼店',
    '快餐厅', '云贵菜', '茶艺馆', '咖啡厅', '甜品店',
    '休闲餐饮场所', '海鲜酒楼', '综合酒楼', '日本料理', '夜市',
    '外国餐厅', '西餐厅(综合风味)', '清真菜馆', '四川菜(川菜)',
    '麦当劳', '肯德基', '湖南菜(湘菜)', '广东菜(粤菜)', '东北菜'
  ],
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
  const filteredData = computed(() => {
    return state.foodData.filter(shop => {
      if (!state.selectedCategories.includes(shop.category)) {
        return false
      }
      return isTimeBetween(
        state.currentTime,
        shop.open_time,
        shop.close_time
      )
    })
  })

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
    loadData
  }
}
