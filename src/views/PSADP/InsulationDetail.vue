<template>
  <div class="insulation-detail-container">
    <h2>绝缘情况分析详情</h2>
    <el-row gutter="24">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>每个充/放电段最大电流时序图</span>
          </template>
          <div class="desc-box">
            <div>散点图：每个充/放电段最大电流时序图</div>
          </div>
          <div class="chart-box" ref="maxCurrentChart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>最大电流倍率统计</span>
          </template>
          <div class="desc-box">
            <div>柱状图：最大电流倍率值对应分组的占比</div>
            <div>折线图：累积频率曲线</div>
            <div>横坐标为倍率分组，固定为（左包含）：[0,1)、[1,2)、[2,3)、[3,4)、[4,5)、[5,6)、[6,7)</div>
            <div>纵坐标1：C-rate分组占比</div>
            <div>纵坐标2：倍率累计占比</div>
          </div>
          <div class="chart-box" ref="rateStatChart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const maxCurrentChart = ref(null);
const rateStatChart = ref(null);

// 示例数据
const scatterData = [
  ['2024/4/1', 120], ['2024/4/7', 150], ['2024/4/15', 200], ['2024/5/1', 180], ['2024/5/10', 220],
  ['2024/5/20', 90], ['2024/6/1', 250], ['2024/6/10', 170], ['2024/6/20', 210], ['2024/7/1', 130]
];

const barCategories = ['[0,1)', '[1,2)', '[2,3)', '[3,4)', '[4,5)', '[5,6)', '[6,7)'];
const barData = [2, 8, 15, 20, 10, 5, 1];
const lineData = [2, 10, 25, 45, 55, 60, 61]; // 累计

onMounted(() => {
  // 散点图
  if (maxCurrentChart.value) {
    const chart = echarts.init(maxCurrentChart.value);
    chart.setOption({
      title: { text: '最大电流', left: 'center' },
      tooltip: { trigger: 'item', formatter: p => `时间: ${p.data[0]}<br/>电流: ${p.data[1]}A` },
      xAxis: { type: 'category', name: '时间/day', data: scatterData.map(d => d[0]) },
      yAxis: { type: 'value', name: 'Current/A' },
      series: [{
        symbolSize: 12,
        data: scatterData,
        type: 'scatter'
      }]
    });
  }

  // 柱折图
  if (rateStatChart.value) {
    const chart = echarts.init(rateStatChart.value);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['占比', '累计占比'] },
      xAxis: { type: 'category', data: barCategories },
      yAxis: [
        { type: 'value', name: '占比(%)' },
        { type: 'value', name: '累计占比(%)', max: 100 }
      ],
      series: [
        {
          name: '占比',
          type: 'bar',
          data: barData,
          yAxisIndex: 0,
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '累计占比',
          type: 'line',
          data: lineData,
          yAxisIndex: 1,
          smooth: true,
          itemStyle: { color: '#67C23A' }
        }
      ]
    });
  }
});
</script>

<style scoped lang="scss">
.insulation-detail-container {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
  h2 {
    margin-bottom: 24px;
    color: #303133;
    font-weight: 600;
  }
}
.chart-card {
  margin-bottom: 24px;
}
.chart-box {
  width: 100%;
  height: 340px;
  background: #f7f8fa;
  border-radius: 8px;
}
.desc-box {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.7;
}
</style>