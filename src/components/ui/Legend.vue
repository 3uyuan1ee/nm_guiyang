<template>
  <div class="legend">
    <div class="legend-title">图例</div>
    <div class="legend-items">
      <div
        v-for="(item, index) in legendItems"
        :key="index"
        class="legend-item"
      >
        <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCategoryColorCss } from '../../utils/colorUtils'

// 图例项 - 主要类别
const legendItems = [
  { label: '烧烤', color: getCategoryColorCss('烧烤') },
  { label: '火锅', color: getCategoryColorCss('火锅') },
  { label: '酒吧', color: getCategoryColorCss('酒吧') },
  { label: '咖啡馆', color: getCategoryColorCss('咖啡馆') },
  { label: '夜市', color: getCategoryColorCss('夜市') },
  { label: '特色餐饮', color: getCategoryColorCss('特色餐饮') },
  { label: '中餐厅', color: getCategoryColorCss('中餐厅') },
  { label: '粤菜', color: getCategoryColorCss('广东菜(粤菜)') }
]
</script>

<style scoped>
.legend {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}

.legend-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}
</style>
