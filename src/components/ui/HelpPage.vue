<template>
  <div v-if="isOpen" class="help-overlay" @click.self="close">
    <div class="help-content">
      <!-- 头部 -->
      <div class="help-header">
        <h1>使用指南</h1>
        <button class="close-btn" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 内容区 -->
      <div class="help-body">
        <!-- 1. 使用方法 -->
        <section class="help-section">
          <h2>操作指南</h2>
          <div class="section-content">
            <div class="instruction-list">
              <div class="instruction-item">
                <div class="step-num">1</div>
                <div class="step-content">
                  <h4>时间筛选</h4>
                  <p>拖动底部时间滑块，筛选当前营业中的店铺。点击播放按钮，时间会以半小时为单位流动。</p>
                </div>
              </div>
              <div class="instruction-item">
                <div class="step-num">2</div>
                <div class="step-content">
                  <h4>类别筛选</h4>
                  <p>点击"美食类别"展开面板，勾选/取消勾选特定类别。</p>
                </div>
              </div>
              <div class="instruction-item">
                <div class="step-num">3</div>
                <div class="step-content">
                  <h4>评分/价格筛选</h4>
                  <p>点击"筛选条件"展开，拖动滑块设置评分和价格范围。</p>
                </div>
              </div>
              <div class="instruction-item">
                <div class="step-num">4</div>
                <div class="step-content">
                  <h4>柱体高度切换</h4>
                  <p>点击"柱体高度"切换评分/价格模式，观察不同维度的空间分布。</p>
                </div>
              </div>
              <div class="instruction-item">
                <div class="step-num">5</div>
                <div class="step-content">
                  <h4>热力图模式</h4>
                  <p>点击"热力图"查看美食密度分布，识别热门聚集区域。</p>
                </div>
              </div>
              <div class="instruction-item">
                <div class="step-num">6</div>
                <div class="step-content">
                  <h4>区域对比</h4>
                  <p>点击"区域对比"切换模式：5区模式或老城vs新城对比。鼠标悬停查看区域统计详情。</p>
                </div>
              </div>
              <div class="instruction-item">
                <div class="step-num">7</div>
                <div class="step-content">
                  <h4>查看详情</h4>
                  <p>鼠标悬停在柱体上查看店铺详细信息（名称、类别、评分、价格、营业时间）。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. 颜色图例 -->
        <section class="help-section">
          <h2>颜色图例</h2>
          <div class="section-content">
            <div class="legend-grid">
              <div class="legend-item" v-for="cat in categories" :key="cat.name">
                <span class="legend-color" :style="{ backgroundColor: cat.color }"></span>
                <span class="legend-name">{{ cat.name }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. 统计指标说明 -->
        <section class="help-section">
          <h2>统计指标说明</h2>
          <div class="section-content">
            <table class="formula-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>计算公式</th>
                  <th>业务含义</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>平均评分</td>
                  <td>Σ(评分) / 有效评分数</td>
                  <td>区域整体口碑水平</td>
                </tr>
                <tr>
                  <td>平均价格</td>
                  <td>Σ(人均消费) / 有效价格数</td>
                  <td>区域消费水平</td>
                </tr>
                <tr>
                  <td>性价比指数</td>
                  <td>(评分≥4.0 且价格≤80元店铺数 / 总数) × 100%</td>
                  <td>高质平价店铺占比</td>
                </tr>
                <tr>
                  <td>价格分布</td>
                  <td>低(≤50) / 中(50-100) / 高(>100)</td>
                  <td>消费档次结构</td>
                </tr>
                <tr>
                  <td>评分分布</td>
                  <td>低(<3.5) / 中(3.5-4.0) / 高(≥4.0)</td>
                  <td>品质等级结构</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCategoryColorCss } from '../../utils/colorUtils'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

const categories = [
  { name: '中餐厅', color: getCategoryColorCss('中餐厅') },
  { name: '火锅', color: getCategoryColorCss('火锅') },
  { name: '咖啡', color: getCategoryColorCss('咖啡') },
  { name: '家常菜', color: getCategoryColorCss('家常菜') },
  { name: '烧烤夜市', color: getCategoryColorCss('烧烤夜市') },
  { name: '酒吧', color: getCategoryColorCss('酒吧') },
  { name: '特色餐饮', color: getCategoryColorCss('特色餐饮') },
  { name: '饮品', color: getCategoryColorCss('饮品') },
  { name: '甜品糕点', color: getCategoryColorCss('甜品糕点') },
  { name: '地方菜系', color: getCategoryColorCss('地方菜系') },
  { name: '快餐', color: getCategoryColorCss('快餐') },
  { name: '异国料理', color: getCategoryColorCss('异国料理') },
  { name: '清真菜馆', color: getCategoryColorCss('清真菜馆') }
]
</script>

<style scoped>
.help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.help-content {
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.help-header h1 {
  font-size: 18px;
  font-weight: 700;
  color: #22d3ee;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.help-body::-webkit-scrollbar {
  width: 4px;
}

.help-body::-webkit-scrollbar-track {
  background: transparent;
}

.help-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.help-section {
  margin-bottom: 24px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h2 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.category-group {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 14px;
}

.category-group h4 {
  font-size: 12px;
  font-weight: 600;
  color: #22d3ee;
  margin: 0 0 4px 0;
}

.category-group p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-item {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
}

.step-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #22d3ee, #8b5cf6);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px 0;
}

.step-content p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 6px 10px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-name {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.formula-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.formula-table th,
.formula-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.formula-table th {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  font-weight: 600;
}

.formula-table td {
  color: rgba(255, 255, 255, 0.7);
}

.formula-table td:last-child {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
}
</style>
