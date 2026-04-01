<template>
  <div class="map-container">
    <div ref="mapContainer" class="map-container-inner"></div>

    <MapControls
      :pitch="props.viewState.pitch"
      @reset-view="handleResetView"
      @toggle-2d="handleToggle2D"
    />

    <Tooltip
      v-if="hoveredFeature"
      :feature="hoveredFeature"
      :x="tooltipX"
      :y="tooltipY"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Deck } from 'deck.gl'
import { TerrainLayer } from '@deck.gl/geo-layers'
import { PathLayer } from 'deck.gl'
import { PolygonLayer } from 'deck.gl'
import { getCategoryColor } from '../../utils/colorUtils'
import { gcj02ToWgs84 } from '../../utils/coordUtils'
import MapControls from './MapControls.vue'
import Tooltip from '../ui/Tooltip.vue'

const props = defineProps({
  foodData: {
    type: Array,
    default: () => []
  },
  roadData: {
    type: Object,
    default: null
  },
  viewState: {
    type: Object,
    required: true
  },
  heightMode: {
    type: String,
    default: 'rating'
  }
})

const emit = defineEmits(['view-state-change', 'hover-feature'])

const mapContainer = ref(null)
const hoveredFeature = ref(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

let deckInstance = null
let terrainLayer = null

function updateLayers() {
  if (!deckInstance) return

  const layers = []

  // 暂时禁用地形层，测试是否是它导致白色图层
  /*
  if (!terrainLayer) {
    terrainLayer = new TerrainLayer({
      id: 'terrain',
      minZoom: 0,
      maxZoom: 15,
      elevationDecoder: {
        r: { size: 256, range: [-7500, 7500] },
        g: { size: 256, range: [-7500, 7500] },
        b: { size: 256, range: [-7500, 7500] }
      },
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      texture: null,
      material: {
        ambient: 0.5,
        diffuse: 0.5,
        shininess: 10,
        specularColor: [30, 30, 30]
      }
    })
  }
  layers.push(terrainLayer)
  */

  // 生成细长六边形柱体的辅助函数
  function createHexagonColumn(lon, lat, radius = 0.0003) {
    const coordinates = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      coordinates.push([
        lon + radius * Math.cos(angle),
        lat + radius * Math.sin(angle)
      ])
    }
    coordinates.push(coordinates[0]) // 闭合多边形
    return [coordinates]
  }

  // 生成圆形柱体（使用更多顶点近似圆形）
  function createCircularColumn(lon, lat, radius = 0.0001, segments = 16) {
    const coordinates = []
    for (let i = 0; i < segments; i++) {
      const angle = (2 * Math.PI / segments) * i
      coordinates.push([
        lon + radius * Math.cos(angle),
        lat + radius * Math.sin(angle)
      ])
    }
    coordinates.push(coordinates[0]) // 闭合多边形
    return [coordinates]
  }

  // 水系层
  if (props.roadData && props.roadData.features) {
    const waterFeatures = props.roadData.features
      .filter(f => {
        return f.properties &&
               f.properties.waterway &&
               f.geometry &&
               (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString')
      })
      .map(f => {
        if (f.geometry.type === 'MultiLineString') {
          return f.geometry.coordinates.map(coords => ({
            ...f,
            geometry: { type: 'LineString', coordinates: coords }
          }))
        }
        return f
      })
      .flat()

    if (waterFeatures.length > 0) {
      // 定义水系宽度和颜色（增加对比度）
      const WATER_STYLES = {
        'river': {
          width: 15,                // 河流：15米宽
          color: [30, 64, 175],     // 深蓝色 #1e40af
          opacity: 0.8
        },
        'stream': {
          width: 5,                 // 溪流：5米宽
          color: [125, 211, 252],   // 浅蓝色 #7dd3fc
          opacity: 0.6
        },
        'dam': {
          width: 10,                // 水坝：10米宽
          color: [59, 130, 246],    // 中蓝色 #3b82f6
          opacity: 0.7
        }
      }

      // 统计各类型数量
      const typeCount = {}
      waterFeatures.forEach(f => {
        const type = f.properties?.waterway
        typeCount[type] = (typeCount[type] || 0) + 1
      })
      console.log(`水系层详情:`, typeCount)

      const waterLayer = new PathLayer({
        id: 'water-system',
        data: waterFeatures,
        getPath: d => d.geometry.coordinates,
        getColor: d => {
          const waterway = d.properties?.waterway
          return WATER_STYLES[waterway]?.color || [59, 130, 246]
        },
        getWidth: d => {
          const waterway = d.properties?.waterway
          return WATER_STYLES[waterway]?.width || 8
        },
        opacity: d => {
          const waterway = d.properties?.waterway
          return WATER_STYLES[waterway]?.opacity || 0.7
        },
        widthMinPixels: 1.5,
        widthScale: 1,
        pickable: false
      })

      layers.push(waterLayer)
      console.log(`水系层: ${waterFeatures.length} 条`)
    }
  }

  // 路网层
  if (props.roadData && props.roadData.features) {
    // 过滤并预处理道路数据
    const roadFeatures = props.roadData.features
      .filter(f => {
        // 只保留有 highway 属性且是 LineString 类型的特征
        return f.properties &&
               typeof f.properties.highway !== 'undefined' &&
               f.geometry &&
               (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString')
      })
      .map(f => {
        // 对于 MultiLineString，拆分成多个 LineString
        if (f.geometry.type === 'MultiLineString') {
          return f.geometry.coordinates.map(coords => ({
            ...f,
            geometry: { type: 'LineString', coordinates: coords }
          }))
        }
        return f
      })
      .flat()

    console.log(`路网数据: 原始 ${props.roadData.features.length} 条, 过滤后 ${roadFeatures.length} 条`)

    if (roadFeatures.length > 0) {
      // 道路样式配置：层次化设计
      const ROAD_STYLES = {
        // 高速公路 - 最醒目，金色系
        'motorway': {
          width: 20,
          color: [255, 215, 0],      // 金色
          opacity: 0.7,
          priority: 1
        },
        'motorway_link': {
          width: 12,
          color: [255, 223, 100],    // 浅金色
          opacity: 0.6,
          priority: 2
        },
        // 干线公路 - 橙红色系，体现重要性
        'trunk': {
          width: 16,
          color: [255, 140, 80],     // 橙红色
          opacity: 0.65,
          priority: 3
        },
        'trunk_link': {
          width: 10,
          color: [255, 160, 120],    // 浅橙红
          opacity: 0.55,
          priority: 4
        },
        // 主要道路 - 暖黄色系
        'primary': {
          width: 14,
          color: [255, 200, 120],    // 暖黄色
          opacity: 0.6,
          priority: 5
        },
        'primary_link': {
          width: 8,
          color: [255, 210, 150],    // 浅暖黄
          opacity: 0.5,
          priority: 6
        },
        // 次要道路 - 中性灰黄
        'secondary': {
          width: 10,
          color: [200, 190, 170],    // 灰黄色
          opacity: 0.5,
          priority: 7
        },
        'secondary_link': {
          width: 6,
          color: [210, 200, 180],    // 浅灰黄
          opacity: 0.45,
          priority: 8
        },
        // 三级道路 - 冷灰色
        'tertiary': {
          width: 6,
          color: [160, 170, 180],    // 蓝灰色
          opacity: 0.4,
          priority: 9
        },
        'tertiary_link': {
          width: 4,
          color: [170, 180, 190],    // 浅蓝灰
          opacity: 0.35,
          priority: 10
        },
        // 居住区道路 - 深灰，低调
        'residential': {
          width: 3,
          color: [100, 110, 120],    // 深灰色
          opacity: 0.3,
          priority: 11
        },
        // 人行道 - 特殊处理，虚线效果
        'pedestrian': {
          width: 2,
          color: [140, 200, 220],    // 青色
          opacity: 0.25,
          priority: 12
        }
      }

      // 按优先级排序，确保重要道路在上层
      const sortedRoads = roadFeatures.sort((a, b) => {
        const styleA = ROAD_STYLES[a.properties?.highway] || ROAD_STYLES['residential']
        const styleB = ROAD_STYLES[b.properties?.highway] || ROAD_STYLES['residential']
        return styleA.priority - styleB.priority
      })

      // 创建多个道路层以增加层次感
      // 底层：所有道路的基础轮廓（稍微加宽、更透明）
      const baseRoadLayer = new PathLayer({
        id: 'road-base',
        data: sortedRoads,
        getPath: d => d.geometry.coordinates,
        getColor: d => {
          const style = ROAD_STYLES[d.properties?.highway] || ROAD_STYLES['residential']
          return [60, 65, 75]  // 统一深灰底色
        },
        getWidth: d => {
          const style = ROAD_STYLES[d.properties?.highway] || ROAD_STYLES['residential']
          return style.width * 1.5  // 底层稍宽
        },
        opacity: 0.15,
        widthMinPixels: 1,
        widthScale: 1,
        pickable: false
      })
      layers.push(baseRoadLayer)

      // 主层：彩色道路
      const mainRoadLayer = new PathLayer({
        id: 'road-main',
        data: sortedRoads,
        getPath: d => d.geometry.coordinates,
        getColor: d => {
          const style = ROAD_STYLES[d.properties?.highway]
          if (style) return style.color
          return [100, 110, 120]  // 默认深灰
        },
        getWidth: d => {
          const style = ROAD_STYLES[d.properties?.highway] || ROAD_STYLES['residential']
          return style.width
        },
        opacity: d => {
          const style = ROAD_STYLES[d.properties?.highway] || ROAD_STYLES['residential']
          return style.opacity
        },
        widthMinPixels: 0.5,
        widthScale: 1,
        pickable: false
      })
      layers.push(mainRoadLayer)

      // 高光层：仅重要道路（motorway, trunk, primary）
      const majorRoads = sortedRoads.filter(d => {
        const h = d.properties?.highway
        return ['motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link'].includes(h)
      })

      if (majorRoads.length > 0) {
        const highlightRoadLayer = new PathLayer({
          id: 'road-highlight',
          data: majorRoads,
          getPath: d => d.geometry.coordinates,
          getColor: d => {
            const style = ROAD_STYLES[d.properties?.highway]
            if (style) {
              // 高光层使用更亮的颜色
              return style.color.map(c => Math.min(255, c + 40))
            }
            return [180, 180, 180]
          },
          getWidth: d => {
            const style = ROAD_STYLES[d.properties?.highway]
            return style ? style.width * 0.3 : 2  // 细高光线
          },
          opacity: 0.8,
          widthMinPixels: 0.5,
          widthScale: 1,
          pickable: false
        })
        layers.push(highlightRoadLayer)
      }

      console.log(`路网层: ${sortedRoads.length} 条 (底色+主色+高光)`)
    }
  }

  // 餐厅光柱层（使用 PolygonLayer 构建六边形柱体）
  if (props.foodData && props.foodData.length > 0) {
    // 预处理数据：转换坐标并生成六边形，计算放大的高度和动态半径
    const polygonData = props.foodData.map(shop => {
      const [lon, lat] = gcj02ToWgs84(shop.longitude, shop.latitude)

      let elevation
      let radius

      if (props.heightMode === 'rating') {
        // 评分模式：直接使用原始评分 (范围约 0.2-4.8)
        const rating = shop.rating || 3.5
        // 以2.5为基准，使用更陡的指数函数放大差异
        const relativeScore = Math.max(0, rating - 2.5)
        elevation = Math.pow(relativeScore, 2.2) * 25

        // 根据评分动态调整柱体粗细（范围：0.00002 - 0.00009）
        const normalizedRating = Math.max(0, Math.min(5, rating)) / 5
        radius = 0.00002 + normalizedRating * 0.00007
      } else {
        // 价格模式：使用分段等级，更直观
        // 经济: <50元, 中等: 50-100元, 较高: 100-150元, 高端: >150元
        const cost = shop.cost || 50

        // 使用对数变换，避免极端值，同时保持相对关系
        // log(30)≈3.4, log(100)≈4.6, log(200)≈5.3
        const logCost = Math.log(Math.max(cost, 20))  // 最小20元
        const minLog = Math.log(20)
        const maxLog = Math.log(300)
        const normalized = (logCost - minLog) / (maxLog - minLog)

        // 高度：分段明显，等级差约40-60单位
        // 30元 → ~30, 60元 → ~90, 100元 → ~140, 150元 → ~180, 200元+ → ~210
        elevation = 20 + normalized * 200

        // 半径：价格越高柱体越粗
        radius = 0.000035 + normalized * 0.000035
      }

      return {
        ...shop,
        polygon: createHexagonColumn(lon, lat, radius),
        elevation: elevation
      }
    })

    const polygonLayer = new PolygonLayer({
      id: 'food-columns',
      data: polygonData,
      getPolygon: d => d.polygon,
      getElevation: d => d.elevation,
      getFillColor: d => getCategoryColor(d.category),
      extruded: true,  // 拉伸成3D
      wireframe: false,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 200],
      onClick: (info) => {
        if (info.object) {
          console.log('点击店铺:', info.object.name)
        }
      }
    })

    layers.push(polygonLayer)
    console.log(`柱体高度范围: ${Math.min(...polygonData.map(d => d.elevation)).toFixed(0)} - ${Math.max(...polygonData.map(d => d.elevation)).toFixed(0)}`)
  }

  try {
    deckInstance.setProps({ layers })
    console.log(`图层更新成功: 水系 + 路网(3层) + ${props.foodData.length} 个光柱`)
  } catch (error) {
    console.error('图层更新失败:', error)
  }
}

function initializeDeck() {
  if (!mapContainer.value) {
    console.error('地图容器未找到')
    return
  }

  if (deckInstance) {
    deckInstance.finalize()
    deckInstance = null
  }

  console.log('初始化 Deck.gl...')
  console.log('初始视角:', props.viewState)

  try {
    deckInstance = new Deck({
      container: mapContainer.value,
      initialViewState: { ...props.viewState },
      controller: {
        doubleClickZoom: true,
        touchRotate: true,
        touchZoom: true
      },
      layers: [],
      parameters: {
        clearColor: [0.059, 0.09, 0.165, 1],  // #0f172a 背景色
      },
      onViewStateChange: ({ viewState }) => {
        emit('view-state-change', viewState)
      },
      onHover: (info) => {
        if (info.object) {
          hoveredFeature.value = info.object
          tooltipX.value = info.x
          tooltipY.value = info.y
          emit('hover-feature', {
            feature: info.object,
            x: info.x,
            y: info.y
          })
        } else {
          hoveredFeature.value = null
          tooltipX.value = 0
          tooltipY.value = 0
          emit('hover-feature', {
            feature: null,
            x: 0,
            y: 0
          })
        }
      }
    })

    // 立即更新图层
    updateLayers()

    console.log('Deck.gl 初始化成功')
  } catch (error) {
    console.error('Deck.gl 初始化失败:', error)
  }
}

onMounted(() => {
  initializeDeck()
})

onUnmounted(() => {
  if (deckInstance) {
    deckInstance.finalize()
    deckInstance = null
  }
})

watch(() => props.viewState, (newViewState) => {
  if (deckInstance) {
    deckInstance.setProps({
      viewState: { ...newViewState }
    })
  }
}, { deep: true })

watch(() => props.foodData, () => {
  updateLayers()
}, { deep: true })

watch(() => props.roadData, () => {
  updateLayers()
}, { deep: true })

watch(() => props.heightMode, () => {
  updateLayers()
})

function handleResetView() {
  const resetState = {
    longitude: 106.713,
    latitude: 26.575,
    zoom: 13,
    pitch: 60,
    bearing: -20
  }
  emit('view-state-change', resetState)
  console.log('重置视角')
}

function handleToggle2D() {
  const newPitch = props.viewState.pitch > 0 ? 0 : 60
  emit('view-state-change', {
    ...props.viewState,
    pitch: newPitch
  })
  console.log(`切换视图: pitch ${props.viewState.pitch} -> ${newPitch}`)
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0f172a;
  overflow: hidden;
}

.map-container-inner {
  width: 100%;
  height: 100%;
}
</style>
