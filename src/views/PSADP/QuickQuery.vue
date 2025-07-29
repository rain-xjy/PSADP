<template>
  <div class="insulation-container">
    <el-row>
      <!-- <el-col :span="8">
        <div class="search-container">
          <span style="margin-right: 10px;">行为类型: </span>
          <el-select
            v-model="filterValues.type"
            filterable
            placeholder="请行为类型"
            style="width: 240px;"
          >
            <el-option
                v-for="item in typeOptions"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :span="8">
        <span>分析指标：</span>
        <el-select v-model="filterValues.selectedIndicator" :disabled="!filterValues.type" placeholder="请选择分析指标" style="width: 240px;" filterable>
          <el-option v-for="item in indicators" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-col> -->
      <el-col :span="8">
        <span>VIN：</span>
        <el-input
          v-model="filterValues.vin"
          placeholder="请输入最多5个VIN号，用分号;隔开"
          clearable
          :disabled="filterValues.model.length !== 0"
          style="width: 240px;"
          @input="handleVinInput"
        ></el-input>
      </el-col>
      <el-col :span="8">
        <span>车型：</span>
        <el-select v-model="filterValues.model" :disabled="filterValues.vin !== ''" placeholder="选择车型" multiple collapse-tags filterable clearable style="width: 220px;">
          <el-option v-for="model in models" :key="model" :label="model" :value="model"></el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
        <div class="select-con">
          <span>日期：</span>
          <el-date-picker
            style="width: 260px;"
            v-model="filterValues.dateRange"
            type="daterange"
            :default-value="[new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]"
            :shortcuts="shortcuts"
            :disabledDate="disabledDate"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </div>
      </el-col>
    </el-row>
    <!-- <el-row>
    </el-row> -->
    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <el-button style="margin-left: 20px;" type="primary" @click="handleSearch">查询</el-button>
      <el-button style="margin-left: 20px;" type="primary" @click="resetSearch">重置</el-button>
    </div>
    
    <div class="R">
      <div class="chart-wrapper">
        <div class="chart-item">
          <div class="chart-title">充电开始真实soc&充电结束真实soc</div>
          <div ref="heatmapChart" style="width:1200px;height:400px;margin-bottom:20px;"></div>
        </div>
      </div>
      <div class="chart-wrapper">
        <div class="chart-item">
          <div class="chart-title">充电类型（快慢充占比）</div>
          <div ref="chargeTypeChart" style="width:560px;height:400px;"></div>
        </div>
        <div class="chart-item">
          <div class="chart-title">是否充满（满充占比）</div>
          <div ref="fullChargeChart" style="width:560px;height:400px;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import charge from '@/assets/JSON/charge.json'

export default {
  name: 'QuickQuery',
  data() {
    return {
      indicators: [],
      filterValues: {
        model: '',
        vin: '',
        dateRange: []
      },
      models: ['车型1','车型2','车型3'],
      typeOptions: ['充电指标','放电指标','静止指标','其他指标'],
      heatmapInstance: null,
      chargeTypeInstance: null,
      fullChargeInstance: null,
      shortcuts: [
        {
          text: '最近一周',
          value: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]
        },
        {
          text: '最近30天',
          value: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]
        },
        {
          text: '最近90天',
          value: [new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()]
        },
        {
          text: '最近半年',
          value: [new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date()]
        },
        {
          text: '最近一年',
          value: [new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()]
        }
      ]
    };
  },
  mounted() {
    this.indicators = [... new Set(charge.target)]
    this.initCharts();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    disabledDate(date) {
      const today = new Date();
      const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      return date > today || date < oneYearAgo;
    },
    handleVinInput(value) {
      const vins = value.split(';').filter(v => v.trim() !== '');
      if (vins.length > 5) {
        ElMessage.warning('最多输入5个VIN号');
        this.filterValues.vin = vins.slice(0, 5).join(';');
      }
    },
    resetSearch() {
      this.filterValues = {
        selectedIndicator: '',
        vin: '',
        dateRange: []
      };
      this.initCharts();
    },
    handleSearch() {
      // if (!this.filterValues.selectedIndicator) {
      //   ElMessage.warning('请选择分析指标');
      //   return;
      // }
      if (!this.filterValues.dateRange || this.filterValues.dateRange.length !== 2) {
        ElMessage.warning('请选择日期范围');
        return;
      }
      const mockData = this.getMockData();
      this.updateCharts(mockData);
    },
    initCharts() {
      this.heatmapInstance = echarts.init(this.$refs.heatmapChart);
      this.heatmapInstance.setOption({
        title: { text: '暂无数据', textStyle: { color: '#999', fontSize: 14 }, left: 'center', top: 'center' },
        grid: { top: 40, right: 20, bottom: 40, left: 50 }
      });

      this.chargeTypeInstance = echarts.init(this.$refs.chargeTypeChart);
      this.chargeTypeInstance.setOption({
        title: { text: '暂无数据', textStyle: { color: '#999', fontSize: 14 }, left: 'center', top: 'center' },
        grid: { top: 40, right: 20, bottom: 40, left: 50 }
      });

      this.fullChargeInstance = echarts.init(this.$refs.fullChargeChart);
      this.fullChargeInstance.setOption({
        title: { text: '暂无数据', textStyle: { color: '#999', fontSize: 14 }, left: 'center', top: 'center' },
        grid: { top: 40, right: 20, bottom: 40, left: 50 }
      });
    },
    updateCharts(data) {
      const hours = [
        '12a', '1a', '2a', '3a', '4a', '5a', '6a',
        '7a', '8a', '9a', '10a', '11a',
        '12p', '1p', '2p', '3p', '4p', '5p',
        '6p', '7p', '8p', '9p', '10p', '11p'
      ];
      const days = [
        'Saturday', 'Friday', 'Thursday',
        'Wednesday', 'Tuesday', 'Monday', 'Sunday'
      ];
      const dataList = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]]
        .map(function (item) {
        return [item[1], item[0], item[2] || '-'];
    });
    const option = {
        title: { show: false },
        tooltip: {
        position: 'top'
        },
        grid: {
        height: '50%',
        top: '10%'
        },
        xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
            show: true
        }
        },
        yAxis: {
        type: 'category',
        data: days,
        splitArea: {
            show: true
        }
        },
        visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
        },
        toolbox: {
        show: true,
        feature: {
            saveAsImage: { show: true },
            dataView: { show: true, readOnly: false }
        }
        },
        series: [
        {
            name: 'Punch Card',
            type: 'heatmap',
            data: dataList,
            label: {
            show: true
            },
            emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
            }
        }
        ]
    };

    this.heatmapInstance.setOption(option);

    const pieOption = {
          title: {
            show: false
          },  
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} <br/>占比 : {d}%'
          },
          legend: {
            top: '5%',
            left: 'center'
          },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 40,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 1048, name: '快充' },
                { value: 735, name: '慢充' }
              ]
            }
          ]
    }
    this.chargeTypeInstance.setOption(pieOption);
    const barOption = {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            dataZoom: {
              yAxisIndex: false
            },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['Evaporation', 'Precipitation', 'Temperature']
        },
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '数量',
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              formatter: '{value} ml'
            }
          },
          {
            type: 'value',
            name: '充满占比(%)',
            min: 0,
            max: 25,
            interval: 5,
            axisLabel: {
              formatter: '{value} %'
            }
          }
        ],
        series: [
          {
            name: '充满',
            type: 'bar',
            data: [
              2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
            ]
          },
          {
            name: '未充满',
            type: 'bar',
            data: [
              2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
            ]
          },
          {
            name: '充满占比',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' %';
              }
            },
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
          }
        ]
      };
    this.fullChargeInstance.setOption(barOption);
    },
    getMockData() {
      return {
        heatmap: {},
        chargeType: {},
        fullCharge: {}
      };
    },
    handleResize() {
      this.heatmapInstance?.resize();
      this.chargeTypeInstance?.resize();
      this.fullChargeInstance?.resize();
    }
  }
};
</script>

<style scoped lang="scss">
.insulation-container {
  padding: 20px;

  .chart-container {
    margin-top: 20px;
  }

  .chart-wrapper {
    display: flex;
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    .chart-item { 
        padding: 20px;
        border-radius: 20px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    }
    .chart-item  + .chart-item {
        margin-left: 20px;
    }
  }

  .chart-title {
    font-size: 16px;
    color: #303133;
    margin-bottom: 20px;
    font-weight: 500;
  }
}


.el-row + .el-row { margin-top: 20px; }
</style>