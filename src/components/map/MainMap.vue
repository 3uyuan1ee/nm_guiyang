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
      // 定义道路宽度映射（单位：米）
      const ROAD_WIDTHS = {
        'primary': 12,           // 主干道
        'primary_link': 8,       // 主干道连接
        'secondary': 10,         // 次干道
        'secondary_link': 6,     // 次干道连接
        'tertiary': 6,           // 三级道路
        'tertiary_link': 4,      // 三级道路连接
        'residential': 3,        // 居住区道路
        'service': 2,            // 服务道路
        'pedestrian': 1.5        // 人行道
      }

      const pathLayer = new PathLayer({
        id: 'road-network',
        data: roadFeatures,
        getPath: d => {
          // LineString 格式: [[lon, lat], [lon, lat], ...]
          return d.geometry.coordinates
        },
        getColor: d => {
          const highway = d.properties?.highway
          // 根据道路类型设置不同颜色
          if (highway === 'primary' || highway === 'primary_link') {
            return [255, 200, 150]  // 主干道：浅黄色
          } else if (highway === 'secondary' || highway === 'secondary_link') {
            return [200, 180, 160]  // 次干道：浅橙色
          }
          return [100, 116, 139]    // 其他道路：蓝灰色
        },
        getWidth: d => {
          const highway = d.properties?.highway
          return ROAD_WIDTHS[highway] || 2
        },
        opacity: 0.5,
        widthMinPixels: 0.5,
        widthScale: 1,
        pickable: false
      })

      layers.push(pathLayer)
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
        // 评分模式：以80分为基准，使用平方函数放大差距
        // 84分 → (84-80)² = 16
        // 90分 → (90-80)² = 100
        // 96分 → (96-80)² = 256
        const relativeScore = shop.heat_index - 80
        elevation = Math.pow(relativeScore, 1.8) * 3

        // 根据评分动态调整柱体粗细（范围：0.00004 - 0.00008）
        radius = 0.00004 + ((shop.heat_index - 84) / 12) * 0.00004
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
    console.log(`图层更新成功: 路网 + ${props.foodData.length} 个光柱（地形层已禁用）`)
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
