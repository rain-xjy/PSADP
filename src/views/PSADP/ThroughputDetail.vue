<template>
  <div class="temperature-detail-container">
    <h2>吞吐量详情</h2>
    <el-row gutter="24">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <span>最大电流倍率统计</span>
          </template>
          <div class="desc-box">
            <div>截止查询日期XX，累积纯电吞吐量为XXX</div>
            <div>平均每日纯电吞吐量：XX</div>
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


const barCategories = ['[0,1)', '[1,2)', '[2,3)', '[3,4)', '[4,5)', '[5,6)', '[6,7)'];
const lineData = [2, 10, 25, 45, 55, 60, 61]; // 累计

onMounted(() => {

  // 柱折图
  if (rateStatChart.value) {
    const chart = echarts.init(rateStatChart.value);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['累计占比'] },
      xAxis: { type: 'category', data: barCategories },
      yAxis: [
        { type: 'value', name: '累计占比(%)', max: 100 }
      ],
      series: [
        {
          name: '累计占比',
          type: 'line',
          data: lineData,
          yAxisIndex: 0,
          smooth: true,
          itemStyle: { color: '#67C23A' }
        }
      ]
    });
  }
});
</script>

<style scoped lang="scss">
.temperature-detail-container {
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