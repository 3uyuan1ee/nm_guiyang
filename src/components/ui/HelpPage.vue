<template>
  <div v-if="isOpen" class="help-overlay" @click.self="close">
    <div class="help-content">
      <div class="help-header">
        <h1>使用指南</h1>
        <button class="close-btn" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="help-body">
        <section class="help-section">
          <h2>界面概览</h2>
          <div class="section-content">
            <div class="overview-grid">
              <div class="overview-item">
                <h4>顶部导航栏</h4>
                <p>包含使用指南、项目文档、数据仪表板三个功能入口</p>
              </div>
              <div class="overview-item">
                <h4>左侧控制面板</h4>
                <p>研究预设、类别筛选、评分/价格范围、高度模式、热力图、区域对比</p>
              </div>
              <div class="overview-item">
                <h4>中央3D地图</h4>
                <p>展示美食店铺的空间分布，支持旋转、缩放、平移</p>
              </div>
              <div class="overview-item">
                <h4>底部时间轴</h4>
                <p>控制营业时间筛选，支持手动拖动和自动播放</p>
              </div>
              <div class="overview-item">
                <h4>右下角控制</h4>
                <p>导出数据、重置视图、2D/3D切换</p>
              </div>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h2>研究预设</h2>
          <div class="section-content">
            <p class="intro">点击预设卡片快速加载分析场景：</p>
            <div class="preset-list">
              <div class="preset-item">
                <div class="preset-info">
                  <h4>夜经济活力</h4>
                  <p>深夜时段筛选烧烤和酒吧，观察夜生活聚集区域</p>
                </div>
              </div>
              <div class="preset-item">
                <div class="preset-info">
                  <h4>咖啡文化地图</h4>
                  <p>下午时段咖啡馆分布，反映城市现代化程度</p>
                </div>
              </div>
              <div class="preset-item">
                <div class="preset-info">
                  <h4>老城新城对比</h4>
                  <p>分组模式对比老城区与观山湖区的餐饮分布差异</p>
                </div>
              </div>
              <div class="preset-item">
                <div class="preset-info">
                  <h4>高性价比寻味</h4>
                  <p>筛选高评分低价格店铺，发现平价美食</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h2>筛选控制</h2>
          <div class="section-content">
            <div class="control-list">
              <div class="control-item">
                <h4>时间筛选</h4>
                <p>拖动时间滑块，只显示当前时段营业中的店铺。点击播放按钮自动流动时间</p>
              </div>
              <div class="control-item">
                <h4>类别筛选</h4>
                <p>13个美食类别，可单选或组合，支持全选和清空</p>
              </div>
              <div class="control-item">
                <h4>评分/价格筛选</h4>
                <p>双滑块设置范围，快捷按钮一键设置常用区间</p>
              </div>
              <div class="control-item">
                <h4>柱体高度</h4>
                <p>切换评分模式或价格模式，从不同维度观察分布</p>
              </div>
              <div class="control-item">
                <h4>热力图</h4>
                <p>开启后显示密度热力层，快速识别热门区域</p>
              </div>
              <div class="control-item">
                <h4>区域模式</h4>
                <p>关闭/五区显示/老城新城分组，悬停查看区域统计</p>
              </div>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h2>地图操作</h2>
          <div class="section-content">
            <div class="operation-grid">
              <div class="operation-item">
                <h4>旋转视角</h4>
                <p>左键按住拖拽</p>
              </div>
              <div class="operation-item">
                <h4>缩放地图</h4>
                <p>鼠标滚轮上下滚动</p>
              </div>
              <div class="operation-item">
                <h4>平移位置</h4>
                <p>右键按住拖拽</p>
              </div>
              <div class="operation-item">
                <h4>查看详情</h4>
                <p>鼠标悬停在柱体上</p>
              </div>
              <div class="operation-item">
                <h4>2D/3D切换</h4>
                <p>点击右下角视图按钮</p>
              </div>
              <div class="operation-item">
                <h4>重置视图</h4>
                <p>点击重置按钮恢复默认</p>
              </div>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h2>数据导出</h2>
          <div class="section-content">
            <p class="intro">点击右下角导出按钮，保存当前筛选结果为CSV文件</p>
            <div class="export-fields">
              <span class="field-tag">名称</span>
              <span class="field-tag">类别</span>
              <span class="field-tag">评分</span>
              <span class="field-tag">价格</span>
              <span class="field-tag">区域</span>
              <span class="field-tag">营业时间</span>
              <span class="field-tag">地址</span>
            </div>
            <p class="note">文件自动命名：贵阳美食数据_时间_数量家.csv</p>
          </div>
        </section>

        <section class="help-section">
          <h2>数据仪表板</h2>
          <div class="section-content">
            <p class="intro">点击顶部"数据仪表板"查看深度分析图表</p>
            <div class="chart-list">
              <div class="chart-item">
                <h4>24小时呼吸曲线</h4>
                <p>对比老城区和观山湖区各时段的活跃度差异</p>
              </div>
              <div class="chart-item">
                <h4>性价比散点图</h4>
                <p>双区域对比，识别高性价比聚集区域</p>
              </div>
              <div class="chart-item">
                <h4>香农熵指数</h4>
                <p>玫瑰图展示品类多样性，分析区域餐饮结构均衡度</p>
              </div>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h2>类别颜色图例</h2>
          <div class="section-content">
            <div class="legend-grid">
              <div class="legend-item" v-for="cat in categories" :key="cat.name">
                <span class="legend-color" :style="{ backgroundColor: cat.color }"></span>
                <span class="legend-name">{{ cat.name }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h2>统计指标说明</h2>
          <div class="section-content">
            <table class="metric-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>平均评分</td>
                  <td>区域所有店铺评分的平均值，反映整体口碑</td>
                </tr>
                <tr>
                  <td>平均价格</td>
                  <td>区域人均消费的平均值，反映消费水平</td>
                </tr>
                <tr>
                  <td>高性价比占比</td>
                  <td>评分3.8以上且价格120元以下店铺的百分比</td>
                </tr>
                <tr>
                  <td>香农熵</td>
                  <td>品类多样性指数，值越高表示品类分布越均衡</td>
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
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.help-header h1 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  padding: 24px;
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
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-content {
  padding-left: 2px;
}

.intro {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.note {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin: 10px 0 0 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.overview-item {
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.overview-item h4 {
  font-size: 12px;
  font-weight: 600;
  color: #22d3ee;
  margin: 0 0 4px 0;
}

.overview-item p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-item {
  background: rgba(167, 139, 250, 0.08);
  border-left: 3px solid #a78bfa;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
}

.preset-info h4 {
  font-size: 13px;
  font-weight: 600;
  color: #a78bfa;
  margin: 0 0 4px 0;
}

.preset-info p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

.control-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
}

.control-item h4 {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 4px 0;
}

.control-item p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
}

.operation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.operation-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.operation-item h4 {
  font-size: 12px;
  font-weight: 600;
  color: #22d3ee;
  margin: 0 0 6px 0;
}

.operation-item p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.export-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.field-tag {
  padding: 5px 10px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 16px;
  font-size: 12px;
  color: #22c55e;
}

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-item {
  background: rgba(236, 72, 153, 0.08);
  border-left: 3px solid #ec4899;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
}

.chart-item h4 {
  font-size: 13px;
  font-weight: 600;
  color: #ec4899;
  margin: 0 0 4px 0;
}

.chart-item p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  color: rgba(255, 255, 255, 0.85);
}

.metric-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.metric-table th,
.metric-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-table th {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  font-weight: 600;
}

.metric-table td {
  color: rgba(255, 255, 255, 0.75);
}

.metric-table td:first-child {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}
</style>
