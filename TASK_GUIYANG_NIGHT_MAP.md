# TASK 任务原子化清单
# 项目名称：《贵阳折叠：3D 深夜山城美食与交通流量图谱》

**生成时间**：2026-03-31
**基于文档**：DESIGN_GUIYANG_NIGHT_MAP.md（已审批）
**阶段状态**：待批准

---

## 📋 任务总览

| 周次 | 任务数量 | 预估工时 | 核心目标 |
|------|---------|---------|---------|
| **第 1 周** | 15 个任务 | ~20 小时 | 基础地图搭建 + 光柱渲染 |
| **第 2 周** | 12 个任务 | ~15 小时 | 时间轴过滤 + 语义缩放 |
| **第 3 周** | 10 个任务 | ~12 小时 | 侧边栏 + D3.js 联动 + 部署 |
| **总计** | **37 个任务** | **~47 小时** | 完整的 3D 可视化应用 |

---

## 🎯 第 1 周：基础地图搭建

### 阶段目标
实现 3D 地图和美食光柱渲染，完成基础交互功能

---

#### 📦 **S001：安装项目依赖**

**任务描述**：安装运行项目所需的全部 npm 包

**执行步骤**：
1. 在项目根目录执行安装命令
2. 验证所有依赖安装成功
3. 运行 `npm run dev` 确认项目可启动

**验收标准**：
- ✅ 执行 `npm install uuid` 后，`package.json` 中包含 `uuid: ^9.0.0`
- ✅ 执行 `npm run dev` 后，终端输出 `Local: http://localhost:5173/`
- ✅ 浏览器访问 `http://localhost:5173/` 能看到 Vue 默认页面

---

#### 📦 **T001：创建数据增强脚本基础结构**

**任务描述**：在 `scripts/` 目录创建数据增强脚本文件

**执行步骤**：
1. 创建 `scripts/` 目录
2. 创建 `scripts/enhance-food-data.js` 文件
3. 添加必要的 import 语句

**代码位置**：`scripts/enhance-food-data.js`

**验收标准**：
- ✅ 文件 `scripts/enhance-food-data.js` 存在
- ✅ 文件第一行包含 `import fs from 'fs'`
- ✅ 文件第二行包含 `import { v4 as uuidv4 } from 'uuid'`

---

#### 📦 **T002：实现营业时间默认配置对象**

**任务描述**：定义 6 类餐饮的默认营业时间

**代码位置**：`scripts/enhance-food-data.js`

**实现代码**：
```js
const DEFAULT_HOURS = {
  '酒吧': { open: '21:00', close: '04:00' },
  '烧烤': { open: '17:00', close: '03:00' },
  '火锅': { open: '11:00', close: '02:00' },
  '咖啡馆': { open: '09:00', close: '01:00' },
  '夜市': { open: '18:00', close: '02:30' },
  '特色餐饮': { open: '10:00', close: '23:00' }
}
```

**验收标准**：
- ✅ `DEFAULT_HOURS['酒吧'].open === '21:00'`
- ✅ `DEFAULT_HOURS['酒吧'].close === '04:00'`
- ✅ `Object.keys(DEFAULT_HOURS).length === 6`

---

#### 📦 **T003：实现时间随机扰动函数**

**任务描述**：为营业时间添加 ±30 分钟的随机偏移

**代码位置**：`scripts/enhance-food-data.js`

**函数签名**：
```js
function addRandomOffset(time: string, offsetMinutes: number = 30): string
```

**实现逻辑**：
1. 解析 `time` 字符串（格式："HH:mm"）
2. 转换为总分钟数
3. 添加随机偏移（±30 分钟）
4. 转换回 "HH:mm" 格式
5. 处理跨天情况（如 23:45 + 30分钟 = 00:15）

**验收标准**：
- ✅ 调用 `addRandomOffset('12:00', 0)` 返回 `'12:00'`
- ✅ 调用 `addRandomOffset('23:45', 30)` 返回值在 `'00:15'` 和 `'23:15'` 之间
- ✅ 返回值格式始终为 "HH:mm"（补零对齐）

---

#### 📦 **T004：实现单条数据增强函数**

**任务描述**：将一条原始美食记录转换为增强格式

**代码位置**：`scripts/enhance-food-data.js`

**函数签名**：
```js
function enhanceFoodRecord(shop: object): object
```

**实现逻辑**：
1. 生成 UUID 作为 `id`
2. 映射字段：`type` → `category`，`lng` → `longitude`，`lat` → `latitude`
3. 计算 `heat_index` = `rating` × 20
4. 根据 `category` 查找默认营业时间
5. 为 `open_time` 和 `close_time` 添加随机偏移
6. 生成随机 `review_count`（100-600 之间）

**验收标准**：
- ✅ 输入 `{ type: '酒吧', lng: 106.7, lat: 26.5, rating: 4.5 }`
- ✅ 输出包含 `id` 字段（符合 UUID 格式）
- ✅ 输出 `category === '酒吧'`
- ✅ 输出 `longitude === 106.7`
- ✅ 输出 `heat_index === 90`
- ✅ 输出包含 `open_time` 和 `close_time` 字段

---

#### 📦 **T005：实现批量数据增强和文件输出**

**任务描述**：读取原始 JSON，批量增强，输出到新文件

**代码位置**：`scripts/enhance-food-data.js`

**实现逻辑**：
1. 读取 `src/assets/data/guiyang_food_data.json`
2. 解析 JSON
3. 遍历每条记录，调用 `enhanceFoodRecord`
4. 将结果写入 `src/assets/data/guiyang_food_data_enhanced.json`
5. 打印日志：`✅ 增强完成：500 条记录`

**验收标准**：
- ✅ 执行 `node scripts/enhance-food-data.js` 后终端输出 `✅ 增强完成：500 条记录`
- ✅ 文件 `src/assets/data/guiyang_food_data_enhanced.json` 存在
- ✅ 文件内容是有效的 JSON（可被 `JSON.parse` 解析）
- ✅ JSON 数组的第一条记录包含 `id`, `category`, `longitude`, `latitude`, `heat_index`, `open_time`, `close_time` 字段

---

#### 📦 **T006：创建时间工具函数模块**

**任务描述**：创建时间转换和比较的工具函数

**代码位置**：`src/utils/timeUtils.js`

**函数列表**：
```js
// 将 "HH:mm" 转换为分钟数
export function timeToMinutes(time: string): number

// 将分钟数转换为 "HH:mm"
export function minutesToTime(minutes: number): string

// 判断 current 是否在 start 和 end 之间（处理跨天）
export function isTimeBetween(current: string, start: string, end: string): boolean
```

**验收标准**：
- ✅ `timeToMinutes('02:30') === 150`
- ✅ `timeToMinutes('23:59') === 1439`
- ✅ `minutesToTime(150) === '02:30'`
- ✅ `isTimeBetween('23:00', '21:00', '02:00') === true`（跨天情况）
- ✅ `isTimeBetween('20:00', '21:00', '02:00') === false`

---

#### 📦 **T007：创建颜色映射工具模块**

**任务描述**：定义类别到颜色的映射关系

**代码位置**：`src/utils/colorUtils.js`

**导出内容**：
```js
export const CATEGORY_COLORS = {
  '烧烤': [236, 72, 153],
  '火锅': [249, 115, 22],
  '酒吧': [139, 92, 246],
  '咖啡馆': [251, 191, 36],
  '夜市': [34, 211, 238],
  '特色餐饮': [16, 185, 129]
}

export function getCategoryColor(category: string): number[]
```

**验收标准**：
- ✅ `getCategoryColor('烧烤')[0] === 236`
- ✅ `getCategoryColor('烧烤')[1] === 72`
- ✅ `getCategoryColor('烧烤')[2] === 153`
- ✅ `getCategoryColor('未知类别')` 返回 `[150, 150, 150]`（默认灰色）

---

#### 📦 **T008：创建全局状态管理 Composable**

**任务描述**：创建地图全局状态的响应式管理

**代码位置**：`src/composables/useMapState.js`

**状态结构**：
```js
const state = reactive({
  currentTime: '21:00',
  selectedCategories: ['酒吧', '烧烤', '火锅', '咖啡馆', '夜市', '特色餐饮'],
  viewState: {
    longitude: 106.713,
    latitude: 26.575,
    zoom: 12,
    pitch: 60,
    bearing: -20
  },
  foodData: [],
  roadData: null
})
```

**导出接口**：
```js
export function useMapState() {
  return {
    state,
    filteredData: computed(() => { /* TODO: T010 */ })
  }
}
```

**验收标准**：
- ✅ 调用 `useMapState()` 返回对象包含 `state` 属性
- ✅ `state.currentTime === '21:00'`
- ✅ `state.viewState.pitch === 60`
- ✅ `state.viewState.zoom === 12`

---

#### 📦 **T009：实现数据加载函数**

**任务描述**：异步加载增强后的美食数据和路网数据

**代码位置**：`src/composables/useMapState.js`

**函数签名**：
```js
async function loadData() {
  // 加载 src/assets/data/guiyang_food_data_enhanced.json
  // 加载 src/assets/data/guiyang_map_data.geojson
  // 过滤出 highway 数据作为路网
}
```

**验收标准**：
- ✅ 执行 `await loadData()` 后，`state.foodData.length === 500`
- ✅ `state.roadData` 是一个对象（不为 null）
- ✅ `state.roadData.type === 'FeatureCollection'`

---

#### 📦 **T010：实现时间过滤计算属性**

**任务描述**：根据 `currentTime` 和 `selectedCategories` 过滤美食数据

**代码位置**：`src/composables/useMapState.js`

**实现逻辑**：
```js
const filteredData = computed(() => {
  return state.foodData.filter(shop => {
    // 1. 类别过滤
    if (!state.selectedCategories.includes(shop.category)) return false

    // 2. 时间过滤（使用 isTimeBetween）
    const isOpen = isTimeBetween(
      state.currentTime,
      shop.open_time,
      shop.close_time
    )
    return isOpen
  })
})
```

**验收标准**：
- ✅ 当 `state.currentTime = '22:00'` 时，`filteredData` 包含 `open_time <= '22:00' <= close_time` 的店铺
- ✅ 当 `state.selectedCategories = ['酒吧']` 时，`filteredData` 只包含 `category === '酒吧'` 的店铺
- ✅ `filteredData.value` 是响应式的（修改 `state.currentTime` 后自动更新）

---

#### 📦 **T011：创建 MainMap.vue 组件基础结构**

**任务描述**：创建地图主组件，设置 Deck.gl 容器

**代码位置**：`src/components/map/MainMap.vue`

**模板结构**：
```vue
<template>
  <div class="map-container">
    <div ref="deckglCanvas" class="deckgl-canvas"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const deckglCanvas = ref(null)

onMounted(() => {
  // TODO: T012
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
.deckgl-canvas {
  width: 100%;
  height: 100%;
}
</style>
```

**验收标准**：
- ✅ 文件 `src/components/map/MainMap.vue` 存在
- ✅ 组件渲染一个 `div.deckgl-canvas` 元素
- ✅ `div.deckgl-canvas` 的宽度和高度都是 100%

---

#### 📦 **T012：初始化 Deck.gl 实例**

**任务描述**：在 MainMap 组件挂载时创建 Deck.gl 实例

**代码位置**：`src/components/map/MainMap.vue`

**实现逻辑**：
```js
import { Deck } from 'deck.gl'

const deck = new Deck({
  canvas: deckglCanvas.value,
  initialViewState: viewState,
  controller: true,
  layers: []
})
```

**验收标准**：
- ✅ 页面加载后，浏览器控制台无错误
- ✅ `canvas` 元素的 `width` 和 `height` 属性大于 0
- ✅ 可以用鼠标拖拽地图（`controller: true` 生效）

---

#### 📦 **T013：创建 TerrainLayer（地形层）**

**任务描述**：配置并添加地形层到 Deck.gl

**代码位置**：`src/components/map/MainMap.vue`

**图层配置**：
```js
import { TerrainLayer } from '@deck.gl/geo-layers'

const terrainLayer = new TerrainLayer({
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
```

**验收标准**：
- ✅ Deck.gl 的 `layers` 数组包含 `id === 'terrain'` 的图层
- ✅ 地图加载后能看到地形起伏（贵阳周围的山地）
- ✅ 地形颜色为深灰色（不是默认的彩色）

---

#### 📦 **T014：创建 PathLayer（路网层）**

**任务描述**：渲染贵阳路网数据

**代码位置**：`src/components/map/MainMap.vue`

**图层配置**：
```js
import { PathLayer } from 'deck.gl'

const pathLayer = new PathLayer({
  id: 'road-network',
  data: props.roadData.features.filter(f => f.properties.highway),
  getPath: d => d.geometry.coordinates,
  getColor: [51, 65, 85],
  opacity: 0.6,
  widthMinPixels: 1,
  pickable: false
})
```

**验收标准**：
- ✅ 地图上显示路网线条
- ✅ 路网颜色为暗灰色 `rgb(51, 65, 85)`
- ✅ 路网线条半透明（`opacity: 0.6`）

---

#### 📦 **T015：创建 ColumnLayer（美食光柱层）**

**任务描述**：渲染美食数据为 3D 光柱

**代码位置**：`src/components/map/MainMap.vue`

**图层配置**：
```js
import { ColumnLayer } from 'deck.gl'

const columnLayer = new ColumnLayer({
  id: 'food-columns',
  data: props.foodData,
  getPosition: d => [d.longitude, d.latitude],
  getElevation: d => d.heat_index * 10,
  getFillColor: d => getCategoryColor(d.category),
  getRadius: 30,
  elevationScale: 1,
  pickable: true,
  autoHighlight: true,
  highlightColor: [255, 255, 255, 200]
})
```

**验收标准**：
- ✅ 地图上显示 500 个光柱
- ✅ 光柱高度不一（`heat_index` 越高越高）
- ✅ 光柱颜色按类别区分（烧烤为粉红，酒吧为紫色等）
- ✅ 鼠标悬停时光柱高亮为白色

---

## 🎯 第 2 周：时间轴过滤 + 语义缩放

### 阶段目标
实现时间控制器和动态图层切换

---

#### 📦 **T016：创建 TimeSlider.vue 组件**

**任务描述**：创建时间轴滑块 UI 组件

**代码位置**：`src/components/ui/TimeSlider.vue`

**模板结构**：
```vue
<template>
  <div class="time-slider">
    <label>当前时间：{{ currentTime }}</label>
    <input
      type="range"
      :min="minTime"
      :max="maxTime"
      :value="currentTimeValue"
      @input="handleTimeChange"
      class="slider-input"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  currentTime: String,
  minTime: { type: String, default: '18:00' },
  maxTime: { type: String, default: '04:00' }
})

const emit = defineEmits(['update:currentTime'])

const currentTimeValue = computed(() => timeToMinutes(props.currentTime))

function handleTimeChange(event) {
  const minutes = parseInt(event.target.value)
  emit('update:currentTime', minutesToTime(minutes))
}
</script>
```

**验收标准**：
- ✅ 组件显示一个滑块
- ✅ 滑块左侧显示 "当前时间：HH:mm"
- ✅ 拖动滑块触发 `update:currentTime` 事件

---

#### 📦 **T017：在 App.vue 中集成 TimeSlider**

**任务描述**：将时间滑块添加到页面底部

**代码位置**：`src/App.vue`

**实现逻辑**：
```vue
<template>
  <div class="app">
    <Header />
    <main class="main-content">
      <SidePanel />
      <MainMap :food-data="filteredData" :road-data="roadData" />
    </main>
    <footer class="time-control">
      <TimeSlider v-model:current-time="state.currentTime" />
    </footer>
  </div>
</template>
```

**验收标准**：
- ✅ TimeSlider 显示在页面底部
- ✅ TimeSlider 的宽度为 100%（占满底部）
- ✅ TimeSlider 背景色为 `#0f172a`（暗色）

---

#### 📦 **T018：实现时间变化触发地图更新**

**任务描述**：当 `currentTime` 改变时，ColumnLayer 自动更新

**代码位置**：`src/components/map/MainMap.vue`

**实现逻辑**：
```js
watch(() => props.foodData, (newData) => {
  const newLayer = new ColumnLayer({
    id: 'food-columns',
    data: newData,
    // ... 其他配置不变
  })

  deck.setProps({ layers: [terrainLayer, pathLayer, newLayer] })
}, { deep: true })
```

**验收标准**：
- ✅ 拖动时间滑块，地图上的光柱数量实时变化
- ✅ 当 `currentTime = '03:00'` 时，大部分光柱消失（因为未营业）
- ✅ 当 `currentTime = '22:00'` 时，大部分光柱显示（营业高峰）

---

#### 📦 **T019：实现时间自动播放功能**

**任务描述**：添加播放/暂停按钮，自动推进时间

**代码位置**：`src/components/ui/TimeSlider.vue`

**实现逻辑**：
```js
const isPlaying = ref(false)
let playInterval = null

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    playInterval = setInterval(() => {
      const currentMin = timeToMinutes(props.currentTime)
      const nextMin = (currentMin + 30) % (24 * 60)
      emit('update:currentTime', minutesToTime(nextMin))
    }, 1000)
  } else {
    clearInterval(playInterval)
  }
}
```

**验收标准**：
- ✅ TimeSlider 有一个播放按钮
- ✅ 点击播放按钮，时间每秒自动前进 30 分钟
- ✅ 再次点击按钮，播放停止

---

#### 📦 **T020：创建 HexagonLayer（六边形聚合层）**

**任务描述**：实现宏观视角的六边形热力图

**代码位置**：`src/components/map/MainMap.vue`

**图层配置**：
```js
import { HexagonLayer } from 'deck.gl'

const hexagonLayer = new HexagonLayer({
  id: 'food-hexagons',
  data: props.foodData,
  getPosition: d => [d.longitude, d.latitude],
  getColor: d => [d.avgRating * 50, 100, 200],
  radius: 200,
  elevationRange: [0, 3000],
  elevationScale: d => d.count * 50,
  extruded: true
})
```

**验收标准**：
- ✅ 当 `zoom < 12` 时，地图显示六边形柱子
- ✅ 六边形高度与该区域内的店铺数量成正比
- ✅ 六边形颜色反映该区域内的平均评分

---

#### 📦 **T021：创建 ScatterplotLayer（散点层）**

**任务描述**：实现微观视角的散点分布

**代码位置**：`src/components/map/MainMap.vue`

**图层配置**：
```js
import { ScatterplotLayer } from 'deck.gl'

const scatterplotLayer = new ScatterplotLayer({
  id: 'food-scatter',
  data: props.foodData,
  getPosition: d => [d.longitude, d.latitude],
  getFillColor: d => getCategoryColor(d.category),
  getRadius: 100,
  radiusMinPixels: 5,
  radiusMaxPixels: 20,
  pickable: true,
  autoHighlight: true
})
```

**验收标准**：
- ✅ 当 `zoom >= 12` 时，地图显示散点
- ✅ 散点颜色按类别区分
- ✅ 鼠标悬停时散点高亮

---

#### 📦 **T022：实现语义缩放切换逻辑**

**任务描述**：根据 zoom 级别动态切换图层

**代码位置**：`src/components/map/MainMap.vue`

**实现逻辑**：
```js
const layers = computed(() => {
  const baseLayers = [terrainLayer, pathLayer]

  if (viewState.value.zoom >= 12) {
    return [...baseLayers, scatterplotLayer]
  } else {
    return [...baseLayers, hexagonLayer]
  }
})

watch(layers, (newLayers) => {
  deck.setProps({ layers: newLayers })
}, { deep: true })
```

**验收标准**：
- ✅ 当 `zoom = 11` 时，地图显示六边形聚合
- ✅ 当 `zoom = 12` 时，地图切换到散点视图
- ✅ 切换过程流畅，无闪烁

---

#### 📦 **T023：监听视图状态变化**

**任务描述**：监听 Deck.gl 的 `viewState` 事件并更新全局状态

**代码位置**：`src/components/map/MainMap.vue`

**实现逻辑**：
```js
const deck = new Deck({
  // ... 其他配置
  onViewStateChange: ({ viewState }) => {
    emit('view-state-change', viewState)
  }
})
```

**验收标准**：
- ✅ 拖拽地图时，`state.viewState.longitude` 和 `latitude` 更新
- ✅ 缩放地图时，`state.viewState.zoom` 更新
- ✅ 旋转地图时，`state.viewState.pitch` 和 `bearing` 更新

---

#### 📦 **T024：添加地图控制按钮组**

**任务描述**：提供"重置视角"和"切换 2D/3D"按钮

**代码位置**：`src/components/map/MapControls.vue`

**实现逻辑**：
```vue
<template>
  <div class="map-controls">
    <button @click="resetView">重置视角</button>
    <button @click="toggle2D">{{ is3D ? '2D 视图' : '3D 视图' }}</button>
  </div>
</template>

<script setup>
const resetView = () => {
  emit('reset-view', {
    longitude: 106.713,
    latitude: 26.575,
    zoom: 12,
    pitch: 60,
    bearing: -20
  })
}

const toggle2D = () => {
  const newPitch = is3D.value ? 0 : 60
  emit('update-pitch', newPitch)
}
</script>
```

**验收标准**：
- ✅ 点击"重置视角"按钮，相机回到初始位置
- ✅ 点击"2D 视图"按钮，`pitch` 变为 0（俯视）
- ✅ 点击"3D 视图"按钮，`pitch` 变为 60（斜视）

---

#### 📦 **T025：创建 Tooltip 组件**

**任务描述**：显示鼠标悬停的店铺详细信息

**代码位置**：`src/components/ui/Tooltip.vue`

**实现逻辑**：
```vue
<template>
  <div v-if="feature" class="tooltip" :style="tooltipStyle">
    <h3>{{ feature.name }}</h3>
    <p>类别：{{ feature.category }}</p>
    <p>评分：{{ (feature.heat_index / 20).toFixed(1) }} ★</p>
    <p>人均：¥{{ feature.cost }}</p>
    <p>地址：{{ feature.address }}</p>
    <p>营业：{{ feature.open_time }} - {{ feature.close_time }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  feature: Object,
  x: Number,
  y: Number
})

const tooltipStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`
}))
</script>
```

**验收标准**：
- ✅ 鼠标悬停光柱时，Tooltip 显示在光柱旁边
- ✅ Tooltip 显示店铺名称、类别、评分等信息
- ✅ Tooltip 背景为半透明黑色，文字为白色

---

#### 📦 **T026：实现 Deck.gl 的 hover 事件处理**

**任务描述**：监听 `onHover` 事件，更新 Tooltip

**代码位置**：`src/components/map/MainMap.vue`

**实现逻辑**：
```js
const deck = new Deck({
  // ... 其他配置
  layers: [columnLayer],
  onHover: { layer, object, x, y } => {
    if (object) {
      emit('hover-feature', { feature: object, x, y })
    } else {
      emit('hover-feature', { feature: null, x: 0, y: 0 })
    }
  }
})
```

**验收标准**：
- ✅ 鼠标悬停光柱时，触发 `hover-feature` 事件
- ✅ 事件携带 `feature` 对象（包含店铺信息）
- ✅ 事件携带 `x` 和 `y` 坐标（用于定位 Tooltip）

---

#### 📦 **T027：在 MainMap 中集成 Tooltip**

**任务描述**：将 Tooltip 组件添加到地图中

**代码位置**：`src/components/map/MainMap.vue`

**实现逻辑**：
```vue
<template>
  <div class="map-container">
    <div ref="deckglCanvas" class="deckgl-canvas"></div>
    <Tooltip
      :feature="hoveredFeature"
      :x="tooltipX"
      :y="tooltipY"
    />
  </div>
</template>

<script setup>
const hoveredFeature = ref(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

function handleHover({ feature, x, y }) {
  hoveredFeature.value = feature
  tooltipX.value = x
  tooltipY.value = y
}
</script>
```

**验收标准**：
- ✅ 鼠标悬停光柱时，Tooltip 显示在光柱旁边
- ✅ 鼠标移开后，Tooltip 消失
- ✅ Tooltip 不会遮挡光柱（位置合适）

---

## 🎯 第 3 周：侧边栏 + D3.js 联动 + 部署

### 阶段目标
实现侧边栏、D3.js 图表和多视图联动，完成部署

---

#### 📦 **T028：创建 SidePanel.vue 组件**

**任务描述**：创建左侧边栏布局

**代码位置**：`src/components/layout/SidePanel.vue`

**模板结构**：
```vue
<template>
  <aside class="side-panel">
    <div class="panel-section">
      <h3>类别过滤</h3>
      <CategoryFilter
        v-model:selected="state.selectedCategories"
        :categories="allCategories"
      />
    </div>

    <div class="panel-section">
      <h3>统计信息</h3>
      <StatsPanel :data="filteredData" />
    </div>

    <div class="panel-section">
      <h3>活跃度曲线</h3>
      <RidgelineChart :data="timeSeriesData" />
    </div>
  </aside>
</template>
```

**验收标准**：
- ✅ SidePanel 显示在页面左侧
- ✅ SidePanel 宽度为 300px，背景色为 `#0f172a`
- ✅ SidePanel 包含三个部分：类别过滤、统计信息、活跃度曲线

---

#### 📦 **T029：创建 CategoryFilter 组件**

**任务描述**：实现类别复选框过滤器

**代码位置**：`src/components/ui/CategoryFilter.vue`

**实现逻辑**：
```vue
<template>
  <div class="category-filter">
    <label v-for="cat in categories" :key="cat" class="checkbox-label">
      <input
        type="checkbox"
        :value="cat"
        v-model="selected"
      />
      <span :style="{ color: getCategoryColorHex(cat) }">{{ cat }}</span>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: Array,
  selected: Array
})

const emit = defineEmits(['update:selected'])
</script>
```

**验收标准**：
- ✅ 显示 6 个类别复选框
- ✅ 每个类别名称前有对应颜色的圆点
- ✅ 取消勾选某个类别，地图上该类光柱消失

---

#### 📦 **T030：创建 StatsPanel 组件**

**任务描述**：显示当前过滤数据的统计信息

**代码位置**：`src/components/ui/StatsPanel.vue`

**实现逻辑**：
```vue
<template>
  <div class="stats-panel">
    <StatCard label="显示店铺数" :value="data.length" />
    <StatCard label="平均热度" :value="avgHeat" />
    <StatCard label="最高热度" :value="maxHeat" />
  </div>
</template>

<script setup>
const props = defineProps({
  data: Array
})

const avgHeat = computed(() => {
  if (props.data.length === 0) return 0
  const sum = props.data.reduce((acc, shop) => acc + shop.heat_index, 0)
  return Math.round(sum / props.data.length)
})

const maxHeat = computed(() => {
  return Math.max(...props.data.map(d => d.heat_index), 0)
})
</script>
```

**验收标准**：
- ✅ 显示当前地图上的店铺总数
- ✅ 显示平均热度值（0-100）
- ✅ 显示最高热度值
- ✅ 拖动时间滑块，统计数字实时更新

---

#### 📦 **T031：创建 StatCard 组件**

**任务描述**：单个统计卡片的 UI 组件

**代码位置**：`src/components/ui/StatCard.vue`

**验收标准**：
- ✅ 组件显示一个数值和标签
- ✅ 数值字体大小为 24px，加粗
- ✅ 标签字体大小为 12px，颜色为灰色

---

#### 📦 **T032：计算时间序列数据**

**任务描述**：生成每个时间段（每 30 分钟）的活跃店铺数量

**代码位置**：`src/composables/useTimeSeries.js`

**实现逻辑**：
```js
export function useTimeSeries(foodData) {
  const timeSlots = []
  for (let hour = 18; hour <= 24; hour++) {
    timeSlots.push(`${hour}:00`)
    timeSlots.push(`${hour}:30`)
  }
  for (let hour = 0; hour <= 4; hour++) {
    timeSlots.push(`0${hour}:00`)
    timeSlots.push(`0${hour}:30`)
  }

  const series = computed(() => {
    return timeSlots.map(time => {
      const count = foodData.filter(shop => {
        return isTimeBetween(time, shop.open_time, shop.close_time)
      }).length
      return { time, count }
    })
  })

  return { series }
}
```

**验收标准**：
- ✅ 返回的 `series` 数组长度为 23（18:00 到 04:30，每 30 分钟一个点）
- ✅ 每个元素包含 `time` 和 `count` 字段
- ✅ `count` 值为该时间段营业的店铺数量

---

#### 📦 **T033：创建 D3.js RidgelineChart 基础结构**

**任务描述**：创建山峦图 SVG 容器和坐标轴

**代码位置**：`src/components/charts/RidgelineChart.vue`

**实现逻辑**：
```vue
<template>
  <div ref="chartContainer" class="ridgeline-chart"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as d3 from 'd3'

const chartContainer = ref(null)

onMounted(() => {
  const width = 280
  const height = 200

  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // TODO: T034
})
</script>
```

**验收标准**：
- ✅ 组件渲染一个 `<svg>` 元素
- ✅ SVG 宽度为 280px，高度为 200px
- ✅ SVG 背景色为 `#0f172a`

---

#### 📦 **T034：绘制 D3.js 坐标轴**

**任务描述**：为山峦图添加 X 轴（时间）和 Y 轴（数量）

**代码位置**：`src/components/charts/RidgelineChart.vue`

**实现逻辑**：
```js
const margin = { top: 20, right: 20, bottom: 30, left: 40 }
const chartWidth = width - margin.left - margin.right
const chartHeight = height - margin.top - margin.bottom

const g = svg.append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

const xScale = d3.scaleLinear()
  .domain([0, props.data.length - 1])
  .range([0, chartWidth])

const yScale = d3.scaleLinear()
  .domain([0, d3.max(props.data, d => d.count)])
  .range([chartHeight, 0])

g.append('g')
  .attr('transform', `translate(0,${chartHeight})`)
  .call(d3.axisBottom(xScale).tickFormat(i => props.data[i].time.slice(0, 5)))

g.append('g')
  .call(d3.axisLeft(yScale))
```

**验收标准**：
- ✅ X 轴显示时间（18:00, 20:00, 22:00, ...）
- ✅ Y 轴显示数量（0, 100, 200, ...）
- ✅ 坐标轴文字颜色为白色

---

#### 📦 **T035：绘制 D3.js 面积图（山峦效果）**

**任务描述**：绘制随时间变化的活跃店铺数量曲线

**代码位置**：`src/components/charts/RidgelineChart.vue`

**实现逻辑**：
```js
const area = d3.area()
  .x((d, i) => xScale(i))
  .y0(chartHeight)
  .y1(d => yScale(d.count))
  .curve(d3.curveBasis)

g.append('path')
  .datum(props.data)
  .attr('fill', 'rgba(34, 211, 238, 0.3)')
  .attr('stroke', '#22d3ee')
  .attr('stroke-width', 2)
  .attr('d', area)
```

**验收标准**：
- ✅ 图表显示一个面积曲线
- ✅ 曲线填充色为半透明青蓝色
- ✅ 曲线反映营业店铺数量的变化

---

#### 📦 **T036：实现 D3.js Brush 框选**

**任务描述**：添加 D3.js Brush 交互，框选时间段

**代码位置**：`src/components/charts/RidgelineChart.vue`

**实现逻辑**：
```js
const brush = d3.brushX()
  .extent([[0, 0], [chartWidth, chartHeight]])
  .on('end', brushed)

g.append('g')
  .attr('class', 'brush')
  .call(brush)

function brushed(event) {
  if (!event.selection) return
  const [x0, x1] = event.selection
  const i0 = Math.round(xScale.invert(x0))
  const i1 = Math.round(xScale.invert(x1))

  const startTime = props.data[i0].time
  const endTime = props.data[i1].time

  emit('brush-time-range', { start: startTime, end: endTime })
}
```

**验收标准**：
- ✅ 在图表上拖拽鼠标，显示一个框选区域
- ✅ 框选后，触发 `brush-time-range` 事件
- ✅ 事件携带 `start` 和 `end` 时间

---

#### 📦 **T037：实现 Brush 框选联动地图**

**任务描述**：Brush 框选的时间段，高亮地图上的对应店铺

**代码位置**：`src/App.vue`

**实现逻辑**：
```js
function handleBrushTimeRange({ start, end }) {
  // 计算时间范围内的店铺
  const highlightedShops = state.foodData.filter(shop => {
    const shopTime = timeToMinutes(shop.close_time)
    const startMin = timeToMinutes(start)
    const endMin = timeToMinutes(end)
    return shopTime >= startMin && shopTime <= endMin
  })

  // 在地图上高亮这些店铺
  // TODO: 通过修改 ColumnLayer 的 highlightColor 实现
}
```

**验收标准**：
- ✅ 在山峦图上框选时间段
- ✅ 地图上对应时间段的店铺光柱高亮
- ✅ 其他店铺光柱变暗或隐藏

---

## 🚀 部署与文档

### 阶段目标
部署到 GitHub Pages，完成项目文档

---

#### 📦 **T038：配置 Vite 构建输出**

**任务描述**：配置 `vite.config.js` 以支持 GitHub Pages 部署

**代码位置**：`vite.config.js`

**实现逻辑**：
```js
export default defineConfig({
  base: '/nm_guiyang/',  // GitHub 仓库名
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

**验收标准**：
- ✅ 执行 `npm run build` 后，`dist/` 目录包含 `index.html`
- ✅ `index.html` 中的资源路径以 `/nm_guiyang/` 开头

---

#### 📦 **T039：编写项目 README.md**

**任务描述**：创建完整的项目说明文档

**代码位置**：`README.md`

**内容结构**：
```markdown
# 贵阳折叠：3D 深夜山城美食与交通流量图谱

## 项目简介
...

## 在线演示
[GitHub Pages 链接]

## 技术栈
...

## 功能特性
...

## 快速开始
...

## 数据来源
...

## 开发团队
...

## 许可证
...
```

**验收标准**：
- ✅ README.md 包含上述所有章节
- ✅ 项目简介说明应用目的和核心功能
- ✅ 包含至少 3 张应用截图

---

#### 📦 **T040：创建项目说明页面**

**任务描述**：创建专门的说明页面（学术要求）

**代码位置**：`src/views/About.vue`

**内容结构**：
- 可视化方案要解答的问题
- 设计决策的依据
- 外部资源引用
- 开发流程概述

**验收标准**：
- ✅ 页面通过 `/about` 路由访问
- ✅ 页面包含所有必需要素
- ✅ 页面样式与主题一致（暗黑赛博风）

---

#### 📦 **T041：部署到 GitHub Pages**

**任务描述**：将构建产物推送到 GitHub，启用 Pages

**执行步骤**：
1. 执行 `npm run build`
2. 将 `dist/` 目录推送到 `gh-pages` 分支
3. 在 GitHub 仓库设置中启用 Pages
4. 选择 `gh-pages` 分支作为源

**验收标准**：
- ✅ 访问 `https://username.github.io/nm_guiyang/` 能看到应用
- ✅ 地图正常加载，光柱显示
- ✅ 时间滑块功能正常

---

#### 📦 **T042：性能优化与最终测试**

**任务描述**：优化应用性能，确保流畅体验

**优化项**：
- 使用 `vite-plugin-compression` 压缩资源
- 实施图层懒加载
- 优化数据过滤算法
- 添加 loading 状态

**验收标准**：
- ✅ 首屏加载时间 < 3 秒
- ✅ 地图渲染 FPS >= 30
- ✅ 时间轴响应延迟 < 100ms
- ✅ Lighthouse 性能评分 >= 80

---

## 📊 任务优先级说明

### P0（必须完成）
- **第 1 周**：T001-T015（基础地图）
- **第 2 周**：T016-T022（时间轴 + 语义缩放）
- **第 3 周**：T028-T031（侧边栏）、T038-T041（部署）

### P1（强烈推荐）
- **第 2 周**：T023-T027（地图控制 + Tooltip）
- **第 3 周**：T032-T037（D3.js 图表）

### P2（加分项）
- **第 3 周**：T042（性能优化）

---

## ✅ 验收标准总结

### 第 1 周验收
- [ ] 数据增强脚本成功生成 `enhanced.json`
- [ ] 3D 地图显示贵阳地形
- [ ] 500 个美食光柱正确渲染
- [ ] 光柱颜色按类别区分
- [ ] 鼠标 Hover 高亮光柱

### 第 2 周验收
- [ ] 时间滑块功能正常
- [ ] 拖动滑块，光柱实时过滤
- [ ] 缩放级别 < 12 显示六边形聚合
- [ ] 缩放级别 >= 12 显示散点视图
- [ ] Tooltip 显示店铺详情

### 第 3 周验收
- [ ] 侧边栏显示统计信息
- [ ] 类别过滤器联动地图
- [ ] D3.js 山峦图正确渲染
- [ ] Brush 框选联动地图
- [ ] 部署到 GitHub Pages 可访问
- [ ] README.md 和说明文档完整

---

## 🎯 完成标志

当以下条件全部满足时，本阶段完成：

- [x] 所有任务已编号（T001-T042）
- [x] 每个任务包含明确的验收标准
- [x] 验收标准可被单元测试验证
- [x] 任务粒度合理（20 行代码以内）
- [x] 任务按周次和优先级组织
- [ ] **用户批准任务清单**

---

**阶段状态**：待批准

**下一步**：
1. 用户确认任务清单可执行
2. 用户回复：**"任务已原子化，进入阶段 4"**
3. 开始编码执行（阶段 4：Automate）

---

**最后更新**：2026-03-31 22:00
