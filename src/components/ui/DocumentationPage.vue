<template>
  <div v-if="isOpen" class="doc-overlay" @click.self="close">
    <div class="doc-content">
      <!-- 头部 -->
      <div class="doc-header">
        <h1>项目文档</h1>
        <button class="close-btn" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 内容区 -->
      <div class="doc-body">
        <!-- 1. 研究问题 -->
        <section class="doc-section">
          <h2>1. 研究问题</h2>
          <div class="section-content">
            <p>本可视化项目旨在解答以下核心问题：</p>
            <ul class="question-list">
              <li><strong>空间分布格局：</strong>贵阳市餐饮店铺在地理空间上呈现怎样的分布形态？新老城区之间是否存在显著差异？</li>
              <li><strong>时间动态特征：</strong>不同时段（早中晚、工作日与周末）的营业状态如何变化？哪些区域拥有更活跃的"夜经济"？</li>
              <li><strong>品类聚集特征：</strong>不同类型的餐饮业态（火锅、烧烤、饮品等）在空间上是否存在聚集或分离规律？</li>
              <li><strong>品质空间分异：</strong>高评分、高性价比的店铺在空间上如何分布？是否存在"美食高地"与"美食洼地"？</li>
            </ul>
          </div>
        </section>

        <!-- 2. 设计决策依据 -->
        <section class="doc-section">
          <h2>2. 设计决策依据</h2>
          <div class="section-content">
            <h3>2.1 可视化编码选择</h3>
            <table class="decision-table">
              <thead>
                <tr>
                  <th>数据属性</th>
                  <th>视觉通道</th>
                  <th>选择依据</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>位置（经纬度）</td>
                  <td>2D 平面位置 (x, y)</td>
                  <td>真实地理映射，最直观的空间编码</td>
                </tr>
                <tr>
                  <td>评分 / 价格</td>
                  <td>柱体高度 + 半径</td>
                  <td>高度易于比较数值差异；半径辅助增强视觉区分</td>
                </tr>
                <tr>
                  <td>餐饮类别</td>
                  <td>颜色 (Hue)</td>
                  <td>类别为名义型变量，颜色是最有效的区分方式</td>
                </tr>
                <tr>
                  <td>营业状态</td>
                  <td>显示/隐藏 (Presence)</td>
                  <td>二元状态，通过动态过渡表现时间变化</td>
                </tr>
                <tr>
                  <td>密度</td>
                  <td>热力图 (Density + Color)</td>
                  <td>聚合大量点数据，揭示宏观分布模式</td>
                </tr>
              </tbody>
            </table>

            <h3>2.2 交互技术设计</h3>
            <ul class="feature-list">
              <li><strong>筛选面板：</strong>支持类别、评分、价格的多维交叉筛选，帮助用户探索特定子集</li>
              <li><strong>时间滑块 + 自动播放：</strong>模拟时间流逝，观察营业状态的动态变化</li>
              <li><strong>高度模式切换：</strong>在不同分析维度间快速切换，促进多角度理解</li>
              <li><strong>3D 视角控制：</strong>倾斜视角同时展示空间位置与数值高度，增强立体感</li>
              <li><strong>悬停提示：</strong>提供详细信息，弥补视觉编码的信息密度限制</li>
            </ul>

            <h3>2.3 替代方案考虑与最终决策</h3>

            <div class="alternative-box">
              <h4>方案 A：2D 散点图 vs 3D 柱体图</h4>
              <p><strong>替代方案：</strong>传统 2D 散点图（如 Mapbox GL 的 CircleLayer）</p>
              <p><strong>优势：</strong>渲染性能更好，实现更简单</p>
              <p><strong>劣势：</strong>难以同时展示数值维度（需要额外图例或颜色映射）</p>
              <p><strong>最终决策：</strong>选择 3D 柱体图，因为高度编码更直观，能同时展示位置与数值两个维度</p>
            </div>

            <div class="alternative-box">
              <h4>方案 B：圆形 vs 六边形柱体</h4>
              <p><strong>替代方案：</strong>圆形柱体（更常见，视觉更柔和）</p>
              <p><strong>选择依据：</strong>六边形在密集排列时能更好地利用空间（蜂巢结构），且在 3D 视角下更容易识别方向</p>
              <p><strong>最终决策：</strong>选择六边形，兼顾美观与空间利用率</p>
            </div>

            <div class="alternative-box">
              <h4>方案 C：全屏地图 vs 悬浮面板布局</h4>
              <p><strong>替代方案：</strong>控制面板作为侧边栏固定显示</p>
              <p><strong>选择依据：</strong>悬浮面板最大化地图可视区域，同时保持控件可访问性</p>
              <p><strong>最终决策：</strong>采用半透明悬浮面板，支持折叠收起，平衡信息密度与地图展示</p>
            </div>

            <div class="alternative-box">
              <h4>方案 D：实时渲染 vs 预计算热力图</h4>
              <p><strong>替代方案：</strong>预先生成各时段热力图图片</p>
              <p><strong>选择依据：</strong>实时计算更灵活，支持多维筛选后的动态热力图</p>
              <p><strong>最终决策：</strong>使用 HeatmapLayer 实时渲染，虽然性能略低但交互性强</p>
            </div>
          </div>
        </section>

        <!-- 3. 外部资源引用 -->
        <section class="doc-section">
          <h2>3. 外部资源引用</h2>
          <div class="section-content">
            <h3>3.1 数据来源</h3>
            <table class="resource-table">
              <thead>
                <tr>
                  <th>资源类型</th>
                  <th>来源</th>
                  <th>获取方式</th>
                  <th>许可协议</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>餐饮 POI 数据</td>
                  <td>高德地图 API (AMap)</td>
                  <td>API 爬取 + 关键词检索</td>
                  <td>仅供学习使用</td>
                </tr>
                <tr>
                  <td>路网数据</td>
                  <td>OpenStreetMap</td>
                  <td>Overpass Turbo 查询</td>
                  <td>ODbL (开放数据许可)</td>
                </tr>
                <tr>
                  <td>水系数据</td>
                  <td>OpenStreetMap</td>
                  <td>Overpass Turbo 查询</td>
                  <td>ODbL (开放数据许可)</td>
                </tr>
                <tr>
                  <td>行政区划边界</td>
                  <td>OpenStreetMap</td>
                  <td>Overpass Turbo 查询</td>
                  <td>ODbL (开放数据许可)</td>
                </tr>
              </tbody>
            </table>

            <h3>3.2 开发框架与库</h3>
            <table class="resource-table">
              <thead>
                <tr>
                  <th>库/框架</th>
                  <th>版本</th>
                  <th>用途</th>
                  <th>许可证</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vue.js</td>
                  <td>3.x</td>
                  <td>前端框架，响应式状态管理</td>
                  <td>MIT</td>
                </tr>
                <tr>
                  <td>Deck.gl</td>
                  <td>8.x</td>
                  <td>WebGL 大规模数据渲染</td>
                  <td>MIT</td>
                </tr>
                <tr>
                  <td>Vite</td>
                  <td>5.x</td>
                  <td>构建工具</td>
                  <td>MIT</td>
                </tr>
                <tr>
                  <td>D3.js</td>
                  <td>7.x</td>
                  <td>数据可视化（柱状图绘制）</td>
                  <td>BSD-3</td>
                </tr>
              </tbody>
            </table>

            <h3>3.3 参考案例</h3>
            <p>本项目的设计思路参考了以下优秀可视化案例：</p>
            <ul class="feature-list">
              <li><strong>Uber Movement (Uber Eats)</strong> - 实时交通与餐饮需求可视化，使用热力图展示城市活力</li>
              <li><strong>NYC Taxi Trips Visualization</strong> - 经典的 3D 城市数据可视化案例，展示时间维度动画</li>
              <li><strong>Mapbox GL Examples</strong> - 3D 建筑与柱体图层的实现参考</li>
            </ul>
          </div>
        </section>

        <!-- 4. 开发流程概述 -->
        <section class="doc-section">
          <h2>4. 开发流程概述</h2>
          <div class="section-content">
            <h3>4.1 开发阶段</h3>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>阶段一：数据获取与处理</h4>
                  <p>使用 Python 爬取高德地图 POI 数据，进行数据清洗、类别归并、坐标转换（GCJ-02 → WGS-84）</p>
                  <p class="timeline-note">耗时约 8 小时</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>阶段二：基础地图搭建</h4>
                  <p>配置 Deck.gl 环境，实现路网、水系图层渲染，建立 3D 视角控制</p>
                  <p class="timeline-note">耗时约 6 小时</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>阶段三：美食数据可视化</h4>
                  <p>实现六边形柱体图层，高度映射算法，颜色编码系统，时间筛选逻辑</p>
                  <p class="timeline-note">耗时约 10 小时</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>阶段四：交互功能开发</h4>
                  <p>开发筛选面板、热力图切换、区域对比分析、悬停提示框</p>
                  <p class="timeline-note">耗时约 12 小时</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>阶段五：优化与部署</h4>
                  <p>性能优化、样式调整、GitHub Pages 部署配置</p>
                  <p class="timeline-note">耗时约 6 小时</p>
                </div>
              </div>
            </div>

            <h3>4.2 开发耗时总结</h3>
            <div class="summary-box">
              <p><strong>总工时：</strong>约 42 小时（约 5-6 个工作日）</p>
              <p><strong>耗时最多的环节：</strong>交互功能开发（约占 29%）</p>
              <p><strong>主要原因：</strong></p>
              <ul>
                <li>Vue 3 响应式状态管理较复杂，需要仔细设计数据流</li>
                <li>Deck.gl 图层交互（悬停、点击）调试困难</li>
                <li>区域对比分析涉及点-多边形匹配算法，需要多次优化</li>
                <li>UI 组件的折叠/展开动画需要细致调整</li>
              </ul>
            </div>

            <h3>4.3 技术难点与解决方案</h3>

            <div class="challenge-category">
              <h4 class="category-title">一、数据采集层：从"获取"到"榨干"的博弈</h4>
              <p class="category-desc">这是项目最初也是最耗时的难点，主要体现为与地理信息 API 的限制做斗争。</p>

              <div class="challenge-box">
                <h4>难点 1：API 的分页与总量限制</h4>
                <p><strong>问题：</strong>高德 API 单次请求最多返回 200 条 POI，且单次翻页有限。</p>
                <p><strong>解决：</strong>通过九宫格网格扫描，后续升级为全域矩形边界网格扫描才突破了这一物理限制。</p>
              </div>

              <div class="challenge-box">
                <h4>难点 2：高频并发的封禁（QPS 限制）</h4>
                <p><strong>问题：</strong>免费版 API 限制每秒 3 次请求。最初脚本因速度过快导致 Connection reset by peer。</p>
                <p><strong>解决：</strong>引入了 time.sleep(0.4) 的硬性节流和指数退避重试机制。</p>
              </div>

              <div class="challenge-box">
                <h4>难点 3：断点续传的鲁棒性</h4>
                <p><strong>问题：</strong>面对上万条数据，网络波动或电脑休眠会导致脚本中断。</p>
                <p><strong>解决：</strong>通过引入 scrape_progress.json 记录已完成的 (坐标+分类) 单元，实现了工业级的断点续传。</p>
              </div>
            </div>

            <div class="challenge-category">
              <h4 class="category-title">二、数据清洗与预处理层：坐标系的"幽灵偏差"</h4>
              <p class="category-desc">数据拿到了，但"牛头不对马嘴"是地理计算中最大的坑。</p>

              <div class="challenge-box">
                <h4>难点 4：坐标系不统一（CRS Conflict）</h4>
                <p><strong>问题：</strong>OSM 数据使用标准 WGS-84（地球坐标），高德数据使用 GCJ-02（火镜坐标，带加密偏移）。如果不做转换，所有的美食光柱会整体偏移几百米，落入河流或错误的建筑块中。</p>
                <p><strong>解决：</strong>在 Python 端进行全量坐标纠偏，确保所有数据统一到 WGS-84 坐标系。</p>
              </div>

              <div class="challenge-box">
                <h4>难点 5：海量数据的去重与清洗</h4>
                <p><strong>问题：</strong>在网格重叠扫描时，同一家店会被采集多次。</p>
                <p><strong>解决：</strong>利用 name + lng + lat 生成唯一哈希键，在内存和磁盘间进行动态去重。</p>
              </div>
            </div>

            <div class="challenge-category">
              <h4 class="category-title">三、地理信息层：空间边界的精准界定</h4>
              <p class="category-desc">为了让分析有意义，必须给数据加上"行政外壳"。</p>

              <div class="challenge-box">
                <h4>难点 6：行政区划的模糊性</h4>
                <p><strong>问题：</strong>贵阳的区划（如观山湖与云岩的分界）在普通搜索中很难拿到矢量边界。</p>
                <p><strong>解决：</strong>学习 Overpass Turbo 语法，通过 admin_level=6 结合 relation 语法，从 OSM 数据库中抠出精准的五个区边界 GeoJSON。</p>
              </div>

              <div class="challenge-box">
                <h4>难点 7：底图依赖问题</h4>
                <p><strong>问题：</strong>为摆脱对 Mapbox Token 的商业依赖，需要自己处理所有底图渲染逻辑。</p>
                <p><strong>解决：</strong>探索 Deck.gl 独立渲染模式，自己处理路网、水系、建筑的所有 GeoJSON 渲染逻辑。</p>
              </div>

              <div class="challenge-box">
                <h4>难点 8：区域 POI 分配</h4>
                <p><strong>问题：</strong>需要判断每个 POI 属于哪个行政区。</p>
                <p><strong>解决：</strong>实现射线法点-多边形包含检测算法，为 POI 打上区域标签。</p>
              </div>
            </div>

            <div class="challenge-category">
              <h4 class="category-title">四、核心逻辑层：从"数据展示"到"哲学叙事"</h4>
              <p class="category-desc">这是最高级的困难：如何让这堆经纬度不仅仅是一堆数字？</p>

              <div class="challenge-box">
                <h4>难点 9：意义的匮乏感</h4>
                <p><strong>问题：</strong>最初只是"打点"，看起来毫无深度。</p>
                <p><strong>解决：</strong>通过引入"城市性格对比"（老城有机路网 vs 新城网格路网）和"阶层空间分析"（光柱高度代表价格，亮度代表评分），赋予了数据社会学和城市研究的哲理深度。</p>
              </div>

              <div class="challenge-box">
                <h4>难点 10：动态叙事</h4>
                <p><strong>问题：</strong>如何展示"深夜"的主题？</p>
                <p><strong>解决：</strong>通过时间轴控制营业状态的显隐，模拟城市灯火随时间流逝的熄灭与点亮。</p>
              </div>

              <div class="challenge-box">
                <h4>难点 11：大规模数据渲染性能</h4>
                <p><strong>问题：</strong>16,000+ 柱体同时渲染导致帧率下降。</p>
                <p><strong>解决：</strong>使用时间筛选减少同时渲染的柱体数量，优化柱体几何复杂度。</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
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
</script>

<style scoped>
.doc-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.doc-content {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(236, 72, 153, 0.1);
}

.doc-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #ec4899;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
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
  width: 20px;
  height: 20px;
}

.doc-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.doc-body::-webkit-scrollbar {
  width: 6px;
}

.doc-body::-webkit-scrollbar-track {
  background: transparent;
}

.doc-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.doc-section {
  margin-bottom: 36px;
}

.doc-section:last-child {
  margin-bottom: 0;
}

.doc-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #22d3ee;
  margin: 0 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(34, 211, 238, 0.3);
}

.doc-section h3 {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 20px 0 12px 0;
}

.doc-section h3:first-child {
  margin-top: 0;
}

.doc-section p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin: 8px 0;
}

.question-list {
  margin: 12px 0;
  padding-left: 20px;
}

.question-list li {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  margin: 8px 0;
}

.question-list strong {
  color: #22d3ee;
}

.feature-list {
  margin: 12px 0;
  padding-left: 20px;
}

.feature-list li {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin: 6px 0;
}

.feature-list strong {
  color: rgba(255, 255, 255, 0.9);
}

.decision-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 16px 0;
}

.decision-table th,
.decision-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.decision-table th {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  font-weight: 600;
}

.decision-table td {
  color: rgba(255, 255, 255, 0.7);
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 16px 0;
}

.resource-table th,
.resource-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.resource-table th {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
  font-weight: 600;
}

.resource-table td {
  color: rgba(255, 255, 255, 0.7);
}

.alternative-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.alternative-box h4 {
  font-size: 14px;
  font-weight: 600;
  color: #22d3ee;
  margin: 0 0 8px 0;
}

.alternative-box p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0;
}

.timeline {
  position: relative;
  padding-left: 24px;
  margin: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 14px;
  height: 14px;
  background: #22d3ee;
  border: 3px solid rgba(15, 23, 42, 1);
  border-radius: 50%;
}

.timeline-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px 0;
}

.timeline-content p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0;
}

.timeline-note {
  color: #a78bfa !important;
  font-style: italic;
}

.summary-box {
  background: rgba(34, 211, 238, 0.05);
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.summary-box p {
  margin: 6px 0;
}

.summary-box strong {
  color: #22d3ee;
}

.summary-box ul {
  margin: 8px 0;
  padding-left: 20px;
}

.summary-box li {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0;
}

.challenge-category {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.category-title {
  font-size: 15px;
  font-weight: 600;
  color: #a78bfa;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
}

.category-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 12px 0;
  font-style: italic;
}

.challenge-category .challenge-box {
  background: rgba(239, 68, 68, 0.03);
  border-color: rgba(239, 68, 68, 0.15);
  margin-bottom: 10px;
}

.challenge-box {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.challenge-box h4 {
  font-size: 13px;
  font-weight: 600;
  color: #f87171;
  margin: 0 0 6px 0;
}

.challenge-box p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0;
}
</style>
