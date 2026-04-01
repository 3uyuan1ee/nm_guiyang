<template>
  <div class="heatmap-toggle">
    <button
      @click="$emit('toggle')"
      :class="['toggle-btn', { active: modelValue }]"
      :title="modelValue ? '隐藏热力图' : '显示热力图'"
    >
      <span class="toggle-text">美食密度热力图</span>
      <span class="toggle-status">{{ modelValue ? 'ON' : 'OFF' }}</span>
    </button>
    <p class="toggle-desc">
      {{ modelValue ? '老城"血管状" vs 新城"岛屿状"分布' : '展示美食POI密度分布' }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])
</script>

<style scoped>
.heatmap-toggle {
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
  border-color: rgba(255, 100, 100, 0.4);
  color: rgba(255, 255, 255, 0.9);
}

.toggle-btn.active {
  background: linear-gradient(135deg, rgba(255, 80, 80, 0.3), rgba(255, 150, 50, 0.2));
  border-color: rgba(255, 100, 100, 0.6);
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 100, 100, 0.3);
}

.toggle-icon {
  font-size: 16px;
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
  background: rgba(255, 100, 100, 0.3);
}

.toggle-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  padding-left: 4px;
  line-height: 1.3;
}

.toggle-btn.active + .toggle-desc {
  color: rgba(255, 150, 100, 0.7);
}
</style>
