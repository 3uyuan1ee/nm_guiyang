<template>
  <div
    v-if="feature"
    class="tooltip"
    :style="tooltipStyle"
  >
    <div class="tooltip-header">
      <h3 class="tooltip-title">{{ feature.name }}</h3>
      <span class="tooltip-category" :style="{ color: categoryColor }">
        {{ feature.category }}
      </span>
    </div>

    <div class="tooltip-body">
      <div class="tooltip-row">
        <span class="label">评分：</span>
        <span class="value rating">⭐ {{ (feature.heat_index / 20).toFixed(1) }}</span>
      </div>

      <div class="tooltip-row">
        <span class="label">人均：</span>
        <span class="value">¥{{ feature.cost }}</span>
      </div>

      <div class="tooltip-row">
        <span class="label">营业：</span>
        <span class="value">{{ feature.open_time }} - {{ feature.close_time }}</span>
      </div>

      <div class="tooltip-row">
        <span class="label">地址：</span>
        <span class="value address">{{ feature.address }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryColorCss } from '../../utils/colorUtils'

const props = defineProps({
  feature: {
    type: Object,
    default: null
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  }
})

const categoryColor = computed(() => {
  if (!props.feature) return '#fff'
  return getCategoryColorCss(props.feature.category)
})

const tooltipStyle = computed(() => {
  // 默认位置
  let left = props.x + 15
  let top = props.y + 15

  // 边界检测
  const tooltipWidth = 250
  const tooltipHeight = 200
  const padding = 20

  // 获取窗口尺寸
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // 如果超出右边，移到左边
  if (left + tooltipWidth > windowWidth - padding) {
    left = props.x - tooltipWidth - 15
  }

  // 如果超出底部，向上移动
  if (top + tooltipHeight > windowHeight - padding) {
    top = props.y - tooltipHeight - 15
  }

  // 确保不会超出左边和顶部
  left = Math.max(padding, left)
  top = Math.max(padding, top)

  return {
    left: `${left}px`,
    top: `${top}px`
  }
})
</script>

<style scoped>
.tooltip {
  position: fixed;
  background: rgba(15, 23, 42, 0.95);
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
  max-width: 280px;
  pointer-events: none;
  z-index: 10000;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  line-height: 1.4;
  max-width: 180px;
}

.tooltip-category {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  white-space: nowrap;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-row {
  display: flex;
  font-size: 12px;
  line-height: 1.6;
}

.label {
  color: rgba(255, 255, 255, 0.6);
  min-width: 50px;
}

.value {
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
  word-break: break-word;
}

.value.rating {
  color: #fbbf24;
  font-weight: 600;
}

.value.address {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}
</style>
