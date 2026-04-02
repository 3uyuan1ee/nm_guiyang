<script setup>
import { onMounted, computed, ref } from 'vue'
import MainMap from './components/map/MainMap.vue'
import TimeSlider from './components/ui/TimeSlider.vue'
import CategoryFilter from './components/ui/CategoryFilter.vue'
import HeightModeSelector from './components/ui/HeightModeSelector.vue'
import RangeFilter from './components/ui/RangeFilter.vue'
import HeatmapToggle from './components/ui/HeatmapToggle.vue'
import DistrictModeToggle from './components/ui/DistrictModeToggle.vue'
import ResearchPanel from './components/ui/ResearchPanel.vue'
import HelpPage from './components/ui/HelpPage.vue'
import DocumentationPage from './components/ui/DocumentationPage.vue'
import DashboardPanel from './components/ui/DashboardPanel.vue'
import { useMapState } from './composables/useMapState'
import { useDistrictStats } from './composables/useDistrictStats'

const { state, filteredData, loadData, toggleCategory, selectAllCategories, deselectAllCategories, setRatingRange, setPriceRange, toggleHeatmap, applyResearchPreset, getResearchPresets } = useMapState()
const { loadDistrictData, assignDistrictToPOIs } = useDistrictStats()

// 区域状态
const districtData = ref(null)
const districtMode = ref('off') // 'off', 'district', 'group'

// 研究预设状态
const activePresetKey = ref(null)
const showResearchModal = ref(false)
const currentPresetInfo = ref(null)

// 研究预设列表
const researchPresets = computed(() => getResearchPresets())

// 帮助页面状态
const showHelp = ref(false)
const showDocumentation = ref(false)
const showDashboard = ref(false)

// 计算属性：是否显示区域
const showDistricts = computed(() => districtMode.value !== 'off')

// 所有美食数据（用于类别筛选器统计）
const allFoodData = computed(() => state.foodData)

onMounted(async () => {
  try {
    // 加载美食数据
    await loadData()

    // 加载区域边界数据
    const boundaryData = await loadDistrictData()
    if (boundaryData) {
      districtData.value = boundaryData

      // 给美食数据打上区域标签
      const labeledData = assignDistrictToPOIs(state.foodData, boundaryData)
      // 清空原数组并重新填充，确保响应式更新
      state.foodData.splice(0, state.foodData.length)
      state.foodData.push(...labeledData)

      // 统计区域分配结果
      const oldCity = state.foodData.filter(p => p.district === '南明区' || p.district === '云岩区').length
      const newCity = state.foodData.filter(p => p.district === '观山湖区').length
      console.log(`区域标注完成: 老城区 ${oldCity} 家, 新城 ${newCity} 家`)
    }
  } catch (error) {
    console.error('应用初始化失败：', error)
  }
})

function handleViewStateChange(newViewState) {
  Object.assign(state.viewState, newViewState)
}

function handleHoverFeature({ feature }) {
  state.hoveredFeature = feature
}

// 处理研究预设应用
function handleApplyResearchPreset(preset) {
  activePresetKey.value = preset.key
  currentPresetInfo.value = preset
  applyResearchPreset(preset.key)

  // 特殊处理：老城新城对比需要开启分组模式
  if (preset.key === 'oldNewCompare') {
    districtMode.value = 'group'
  } else if (preset.key === 'value') {
    // 高性价比寻味使用区域模式
    districtMode.value = 'district'
  } else {
    districtMode.value = 'off'
  }

  // 显示说明弹窗
  showResearchModal.value = true
}

function closeResearchModal() {
  showResearchModal.value = false
}

// 重置所有状态
function handleResetAll() {
  // 重置时间
  state.currentTime = '21:00'
  // 重置类别选择（全选）
  selectAllCategories()
  // 重置高度模式
  state.heightMode = 'rating'
  // 重置评分范围
  state.ratingRange = [3.0, 5.0]
  // 重置价格范围
  state.priceRange = [0, 500]
  // 关闭热力图
  state.showHeatmap = false
  // 重置区域模式
  districtMode.value = 'off'
  // 清除研究预设
  activePresetKey.value = null
  currentPresetInfo.value = null

  console.log('重置所有筛选条件')
}

// 导出当前筛选数据
function handleExportData() {
  if (filteredData.value.length === 0) {
    alert('当前没有筛选数据，请调整筛选条件')
    return
  }

  const headers = ['名称', '类别', '评分', '价格(元)', '区域', '营业时间', '地址']
  const rows = filteredData.value.map(shop => [
    shop.name || '',
    shop.category || '',
    (shop.rating || 0).toFixed(1),
    shop.cost || 0,
    shop.district || '',
    `${shop.open_time || ''}-${shop.close_time || ''}`,
    shop.address || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `贵阳美食数据_${state.currentTime.replace(':', '-')}_${filteredData.value.length}家.csv`
  link.click()
  URL.revokeObjectURL(url)

  console.log(`导出数据: ${filteredData.value.length} 条记录`)
}
</script>

<template>
  <div class="app">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div>
        <h1 class="app-title">食在贵阳</h1>
        <p class="app-subtitle">山城美食图谱</p>
      </div>
      <button class="help-btn" @click="showHelp = true" title="使用指南">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>使用指南</span>
      </button>
      <button class="doc-btn" @click="showDocumentation = true" title="项目文档">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
        <span>项目文档</span>
      </button>
      <button class="dashboard-btn" @click="showDashboard = true" title="数据仪表板">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>数据仪表板</span>
      </button>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
      <!-- 3D 地图 -->
      <MainMap
        :food-data="filteredData"
        :road-data="state.roadData"
        :district-data="districtData"
        :view-state="state.viewState"
        :height-mode="state.heightMode"
        :show-heatmap="state.showHeatmap"
        :show-districts="showDistricts"
        :district-mode="districtMode"
        @view-state-change="handleViewStateChange"
        @hover-feature="handleHoverFeature"
        @reset-all="handleResetAll"
        @export-data="handleExportData"
      />

      <!-- 左侧控制面板 -->
      <aside class="side-panel">
        <!-- 研究探索面板 -->
        <ResearchPanel
          :presets="researchPresets"
          :active-preset-key="activePresetKey"
          @apply-preset="handleApplyResearchPreset"
        />

        <div class="panel-section">
          <div class="panel-info">
<!--            <p class="info-item">当前时间：{{ state.currentTime }}</p>-->
            <p class="info-item">显示店铺：{{ filteredData.length }} 家</p>
          </div>
        </div>

        <HeatmapToggle
          :model-value="state.showHeatmap"
          @toggle="toggleHeatmap"
        />

        <DistrictModeToggle
          v-model="districtMode"
        />

        <CategoryFilter
          :food-data="allFoodData"
          :selected-categories="state.selectedCategories"
          @toggle-category="toggleCategory"
          @select-all="selectAllCategories"
          @deselect-all="deselectAllCategories"
        />

        <HeightModeSelector
          v-model="state.heightMode"
        />

        <RangeFilter
          :rating-range="state.ratingRange"
          :price-range="state.priceRange"
          @update:ratingRange="setRatingRange"
          @update:priceRange="setPriceRange"
        />
      </aside>
    </main>

    <!-- 底部时间轴控制器 -->
    <footer class="app-footer">
      <TimeSlider
        v-model:currentTime="state.currentTime"
        :min-time="'00:00'"
        :max-time="'24:00'"
        :auto-play-interval="800"
      />
    </footer>

    <!-- 帮助页面 -->
    <HelpPage :is-open="showHelp" @close="showHelp = false" />

    <!-- 项目文档页面 -->
    <DocumentationPage :is-open="showDocumentation" @close="showDocumentation = false" />

    <!-- 数据仪表板 -->
    <DashboardPanel
      :is-open="showDashboard"
      :filtered-data="filteredData"
      :all-data="state.foodData"
      :current-time="state.currentTime"
      @close="showDashboard = false"
    />

    <!-- 研究说明弹窗 -->
    <transition name="fade">
      <div v-if="showResearchModal" class="research-modal" @click.self="closeResearchModal">
        <div class="research-modal-content">
          <div class="research-modal-header">
            <h3>{{ currentPresetInfo?.name }}</h3>
            <button class="research-close-btn" @click="closeResearchModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="research-modal-body">
            <p>{{ currentPresetInfo?.description }}</p>
          </div>
          <div class="research-modal-footer">
            <button class="research-action-btn" @click="closeResearchModal">开始探索</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #0f172a;
  color: #fff;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #0f172a;
}

/* 顶部标题栏 */
.app-header {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  color: #ec4899;
  margin: 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.app-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.help-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 8px;
  color: #22d3ee;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.help-btn:hover {
  background: rgba(34, 211, 238, 0.2);
  border-color: rgba(34, 211, 238, 0.5);
}

.help-btn svg {
  width: 18px;
  height: 18px;
}

.doc-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.3);
  border-radius: 8px;
  color: #ec4899;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.doc-btn:hover {
  background: rgba(236, 72, 153, 0.2);
  border-color: rgba(236, 72, 153, 0.5);
}

.doc-btn svg {
  width: 18px;
  height: 18px;
}

.dashboard-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.dashboard-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
}

.dashboard-btn svg {
  width: 18px;
  height: 18px;
}

/* 主内容区 */
.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* 确保地图占据全部空间 */
.app-main > *:first-child {
  flex: 1;
  width: 100%;
  height: 100%;
}

/* 左侧控制面板 */
.side-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 50;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.side-panel::-webkit-scrollbar {
  width: 4px;
}

.side-panel::-webkit-scrollbar-track {
  background: transparent;
}

.side-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.side-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.panel-section {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
}

.panel-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.info-item:first-child {
  color: #22d3ee;
}

/* 底部时间轴控制器 */
.app-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  flex-shrink: 0;
}

/* 研究说明弹窗 */
.research-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.research-modal-content {
  width: 100%;
  max-width: 500px;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.research-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: rgba(167, 139, 250, 0.15);
  border-bottom: 1px solid rgba(167, 139, 250, 0.2);
}

.research-modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #a78bfa;
  margin: 0;
}

.research-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.research-close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.research-close-btn svg {
  width: 18px;
  height: 18px;
}

.research-modal-body {
  padding: 24px;
}

.research-modal-body p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  margin: 0;
}

.research-modal-footer {
  padding: 12px 24px 20px;
  display: flex;
  justify-content: flex-end;
}

.research-action-btn {
  padding: 12px 28px;
  background: rgba(167, 139, 250, 0.2);
  border: 1px solid rgba(167, 139, 250, 0.4);
  border-radius: 8px;
  color: #a78bfa;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.research-action-btn:hover {
  background: rgba(167, 139, 250, 0.3);
  border-color: rgba(167, 139, 250, 0.6);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
