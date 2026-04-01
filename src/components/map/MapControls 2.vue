<template>
  <div class="map-controls">
    <button @click="handleReset" class="control-btn" title="重置视角">
      重置
    </button>
    <button @click="handleToggle" class="control-btn" :title="is3D ? '切换到 2D 视图' : '切换到 3D 视图'">
      {{ is3D ? '2D' : '3D' }}
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
  console.log('重置视角')
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
  bottom: 100px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.control-btn {
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  min-width: 60px;
}

.control-btn:hover {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.control-btn:active {
  transform: translateY(0);
}
</style>
