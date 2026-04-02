<template>
  <div class="map-controls">
    <button @click="handleReset" class="control-btn reset-btn" title="重置所有选项">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-9 9"/>
        <path d="M3 3v6h6"/>
      </svg>
    </button>
    <button @click="handleToggle" class="control-btn view-btn" :title="is3D ? '切换到 2D 视图' : '切换到 3D 视图'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 3v18"/>
        <path d="M5.6 5.6l12.8 12.8"/>
        <circle cx="12" cy="12" r="3" v-if="!is3D"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pitch: {
    type: Number,
    default: 60
  }
})

const emit = defineEmits(['reset-view', 'toggle-2d'])

const is3D = computed(() => props.pitch > 0)

function handleReset() {
  console.log('重置所有状态')
  emit('reset-view')
}

function handleToggle() {
  console.log(`切换视图: ${is3D.value ? '3D -> 2D' : '2D -> 3D'}`)
  emit('toggle-2d')
}
</script>

<style scoped>
.map-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 1000;
}

.control-btn {
  width: 44px;
  height: 44px;
  background: rgba(15, 23, 42, 0.95);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.control-btn svg {
  width: 20px;
  height: 20px;
}

.control-btn:hover {
  background: rgba(34, 211, 238, 0.2);
  border-color: rgba(34, 211, 238, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.control-btn:active {
  transform: translateY(0);
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.view-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.4);
}
</style>
