<template>
  <div class="range-filter">
    <div class="filter-header" @click="toggleCollapse">
      <h3>筛选条件</h3>
      <div class="header-right">
        <button @click.stop="resetFilters" class="reset-btn" title="重置">重置</button>
        <span class="collapse-icon" :class="{ collapsed: isCollapsed }">▼</span>
      </div>
    </div>

    <div v-show="!isCollapsed">
      <!-- 评分筛选 -->
      <div class="filter-section">
        <div class="section-header">
          <span class="section-label">评分</span>
          <span class="section-value">{{ ratingRange[0] }} - {{ ratingRange[1] }}</span>
        </div>
        <div class="range-slider">
          <input
            type="range"
            :min="ratingMin"
            :max="ratingMax"
            :step="0.1"
            :value="ratingRange[0]"
            @input="updateRatingMin"
            class="range-input range-min"
          />
          <input
            type="range"
            :min="ratingMin"
            :max="ratingMax"
            :step="0.1"
            :value="ratingRange[1]"
            @input="updateRatingMax"
            class="range-input range-max"
          />
          <div class="range-track">
            <div
              class="range-fill"
              :style="ratingFillStyle"
            ></div>
          </div>
        </div>
      </div>

      <!-- 价格筛选 -->
      <div class="filter-section">
        <div class="section-header">
          <span class="section-label">价格 (元)</span>
          <span class="section-value">{{ priceRange[0] }} - {{ priceRange[1] }}</span>
        </div>
        <div class="range-slider">
          <input
            type="range"
            :min="priceMin"
            :max="priceMax"
            :step="10"
            :value="priceRange[0]"
            @input="updatePriceMin"
            class="range-input range-min"
          />
          <input
            type="range"
            :min="priceMin"
            :max="priceMax"
            :step="10"
            :value="priceRange[1]"
            @input="updatePriceMax"
            class="range-input range-max"
          />
          <div class="range-track">
            <div
              class="range-fill"
              :style="priceFillStyle"
            ></div>
          </div>
        </div>
      </div>

      <!-- 快捷选择 -->
      <div class="quick-filters">
        <button
          v-for="preset in pricePresets"
          :key="preset.label"
          @click="applyPricePreset(preset)"
          :class="['quick-btn', { active: isPricePresetActive(preset) }]"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  ratingRange: {
    type: Array,
    default: () => [3.0, 5.0]
  },
  priceRange: {
    type: Array,
    default: () => [0, 500]
  }
})

const emit = defineEmits(['update:ratingRange', 'update:priceRange', 'reset'])

// 折叠状态
const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

const ratingMin = 0.0
const ratingMax = 5.0
const priceMin = 0
const priceMax = 500

// 价格快捷预设
const pricePresets = [
  { label: '全部', min: 0, max: 500 },
  { label: '经济<50', min: 0, max: 50 },
  { label: '中等50-100', min: 50, max: 100 },
  { label: '较高100-150', min: 100, max: 150 },
  { label: '高端>150', min: 150, max: 500 }
]

// 评分填充样式
const ratingFillStyle = computed(() => {
  const minPercent = ((props.ratingRange[0] - ratingMin) / (ratingMax - ratingMin)) * 100
  const maxPercent = ((props.ratingRange[1] - ratingMin) / (ratingMax - ratingMin)) * 100
  return {
    left: `${minPercent}%`,
    right: `${100 - maxPercent}%`
  }
})

// 价格填充样式
const priceFillStyle = computed(() => {
  const minPercent = ((props.priceRange[0] - priceMin) / (priceMax - priceMin)) * 100
  const maxPercent = ((props.priceRange[1] - priceMin) / (priceMax - priceMin)) * 100
  return {
    left: `${minPercent}%`,
    right: `${100 - maxPercent}%`
  }
})

function updateRatingMin(e) {
  const value = parseFloat(e.target.value)
  if (value <= props.ratingRange[1]) {
    emit('update:ratingRange', [value, props.ratingRange[1]])
  }
}

function updateRatingMax(e) {
  const value = parseFloat(e.target.value)
  if (value >= props.ratingRange[0]) {
    emit('update:ratingRange', [props.ratingRange[0], value])
  }
}

function updatePriceMin(e) {
  const value = parseInt(e.target.value)
  if (value <= props.priceRange[1]) {
    emit('update:priceRange', [value, props.priceRange[1]])
  }
}

function updatePriceMax(e) {
  const value = parseInt(e.target.value)
  if (value >= props.priceRange[0]) {
    emit('update:priceRange', [props.priceRange[0], value])
  }
}

function applyPricePreset(preset) {
  emit('update:priceRange', [preset.min, preset.max])
}

function isPricePresetActive(preset) {
  return props.priceRange[0] === preset.min && props.priceRange[1] === preset.max
}

function resetFilters() {
  emit('update:ratingRange', [3.0, 5.0])
  emit('update:priceRange', [0, 500])
  emit('reset')
}
</script>

<style scoped>
.range-filter {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  user-select: none;
}

.filter-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-btn {
  padding: 4px 10px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: rgba(34, 211, 238, 0.2);
  border-color: rgba(34, 211, 238, 0.4);
  color: #22d3ee;
}

.collapse-icon {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.filter-section {
  margin-bottom: 16px;
}

.filter-section:last-of-type {
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.section-value {
  font-size: 12px;
  color: #22d3ee;
  font-weight: 500;
}

.range-slider {
  position: relative;
  height: 24px;
}

.range-input {
  position: absolute;
  width: 100%;
  height: 4px;
  background: transparent;
  appearance: none;
  pointer-events: none;
  top: 10px;
  margin: 0;
}

.range-input::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: #22d3ee;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

.range-input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #22d3ee;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  border: none;
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

.range-track {
  position: absolute;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  top: 10px;
}

.range-fill {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #22d3ee, #8b5cf6);
  border-radius: 2px;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-btn {
  padding: 4px 8px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.quick-btn.active {
  background: rgba(34, 211, 238, 0.2);
  border-color: rgba(34, 211, 238, 0.4);
  color: #22d3ee;
}
</style>
