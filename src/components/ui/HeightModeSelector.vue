<template>
  <div class="height-mode-selector">
    <div class="selector-header" @click="toggleCollapse">
      <h3>柱体高度</h3>
      <span class="collapse-icon" :class="{ collapsed: isCollapsed }">▼</span>
    </div>

    <div v-show="!isCollapsed" class="mode-options">
      <label
        v-for="mode in modes"
        :key="mode.value"
        :class="['mode-item', { active: modelValue === mode.value }]"
      >
        <input
          type="radio"
          :value="mode.value"
          :checked="modelValue === mode.value"
          @change="$emit('update:modelValue', mode.value)"
          class="mode-radio"
        />
        <span class="mode-icon">{{ mode.icon }}</span>
        <div class="mode-info">
          <span class="mode-name">{{ mode.label }}</span>
          <span class="mode-desc">{{ mode.description }}</span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'rating'
  }
})

const emit = defineEmits(['update:modelValue'])

// 折叠状态（默认收起）
const isCollapsed = ref(true)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

const modes = [
  {
    value: 'rating',
    label: '评分',
    description: '根据店铺评分决定柱体高度',
    icon: '⭐'
  },
  {
    value: 'cost',
    label: '价格',
    description: '经济(<50) 中等(50-100) 较高(100-150) 高端(150+)',
    icon: '💰'
  }
]
</script>

<style scoped>
.height-mode-selector {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  user-select: none;
}

.selector-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.collapse-icon {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.mode-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mode-item.active {
  background: rgba(34, 211, 238, 0.1);
  border-color: rgba(34, 211, 238, 0.3);
}

.mode-radio {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s;
}

.mode-radio:checked {
  border-color: #22d3ee;
  background: #22d3ee;
}

.mode-radio:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 5px;
  width: 4px;
  height: 4px;
  border: solid #0f172a;
  border-width: 0 2px 2px 0;
  border-radius: 1px;
  transform: rotate(45deg);
}

.mode-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.mode-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.mode-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
