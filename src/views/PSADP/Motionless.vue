<template>
  <div class="charge-indicator-container">
    <StepFlow 
      :viewName="'Motionless'"
      :indicators="indicators"
      :charts="charts"
      :dimensions="dimensions"
      :vins="vins"
      :models="models"
      :tableData="tableData"
      :indicatorPlaceholder="indicatorPlaceholder"
      :stepTitles="stepTitles"
      @export="handleExport"
    />
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue'
import StepFlow from '@/components/StepFlow.vue'
import motionless from '@/assets/JSON/motionless.json'



// 分析指标数据
const indicators = [... new Set(motionless.target)]
// 可视化图形配置
const charts = ref([
  { type: 'line', name: '折线图', icon: '📈' },
  { type: 'bar', name: '柱状图', icon: '▃▃' },
  { type: 'boxplot', name: '盒须图', icon: '☐' },
  { type: 'scatter', name: '散点图', icon: '●●●' },
  { type: 'pie', name: '饼图', icon: '○' },
  { type: 'heatmap', name: '热力图', icon: '░▒▓█' }
])

// 展示维度数据
const dimensions = [... new Set(motionless.dimensions),... new Set(motionless.target)]

// VIN数据
const vins = ref([
  'VIN00123456789012345',
  'VIN00123456789012346',
  'VIN00123456789012347',
  'VIN00123456789012348',
  'VIN00123456789012349',
  'VIN00123456789012350'
])

// 车型数据
const models = ref([
  'Model S',
  'Model 3',
  'Model X',
  'Model Y',
  'Cybertruck',
  'Roadster'
])

// 表格数据
const tableData = ref([
  { date: '2024-01-01', sales: 120, growth: '15%' },
  { date: '2024-01-02', sales: 145, growth: '20%' },
  { date: '2024-01-03', sales: 132, growth: '12%' },
  { date: '2024-01-04', sales: 158, growth: '25%' },
  { date: '2024-01-05', sales: 167, growth: '30%' }
])

// 指标选择占位符
const indicatorPlaceholder = ref('请选择充电分析指标')

// 步骤标题
const stepTitles = ref([
  '选择充电分析指标',
  '选择可视化图形',
  '配置展示维度',
  '设置筛选条件',
  '结果展示'
])

// 处理导出事件
const handleExport = (data) => {
  console.log('导出数据:', data)
  alert('数据导出成功！')
}
</script>

<style scoped>

</style>
