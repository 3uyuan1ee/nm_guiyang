<script setup>
import { onMounted } from 'vue'
import MainMap from './components/map/MainMap.vue'
import TimeSlider from './components/ui/TimeSlider.vue'
import { useMapState } from './composables/useMapState'

// 使用全局状态管理
const { state, filteredData, loadData } = useMapState()

// 组件挂载时加载数据
onMounted(async () => {
  try {
    await loadData()
  } catch (error) {
    console.error('❌ 应用初始化失败：', error)
  }
})

// 处理视图状态变化
function handleViewStateChange(newViewState) {
  Object.assign(state.viewState, newViewState)
}

// 处理 hover 特征
function handleHoverFeature({ feature }) {
  state.hoveredFeature = feature
}
</script>

<template>
  <div class="app">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <h1 class="app-title"> 食在贵阳 </h1>
      <p class="app-subtitle">深夜山城美食与交通流量图谱</p>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
      <!-- 3D 地图 -->
      <MainMap
        :food-data="filteredData"
        :road-data="state.roadData"
        :view-state="state.viewState"
        @view-state-change="handleViewStateChange"
        @hover-feature="handleHoverFeature"
      />

      <!-- 左侧信息面板（预留，第 3 周实现） -->
      <aside class="side-panel-placeholder">
        <div class="placeholder-content">
          <p>当前时间：{{ state.currentTime }}</p>
          <p>显示店铺：{{ filteredData.length }} 家</p>
        </div>
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
  position: relative;
  z-index: 100;
  flex-shrink: 0;
  padding: 16px 24px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #ec4899;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
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

/* 左侧占位面板 */
.side-panel-placeholder {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 200px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
  z-index: 50;
}

.placeholder-content p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0;
}

/* 底部时间轴控制器 */
.app-footer {
  position: relative;
  z-index: 100;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 16px 24px;
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
</style>
