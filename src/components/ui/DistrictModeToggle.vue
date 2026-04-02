<template>
  <div class="district-toggle">
    <button
      class="toggle-btn"
      :class="{ active: modelValue !== 'off' }"
      @click="handleClick"
    >
      <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
      <span class="toggle-text">{{ modeText }}</span>
      <span class="toggle-status">{{ statusText }}</span>
    </button>
    <p class="toggle-desc">{{ descText }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'off' // 'off', 'district', 'group'
  }
})

const emit = defineEmits(['update:modelValue'])

const modeText = computed(() => {
  switch (props.modelValue) {
    case 'district': return '5区模式'
    case 'group': return '老城 vs 新城'
    default: return '区域对比'
  }
})

const statusText = computed(() => {
  switch (props.modelValue) {
    case 'district': return '5区'
    case 'group': return '对比'
    default: return 'OFF'
  }
})

const descText = computed(() => {
  switch (props.modelValue) {
    case 'district':
      return '显示 5 个行政区（南明、云岩、观山湖、花溪、乌当）'
    case 'group':
      return '对比老城核心(南明/云岩) vs 现代新城(观山湖)'
    default:
      return '点击开启区域对比分析'
  }
})

function handleClick() {
  // 循环切换：off → district → group → off
  const modes = ['off', 'district', 'group']
  const currentIndex = modes.indexOf(props.modelValue)
  const nextIndex = (currentIndex + 1) % modes.length
  emit('update:modelValue', modes[nextIndex])
}
</script>

<style scoped>
.district-toggle {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  font-size: 13px;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(34, 211, 238, 0.4);
  color: rgba(255, 255, 255, 0.9);
}

.toggle-btn.active {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.15));
  border-color: rgba(34, 211, 238, 0.6);
  color: #fff;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
}

.toggle-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.toggle-text {
  flex: 1;
  text-align: left;
}

.toggle-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
}

.toggle-btn.active .toggle-status {
  background: rgba(34, 211, 238, 0.3);
}

.toggle-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  padding-left: 4px;
  line-height: 1.3;
}

.toggle-btn.active + .toggle-desc {
  color: rgba(34, 211, 238, 0.7);
}
</style>
