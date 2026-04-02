<template>
  <div class="time-slider-container">
    <button @click="togglePlay" :class="['play-button', { playing: isPlaying }]" :title="isPlaying ? '暂停' : '播放'">
      {{ isPlaying ? '⏸' : '▶' }}
    </button>

    <span class="time-value">{{ currentTime }}</span>

    <input
      type="range"
      :min="minMinutes"
      :max="sliderMax"
      :value="currentMinutes"
      @input="handleTimeChange"
      class="time-slider"
    />

    <span class="time-hint">
      <span v-if="isNightTime">深夜</span>
      <span v-else-if="isDinnerTime">晚餐</span>
      <span v-else-if="isLunchTime">午餐</span>
      <span v-else></span>
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { timeToMinutes, minutesToTime } from '../../utils/timeUtils'

const props = defineProps({
  currentTime: {
    type: String,
    required: true
  },
  minTime: {
    type: String,
    default: '00:00'
  },
  maxTime: {
    type: String,
    default: '24:00'
  },
  autoPlayInterval: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['update:currentTime'])

const isPlaying = ref(false)
let playInterval = null

const minMinutes = computed(() => timeToMinutes(props.minTime))
const maxMinutes = computed(() => timeToMinutes(props.maxTime))

// 处理跨天场景：计算滑块的实际范围
const isCrossDay = computed(() => maxMinutes.value < minMinutes.value)

// 滑块的范围：跨天时从 minTime 到 24:00 + maxTime
const sliderMax = computed(() => isCrossDay.value ? 24 * 60 + maxMinutes.value : maxMinutes.value)

// 将当前时间转换为滑块值
const currentMinutes = computed(() => {
  const current = timeToMinutes(props.currentTime)
  if (isCrossDay.value) {
    // 跨天场景：如果当前时间小于 minTime，说明是第二天，加 24 小时
    return current < minMinutes.value ? current + 24 * 60 : current
  }
  return current
})

const isNightTime = computed(() => {
  const min = timeToMinutes(props.currentTime)
  return min >= 22 * 60 || min < 6 * 60
})

const isDinnerTime = computed(() => {
  const min = timeToMinutes(props.currentTime)
  return min >= 17 * 60 && min < 21 * 60
})

const isLunchTime = computed(() => {
  const min = timeToMinutes(props.currentTime)
  return min >= 11 * 60 && min < 14 * 60
})

function handleTimeChange(event) {
  let minutes = parseInt(event.target.value)
  // 如果是跨天且值超过 24 小时，减去 24 小时得到真实时间
  if (isCrossDay.value && minutes >= 24 * 60) {
    minutes = minutes - 24 * 60
  }
  emit('update:currentTime', minutesToTime(minutes))
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    playInterval = setInterval(() => {
      const currentMin = timeToMinutes(props.currentTime)
      const nextMin = (currentMin + 30) % (24 * 60)
      emit('update:currentTime', minutesToTime(nextMin))
    }, props.autoPlayInterval)
  } else {
    if (playInterval) {
      clearInterval(playInterval)
      playInterval = null
    }
  }
}

onUnmounted(() => {
  if (playInterval) {
    clearInterval(playInterval)
  }
})
</script>

<style scoped>
.time-slider-container {
  position: relative;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  width: 520px;
  max-width: 90vw;
}

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(30, 41, 59, 0.9);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  pointer-events: auto;
}

.play-button:hover {
  background: rgba(34, 211, 238, 0.3);
  border-color: rgba(34, 211, 238, 0.6);
  transform: scale(1.05);
}

.play-button.playing {
  background: rgba(34, 211, 238, 0.3);
  border-color: rgba(34, 211, 238, 0.6);
}

.time-value {
  font-size: 15px;
  font-weight: 600;
  color: #22d3ee;
  font-family: 'Courier New', monospace;
  min-width: 52px;
  letter-spacing: 0.5px;
}

.time-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  pointer-events: auto;
}

.time-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
  transition: all 0.2s;
}

.time-slider::-webkit-slider-thumb:hover {
  background: #67e8f9;
  transform: scale(1.15);
}

.time-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
}

.time-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 12px;
  flex-shrink: 0;
}
</style>
