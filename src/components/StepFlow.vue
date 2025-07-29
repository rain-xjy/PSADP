<template>
  <div class="charge-indicator-container">
    <!-- 左侧步骤导航 -->
    <!-- <el-steps direction="horizontal" :active="step" class="steps-nav-horizontal">
      <el-step title="选择分析条件"></el-step>
      <el-step title="选择可视化图形"></el-step>
      <el-step title="结果展示"></el-step>
    </el-steps> -->

    <!-- 右侧内容区 -->
    <div class="content-area">
      <!-- 步骤1：选择分析条件（合并分析指标、统计维度、筛选条件） -->
        <el-row>
          <el-col :span="8">
            <span>分析指标：</span>
            <el-select v-model="filterValues.selectedIndicator" placeholder="请选择分析指标" filterable>
              <el-option v-for="item in indicators" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <span>统计维度：</span>
            <el-select v-model="filterValues.selectedDimension" clearable placeholder="请选择统计维度" filterable>
              <el-option v-for="dim in dimensions" :key="dim" :label="dim" :value="dim"></el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <div class="select-con" v-if="filterValues.selectedIndicator === '充电时长'">
              <span>季度：</span>
              <el-select v-model="filterValues.quarter" placeholder="选择季度" style="width:220px;">
                <el-option label="第一季度" value="Q1"></el-option>
                <el-option label="第二季度" value="Q2"></el-option>
                <el-option label="第三季度" value="Q3"></el-option>
                <el-option label="第四季度" value="Q4"></el-option>
              </el-select>
            </div>
            <div class="select-con" v-else>
              <span>日期：</span>
              <el-date-picker
                v-model="filterValues.dateRange"
                type="daterange"
                :default-value="[new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]"
                :shortcuts="shortcuts"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right">
              </el-date-picker>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <span>VIN：</span>
            <el-input
              :disabled="filterValues.model.length !== 0 || VinDisable"
              v-model="filterValues.vin"
              placeholder="请输入最多5个VIN号，用分号;隔开"
              clearable
              style="width: 220px;"
              @input="handleVinInput"
            ></el-input>
          </el-col>  
          <el-col :span="8">
            <span>车型：</span>
            <el-select v-model="filterValues.model" :disabled="filterValues.vin !== ''" placeholder="选择车型" multiple collapse-tags filterable clearable style="width: 220px;">
              <el-option v-for="model in models" :key="model" :label="model" :value="model"></el-option>
            </el-select>
          </el-col>
        </el-row>

      <!-- 步骤2：选择可视化图形 -->
      <div v-if="step === 1" class="chart-container">
        <div class="desc">当前指标支持以下图形（单选）</div>
        <el-row :gutter="20">
          <el-col v-for="chart in charts" :key="chart.type" :span="8">
            <el-card :class="{selected: selectedCharts === chart.type}" @click="selectChart(chart.type)">
              <div style="text-align:center;">
                <div>{{ chart.name }}</div>
                <div style="font-size:24px;">{{ chart.icon }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div v-if="selectedCharts === 'bar'" class="chart-option">
          <el-radio-group v-model="showBarLine">
            <el-radio :label="false">普通柱状图</el-radio>
            <el-radio :label="true">柱折图</el-radio>
          </el-radio-group>
        </div>
      </div>
      <!-- 步骤3：结果展示 -->
      <div v-if="step === 2" class="chart-container">
        <div ref="chart" style="width:100%;height:300px;margin-bottom:20px;"></div>
      </div>
    </div>

    <!-- 底部按钮区 -->
    <div class="footer-btns">
      <el-button v-if="step > 0" @click="prevStep">上一步</el-button>
      <el-button
        v-if="step < 2"
        type="primary"
        :disabled="!canNext"
        @click="nextStep"
      >{{ step === 1 ? '生成图形' : '下一步' }}</el-button>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { onBeforeMount } from 'vue';

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
      selectedCharts: '',
      showBarLine: false,
      VinDisable: false,
      filterValues: {
        selectedIndicator: '',
        selectedDimension: '',
        vin: '',
        model: [],
        dateRange: [],
        quarter: ''
      },
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
      ],
      targetName: {
        'Charge': '充电',
        'Discharge': '放电',
        'Motionless': '静止',
        'Other': '其他'
      },
      lineChart: {
        title: {
          text: 'Stacked Line'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
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
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Email',
            type: 'line',
            stack: 'Total',
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: 'Union Ads',
            type: 'line',
            stack: 'Total',
            data: [220, 182, 191, 234, 290, 330, 310]
          },
          {
            name: 'Video Ads',
            type: 'line',
            stack: 'Total',
            data: [150, 232, 201, 154, 190, 330, 410]
          },
          {
            name: 'Direct',
            type: 'line',
            stack: 'Total',
            data: [320, 332, 301, 334, 390, 330, 320]
          },
          {
            name: 'Search Engine',
            type: 'line',
            stack: 'Total',
            data: [820, 932, 901, 934, 1290, 1330, 1320]
          }
        ]
      },
      barChart: {
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
            name: 'Precipitation',
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              formatter: '{value} ml'
            }
          },
          {
            type: 'value',
            name: 'Temperature',
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
            name: 'Evaporation',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml';
              }
            },
            data: [
              2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
            ]
          },
          {
            name: 'Precipitation',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml';
              }
            },
            data: [
              2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
            ]
          },
          {
            name: 'Temperature',
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
      },
      PieChart: {
        title: { text: '示例饼图' },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: { show: true },
            dataView: { show: true, readOnly: false }
          }
        },
        series: [{
          name: '销售额',
          type: 'pie',
          radius: ['40%', '70%'],
          data: Array.from({length: 12}, (_, i) => ({ value: Math.round(100 + Math.random() * 100), name: `${i+1}月` }))
        }]
      }
      
    }
  },
  mounted () { 
    this.setDefaultDateRange()
  },
  computed: {
    canNext() {
      if (this.step === 0) {
        // 步骤1：只判断分析指标、统计维度和日期/季度
        if (!this.filterValues.selectedIndicator) return false;
        if (!this.filterValues.selectedDimension) return false;
        // 日期和季度有一个有值即可
        if (this.filterValues.dateRange.length === 0 && !this.filterValues.quarter) return false;
        return true;
      }
      if (this.step === 1) {
        return this.selectedCharts !== '';
      }
      return false;
    }
  },
  methods: {
    setDefaultDateRange(){
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      this.filterValues.dateRange = [start, end]
      console.log(this.filterValues.dateRange)
    },
    nextStep() {
      if (this.step === 1 && (this.selectedCharts.includes('pie') || this.selectedCharts.includes('heatmap'))) {
        this.step = 2;
      } else if (this.step < 2) {
        this.step++;
      }
      if (this.step === 2) this.$nextTick(this.renderChart)
    },
    prevStep() {
      if (this.step > 0) this.step--
    },
    selectChart(type) {
      if (this.selectedCharts === type) {
        this.selectedCharts = '';
      } else {
        this.selectedCharts = type;
      }
    },
    generateChart() {
      this.renderChart()
    },
    renderChart() {
      if (!this.$refs.chart) return
      const myChart = echarts.init(this.$refs.chart)
      if(this.selectedCharts === 'line') {
        myChart.setOption(this.lineChart)
      }
      else if(this.selectedCharts === 'bar') {
        let option = {
          title: { text: '示例柱状图' },
          tooltip: {},
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
          xAxis: { data: Array.from({length: 12}, (_, i) => `${i+1}月`) },
          yAxis: {},
          series: [
            {
              name: '销售额',
              type: 'bar',
              data: Array.from({length: 12}, () => Math.round(100 + Math.random() * 100))
            }
          ]
        };
        
        if (this.showBarLine) {
          option = this.barChart
        }
        
        myChart.setOption(option)
      }
      else if(this.selectedCharts === 'pie') { 
        myChart.setOption(this.PieChart)
      } else if(this.selectedCharts === 'heatmap') { 
        // prettier-ignore
        const hours = [
            '12a', '1a', '2a', '3a', '4a', '5a', '6a',
            '7a', '8a', '9a', '10a', '11a',
            '12p', '1p', '2p', '3p', '4p', '5p',
            '6p', '7p', '8p', '9p', '10p', '11p'
        ];
        // prettier-ignore
        const days = [
            'Saturday', 'Friday', 'Thursday',
            'Wednesday', 'Tuesday', 'Monday', 'Sunday'
        ];
        // prettier-ignore
        const data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]]
            .map(function (item) {
            return [item[1], item[0], item[2] || '-'];
        });
        const option = {
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
              data: data,
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
        myChart.setOption(option)
      } else if(this.selectedCharts.includes('boxplot')) { 
        const option = {
          title: [
            {
              text: '数据分布盒须图',
              left: 'center',
              top: 20
            }],
          dataset: [{
            source: [
              [850, 740, 900, 1070, 930, 850, 950, 980, 980, 880, 1000, 980, 930, 650, 760, 810, 1000, 1000, 960, 960],
              [960, 940, 960, 940, 880, 800, 850, 880, 900, 840, 830, 790, 810, 880, 880, 830, 800, 790, 760, 800],
              [880, 880, 880, 860, 720, 720, 620, 860, 970, 950, 880, 910, 850, 870, 840, 840, 850, 840, 840, 840],
              [890, 810, 810, 820, 800, 770, 760, 740, 750, 760, 910, 920, 890, 860, 880, 720, 840, 850, 850, 780],
              [890, 840, 780, 810, 760, 810, 790, 810, 820, 850, 870, 870, 810, 740, 810, 940, 950, 800, 810, 870]
            ]
          }, {
            transform: {
              type: 'boxplot',
              config: { 
                itemNameFormatter: function (params) {
                  return (params.value + 1);
                }
              }
            }
          }, {
            fromDatasetIndex: 1,
            fromTransformResult: 1
          }],
          tooltip: {
            trigger: 'item',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (params) {
              if (params.seriesType === 'boxplot') {
                return [
                  'sample ' + (params.dataIndex + 1) + '：',
                  '最大值：' + params.data[5].toFixed(2),
                  'Q1：' + params.data[4].toFixed(2),
                  '中位数：' + params.data[3].toFixed(2),
                  'Q3：' + params.data[2].toFixed(2),
                  '最小值：' + params.data[1].toFixed(2)
                ].join('<br/>');
              } else {
                return '异常值：' + params.value[1].toFixed(2);
              }
            }
          },
          grid: {
            left: '10%',
            right: '10%',
            bottom: '15%'
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            nameGap: 30,
            splitArea: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              formatter: 'sample {value}'
            }
          },
          yAxis: {
            type: 'value',
            name: '数值',
            splitArea: {
              show: true
            }
          },
          toolbox: {
            show: true,
            feature: {
              saveAsImage: { show: true },
              dataView: { show: true, readOnly: false }
            }
          },
          series: [{
            name: '盒须图',
            type: 'boxplot',
            datasetIndex: 1,
            itemStyle: {
              color: '#fff',
              borderWidth: 2,
              borderColor: '#409EFF'
            },
            emphasis: {
              itemStyle: {
                borderWidth: 3,
                borderColor: '#409EFF',
                shadowBlur: 5,
                shadowColor: 'rgba(0,0,0,0.2)'
              }
            }
          }, {
            name: '异常值',
            type: 'scatter',
            datasetIndex: 2,
            symbolSize: 6,
            itemStyle: {
              color: '#F56C6C'
            }
          }]
        };
        myChart.setOption(option)
      } else if(this.selectedCharts.includes('scatter')) { 
        // 电压最大最小值mock数据（30天）
        const voltageData = Array.from({length: 50}, (_, i) => {
          const day = i + 1;
          const date = `2024/04/${day.toString().padStart(2, '0')}`;
          // 随机生成最大电压在4.15~4.25，最小电压在3.05~3.15
          const max = +(5.00 + Math.random() * 1.5).toFixed(3);
          const min = +(3.00 + Math.random() * 1.5).toFixed(3);
          return { date, max, min };
        });
        const option = {
          title: { text: '电压最大/最小值散点图', left: 'center' },
          tooltip: {
            trigger: 'axis',
          },
          legend: { data: ['最大电压', '最小电压'], top: 30 },
          xAxis: {
            type: 'category',
            name: '日期',
            data: voltageData.map(d => d.date)
          },
          yAxis: {
            type: 'value',
            name: '电压 (V)'
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
              name: '最大电压',
              type: 'scatter',
              symbolSize: 6,
              data: voltageData.map(d => [d.date, d.max]),
              itemStyle: { color: '#409EFF' },
              markLine: {
                symbol: 'none',
                label: { position: 'end', color: 'red', fontWeight: 'bold' },
                lineStyle: { color: 'red', type: 'solid', width: 1 },
                data: [
                  { yAxis: 6.0, name: '过压阈值4.2V', label: { formatter: '过压6.0V' } },
                  { yAxis: 2.0, name: '欠压阈值3.0V', label: { formatter: '欠压2.0V' } }
                ]
              }
            },
            {
              name: '最小电压',
              type: 'scatter',
              symbolSize: 6,
              data: voltageData.map(d => [d.date, d.min]),
              itemStyle: { color: '#67C23A' }
            }
          ]
        }
        myChart.setOption(option)
      }
      
    },
    handleVinInput(val) {
      // 自动转大写
      let input = val.toUpperCase();
      // 只保留大写字母和数字和分号
      input = input.replace(/[^A-Z0-9;]/g, '');
      console.log(input);
      this.filterValues.vin = input;
      // 分割
      let vins = input.split(';').map(v => v.trim()).filter(v => v.length > 0);
      console.log(vins);
      // 去重
      vins = Array.from(new Set(vins));
      // 限制最多5个
      if (vins.length > 5) {
        vins = vins.slice(0, 5);
        this.VinDisable = true
        this.$message.warning('最多只能输入5个VIN号');
      }
      // // 拼接回去
      // this.filterValues.vin = vins.join(';');
    },

  },
  mounted() {
    if (this.step === 2) this.renderChart()
  }
}
</script>


<style scoped lang="scss">
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
}

.chart-container {
  background: #fff;
  padding: 30px 20px;
  border-radius: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.select-con {
  display: flex;
  gap: 12px;
  span {
    min-width: 60px;
  }
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


.el-row + .el-row {
  margin-top: 20px;
}
.el-select {
  width: 220px;
  margin-left: 10px;
}
</style>
