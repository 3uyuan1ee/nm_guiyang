<template>
  <div class="category-filter">
    <div class="filter-header">
      <h3>美食类别</h3>
      <div class="filter-actions">
        <button @click="selectAll" class="action-btn" title="全选">全选</button>
        <button @click="deselectAll" class="action-btn" title="清空">清空</button>
      </div>
    </div>

    <div class="category-list">
      <label
        v-for="cat in categories"
        :key="cat"
        :class="['category-item', { active: isSelected(cat) }]"
      >
        <input
          type="checkbox"
          :checked="isSelected(cat)"
          @change="toggleCategory(cat)"
          class="category-checkbox"
        />
        <span class="category-color" :style="{ backgroundColor: getColor(cat) }"></span>
        <span class="category-name">{{ cat }}</span>
        <span class="category-count">({{ getCount(cat) }})</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryColorCss } from '../../utils/colorUtils'

// 所有美食类别
const ALL_CATEGORIES = [
  '中餐厅', '火锅', '咖啡', '家常菜', '烧烤夜市', '酒吧',
  '特色餐饮', '饮品', '甜品糕点', '地方菜系', '快餐',
  '异国料理', '清真菜馆'
]

const props = defineProps({
  foodData: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-category', 'select-all', 'deselect-all'])

const categories = computed(() => ALL_CATEGORIES)

const categoryCounts = computed(() => {
  const counts = {}
  props.foodData.forEach(shop => {
    counts[shop.category] = (counts[shop.category] || 0) + 1
  })
  return counts
})

function isSelected(category) {
  return props.selectedCategories.includes(category)
}

function getCount(category) {
  return categoryCounts.value[category] || 0
}

function getColor(category) {
  return getCategoryColorCss(category)
}

function toggleCategory(category) {
  emit('toggle-category', category)
}

function selectAll() {
  emit('select-all')
}

function deselectAll() {
  emit('deselect-all')
}
</script>

<style scoped>
.category-filter {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.filter-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 4px 10px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(34, 211, 238, 0.2);
  border-color: rgba(34, 211, 238, 0.4);
  color: #22d3ee;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

.category-list::-webkit-scrollbar {
  width: 4px;
}

.category-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.category-item.active {
  background: rgba(34, 211, 238, 0.1);
}

.category-checkbox {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s;
}

.category-checkbox:checked {
  background: #22d3ee;
  border-color: #22d3ee;
}

.category-checkbox:checked::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid #0f172a;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.category-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
}

.category-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
