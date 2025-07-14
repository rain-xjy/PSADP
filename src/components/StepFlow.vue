<template>
  <div class="charge-indicator-container">
    <!-- 左侧步骤导航 -->
    <el-steps direction="horizontal" :active="step" class="steps-nav-horizontal">
      <el-step title="选择分析指标"></el-step>
      <el-step title="选择可视化图形"></el-step>
      <el-step title="选择统计维度"></el-step>
      <el-step title="选择筛选条件"></el-step>
      <el-step title="结果展示"></el-step>
    </el-steps>

    <!-- 右侧内容区 -->
    <div class="content-area">
      <!-- 步骤1：选择分析指标 -->
      <div v-if="step === 0">
        <h3>请选择要分析的{{targetName[viewName]}}指标</h3>
        <el-select v-model="selectedIndicator" placeholder="请选择分析指标" filterable style="width: 220px;">
          <el-option v-for="item in indicators" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <div class="desc">选择后将加载可用可视化图形</div>
      </div>

      <!-- 步骤2：选择可视化图形 -->
      <div v-if="step === 1">
        <div class="desc">当前指标支持以下图形（可多选，最多2个，饼图/热力图只能单选）</div>
        <el-row :gutter="20">
          <el-col v-for="chart in charts" :key="chart.type" :span="8">
            <el-card :class="{selected: selectedCharts.includes(chart.type)}" @click="selectChart(chart.type)">
              <div style="text-align:center;">
                <div>{{ chart.name }}</div>
                <div style="font-size:24px;">{{ chart.icon }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 步骤3：配置展示维度 -->
      <div v-if="step === 2">
        <div class="desc">请选择统计维度</div>
        <el-select v-model="selectedDimension" placeholder="请选择统计维度" filterable style="width: 220px;">
          <el-option v-for="dim in dimensions" :key="dim" :label="dim" :value="dim"></el-option>
        </el-select>
      </div>

      <!-- 步骤4：设置筛选条件 -->
      <div v-if="step === 3">
        <div class="desc">请选择筛选维度（VIN或车型二选一）</div>
        <el-radio-group v-model="filterType">
          <el-radio label="VIN">VIN</el-radio>
          <el-radio label="车型">车型(*特殊指标,日期维度按季度筛选)</el-radio>
        </el-radio-group>
        <div v-if="filterType === 'VIN'" style="margin:10px 0;">
          <div>
            <el-select v-model="filterValues.vin"  placeholder="选择VIN" multiple filterable style="width: 220px;margin-bottom: 10px;">
              <el-option v-for="vin in vins" :key="vin" :label="vin" :value="vin"></el-option>
            </el-select>
          </div>
          <el-date-picker
            v-if="selectedDimension !== '充电日期'"
            v-model="filterValues.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </div>
        <div v-if="filterType === '车型'" style="margin:10px 0;">
          <div>
            <el-select v-model="filterValues.model" placeholder="选择车型" multiple filterable style="width: 220px;margin-bottom: 10px;">
              <el-option v-for="model in models" :key="model" :label="model" :value="model"></el-option>
            </el-select>
          </div>
          <el-select v-if="selectedDimension !== '充电日期'" v-model="filterValues.quarter" placeholder="选择季度" style="margin-top:10px;width:200px;">
            <el-option label="第一季度" value="Q1"></el-option>
            <el-option label="第二季度" value="Q2"></el-option>
            <el-option label="第三季度" value="Q3"></el-option>
            <el-option label="第四季度" value="Q4"></el-option>
          </el-select>
        </div>
        <div v-if="viewName === 'Charge'" style="margin:10px 0;">
          <el-select v-model="filterValues.model" placeholder="充电开始时间戳" multiple filterable style="width: 220px;margin-bottom: 10px;">
            <el-option v-for="model in models" :key="model" :label="model" :value="model"></el-option>
          </el-select>
          <el-select v-model="filterValues.model" placeholder="充电结束时间戳" multiple filterable style="width: 220px;margin-bottom: 10px;">
            <el-option v-for="model in models" :key="model" :label="model" :value="model"></el-option>
          </el-select>
        </div>
      </div>

      <!-- 步骤5：结果展示 -->
      <div v-if="step === 4">
        <h3>可视化结果展示</h3>
        <div ref="chart" style="width:100%;height:300px;margin-bottom:20px;"></div>
      </div>
    </div>

    <!-- 底部按钮区 -->
    <div class="footer-btns">
      <el-button v-if="step > 0" @click="prevStep">上一步</el-button>
      <el-button
        v-if="step < 4"
        type="primary"
        :disabled="!canNext"
        @click="nextStep"
      >{{ step === 3 ? '生成图形' : '下一步' }}</el-button>
      <el-button v-if="step === 4" @click="exportData">导出数据</el-button>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'StepFlow',
  props: {
    viewName: { type: String, required: true },
    indicators: { type: Array, required: true },
    charts: { type: Array, required: true },
    dimensions: { type: Array, required: true },
    vins: { type: Array, required: true },
    models: { type: Array, required: true },
    tableData: { type: Array, default: () => [] },
    indicatorPlaceholder: { type: String, default: '请选择分析指标' },
    stepTitles: { type: Array, default: () => ['选择分析指标', '选择可视化图形', '配置展示维度', '设置筛选条件', '结果展示'] }
  },
  data() {
    return {
      step: 0,
      selectedIndicator: '',
      selectedCharts: [],
      selectedDimension: '',
      filterType: '',
      filterValues: {
        vin: [],
        model: [],
        dateRange: [],
        quarter: ''
      },
      targetName: {
        'Charge': '充电',
        'Discharge': '放电',
        'Motionless': '静止',
        'Other': '其他'
      }
    }
  },
  computed: {
    canNext() {
      if (this.step === 0) return !!this.selectedIndicator
      if (this.step === 1) {
        if (this.selectedCharts.length === 0) return false;
        if (this.selectedCharts.length === 1 && (this.selectedCharts[0] === 'pie' || this.selectedCharts[0] === 'heatmap')) return true;
        if (this.selectedCharts.length <= 2 && !this.selectedCharts.includes('pie') && !this.selectedCharts.includes('heatmap')) return true;
        return false;
      }
      if (this.step === 2) return !!this.selectedDimension
      if (this.step === 3) return this.filterType === 'VIN' ? this.filterValues.vin.length > 0 && this.filterValues.dateRange.length === 2 : (this.filterType === '车型' ? this.filterValues.model.length > 0 && !!this.filterValues.quarter : false)
      return false
    }
  },
  methods: {
    nextStep() {
      if (this.step === 1 && (this.selectedCharts.includes('pie') || this.selectedCharts.includes('heatmap'))) {
        this.step = 3;
      } else if (this.step < 4) {
        this.step++;
      }
      if (this.step === 4) this.$nextTick(this.renderChart)
    },
    prevStep() {
      if (this.step > 0) this.step--
    },
    selectChart(type) {
      const isPieOrHeat = type === 'pie' || type === 'heatmap';
      if (isPieOrHeat) {
        if (this.selectedCharts.length === 1 && this.selectedCharts[0] === type) {
          this.selectedCharts = [];
        } else {
          this.selectedCharts = [type];
        }
      } else {
        if (this.selectedCharts.length === 1 && (this.selectedCharts[0] === 'pie' || this.selectedCharts[0] === 'heatmap')) {
          return;
        }
        if (this.selectedCharts.includes(type)) {
          this.selectedCharts = this.selectedCharts.filter(t => t !== type);
        } else {
          if (this.selectedCharts.length < 2) {
            this.selectedCharts.push(type);
          }
        }
      }
    },
    generateChart() {
      this.renderChart()
    },
    renderChart() {
      if (!this.$refs.chart) return
      const myChart = echarts.init(this.$refs.chart)
      // 示例：折线图
      myChart.setOption({
        title: { text: '示例折线图' },
        tooltip: {},
        toolbox: {
          show: true,
          feature: {
            saveAsImage: { show: true }
          }
        },
        xAxis: { data: ['1月', '2月'] },
        yAxis: {},
        series: [{
          name: '销售额',
          type: 'line',
          data: [120, 145]
        }]
      })
    },
    exportData() {
      // 导出数据逻辑
      this.$message('导出功能待实现')
    }
  },
  mounted() {
    if (this.step === 4) this.renderChart()
  }
}
</script>


<style scoped>
.charge-indicator-container {
  display: flex;
  flex-direction: column;
  min-height: 600px;
  padding: 0 20px;
  background: #fff;
  border-radius: 20px;
}
.steps-nav-horizontal {
  width: 100%;
  margin-bottom: 32px;
}
.content-area {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  min-height: 500px;
}
.footer-btns {
  background: #fff;
  padding: 16px 32px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.selected {
  border: 2px solid #409EFF;
}
.desc {
  color: #888;
  margin: 12px 0;
}
.el-card {
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  &.selected {
    border: 2px solid #409EFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  margin: 10px 5px;
}
.el-button--primary {
  background-color: #e53935 !important;
  border-color: #e53935 !important;
  color: #fff !important;
}
.el-button:hover, .el-button:focus {
  background-color: #fff;
  border-color: #d32f2f;
  color: #d32f2f;
}
</style>
