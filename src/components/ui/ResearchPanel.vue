<template>
  <div class="research-panel">
    <div class="research-header" @click="toggleCollapse">
      <div class="header-left">
        <svg class="research-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <path d="M11 8v6M8 11h6"/>
        </svg>
        <h3>研究探索</h3>
      </div>
      <span class="collapse-icon" :class="{ collapsed: isCollapsed }">▼</span>
    </div>

    <div v-show="!isCollapsed" class="research-content">
      <!-- 研究问题列表 -->
      <div class="research-list">
        <button
          v-for="preset in presets"
          :key="preset.key"
          :class="['research-item', { active: activePresetKey === preset.key }]"
          @click="applyPreset(preset)"
        >
          <span class="research-dot"></span>
          <span class="research-name">{{ preset.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  presets: {
    type: Array,
    default: () => []
  },
  activePresetKey: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['apply-preset'])

const isCollapsed = ref(true)

function applyPreset(preset) {
  emit('apply-preset', preset)
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.research-panel {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.research-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.research-icon {
  width: 18px;
  height: 18px;
  color: #a78bfa;
}

.research-header h3 {
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

.research-content {
  padding-top: 12px;
}

.research-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.research-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.research-item:hover {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
}

.research-item.active {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.5);
}

.research-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  transition: background 0.2s;
}

.research-item:hover .research-dot {
  background: #a78bfa;
}

.research-item.active .research-dot {
  background: #a78bfa;
  box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
}

.research-name {
  flex: 1;
}
</style>
