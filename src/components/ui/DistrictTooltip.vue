<template>
  <div v-if="stats" class="district-tooltip" :style="{ left: x + 'px', top: y + 'px' }" :key="stats.name">
    <!-- 标题 -->
    <div class="tooltip-header">
      <h3>{{ stats.name }}</h3>
      <span class="district-tag">{{ stats.mode === 'group' ? '区域分组' : '行政区' }}</span>
    </div>

    <!-- 核心指标 -->
    <div class="metrics-grid">
      <div class="metric-card primary">
        <div class="metric-value">{{ stats.totalCount.toLocaleString() }}</div>
        <div class="metric-label">店铺总数</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">{{ stats.avgRating }}</div>
        <div class="metric-label">平均评分</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">¥{{ stats.avgCost }}</div>
        <div class="metric-label">平均价格</div>
      </div>
      <div class="metric-card" :class="getValueScoreClass(stats.valueScore)">
        <div class="metric-value">{{ stats.valueScore }}%</div>
        <div class="metric-label">性价比</div>
      </div>
    </div>

    <!-- 价格分布 -->
    <div class="distribution-section">
      <div class="section-title">价格分布</div>
      <div class="dist-bar-container">
        <div class="dist-bar">
          <div class="dist-segment low" :style="{ width: stats.lowPricePercent + '%' }">
            <span v-if="stats.lowPricePercent > 10">{{ stats.lowPricePercent }}%</span>
          </div>
          <div class="dist-segment mid" :style="{ width: stats.midPricePercent + '%' }">
            <span v-if="stats.midPricePercent > 10">{{ stats.midPricePercent }}%</span>
          </div>
          <div class="dist-segment high" :style="{ width: stats.highPricePercent + '%' }">
            <span v-if="stats.highPricePercent > 10">{{ stats.highPricePercent }}%</span>
          </div>
        </div>
        <div class="dist-legend">
          <span class="legend-item low">≤50元</span>
          <span class="legend-item mid">50-100元</span>
          <span class="legend-item high">>100元</span>
        </div>
      </div>
    </div>

    <!-- 评分分布 -->
    <div class="distribution-section">
      <div class="section-title">评分分布</div>
      <div class="dist-bar-container">
        <div class="dist-bar">
          <div class="dist-segment low-rating" :style="{ width: stats.lowRatingPercent + '%' }">
            <span v-if="stats.lowRatingPercent > 10">{{ stats.lowRatingPercent }}%</span>
          </div>
          <div class="dist-segment mid-rating" :style="{ width: stats.midRatingPercent + '%' }">
            <span v-if="stats.midRatingPercent > 10">{{ stats.midRatingPercent }}%</span>
          </div>
          <div class="dist-segment high-rating" :style="{ width: stats.highRatingPercent + '%' }">
            <span v-if="stats.highRatingPercent > 10">{{ stats.highRatingPercent }}%</span>
          </div>
        </div>
        <div class="dist-legend">
          <span class="legend-item low-rating">&lt;3.5</span>
          <span class="legend-item mid-rating">3.5-4.0</span>
          <span class="legend-item high-rating">≥4.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Object,
    default: null
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  }
})

function getValueScoreClass(score) {
  if (score >= 40) return 'high-score'
  if (score >= 25) return 'mid-score'
  return 'low-score'
}
</script>

<style scoped>
.district-tooltip {
  position: fixed;
  width: 280px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0;
  z-index: 1000;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  font-size: 13px;
  pointer-events: none;
}

.tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px 12px 0 0;
}

.tooltip-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.district-tag {
  padding: 2px 8px;
  background: rgba(34, 211, 238, 0.2);
  border: 1px solid rgba(34, 211, 238, 0.4);
  border-radius: 4px;
  font-size: 10px;
  color: #22d3ee;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px 14px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.metric-card.primary {
  background: rgba(34, 211, 238, 0.1);
  border-color: rgba(34, 211, 238, 0.3);
}

.metric-card.high-score {
  border-color: rgba(34, 197, 94, 0.4);
}

.metric-card.mid-score {
  border-color: rgba(251, 191, 36, 0.4);
}

.metric-card.low-score {
  border-color: rgba(239, 68, 68, 0.4);
}

.metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.metric-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.distribution-section {
  padding: 8px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.distribution-section:last-child {
  border-radius: 0 0 12px 12px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.dist-bar-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dist-bar {
  display: flex;
  height: 18px;
  border-radius: 4px;
  overflow: hidden;
}

.dist-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #fff;
  transition: width 0.3s;
}

.dist-segment.low,
.dist-segment.low-rating {
  background: rgba(34, 197, 94, 0.7);
}

.dist-segment.mid,
.dist-segment.mid-rating {
  background: rgba(251, 191, 36, 0.7);
}

.dist-segment.high,
.dist-segment.high-rating {
  background: rgba(239, 68, 68, 0.7);
}

.dist-legend {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
}

.legend-item.low { color: #22c55e; }
.legend-item.mid { color: #fbbf24; }
.legend-item.high { color: #ef4444; }

.legend-item.low-rating { color: #22c55e; }
.legend-item.mid-rating { color: #fbbf24; }
.legend-item.high-rating { color: #ef4444; }
</style>
