<template>
  <div class="insulation-container">
    <el-row>
      <el-col :span="8">
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
        <el-select v-model="filterValues.selectedIndicator" :disabled="!filterValues.type" multiple collapse-tags  placeholder="请选择分析指标" style="width: 240px;" filterable>
          <el-option v-for="item in indicators" :key="item" :label="item" :value="item"></el-option>
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
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </div>
      </el-col>
    </el-row>
    <el-row > 
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
    <el-row>
      <el-form-item label="表达式: " >
        <div style="display: flex;" >
            <el-select
                class="expression-select"
                :disabled="!filterValues.type"
                v-model="filterValues.expression.value1"
                placeholder="信息项"
                style="width: 200px;"
                filterable
                >
                <el-option v-for="item in indicators" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <el-select
                class="expression-select"
                :disabled="!filterValues.type"
                v-model="filterValues.expression.value2"
                placeholder="操作符"
                style="width: 120px;"
                filterable
                >
                <el-option v-for="item in operatorOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <el-input v-model="filterValues.expression.value3" placeholder="值" class="expression-input" :disabled="!filterValues.type"></el-input>
            <el-select
                class="expression-select"
                :disabled="!filterValues.type"
                v-model="filterValues.expression.value4"
                placeholder="关系"
                style="width: 120px;"
                filterable
                >
                <el-option v-for="item in relationalOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
        </div>
        <div v-show="filterValues.expression.value4 != 'null'" style="display: flex;margin-top: 10px;">
            <el-select
                class="expression-select"
                :disabled="!filterValues.type"
                v-model="filterValues.expression.value5"
                placeholder="信息项"
                style="width: 200px;"
                filterable
                >
                <el-option v-for="item in indicators" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <el-select
                class="expression-select"
                :disabled="!filterValues.type"
                v-model="filterValues.expression.value6"
                placeholder="操作符"
                style="width: 120px;"
                filterable
                >
                <el-option v-for="item in operatorOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <el-input v-model="filterValues.expression.value7" placeholder="值"  class="expression-input" :disabled="!filterValues.type"></el-input>
            <div class="tips"><span style="color: red;">*</span> 阈值单位和计算指标单位保持一致</div>
        </div>
      </el-form-item>
    </el-row>
    
    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <el-button style="margin-left: 20px;" type="primary" @click="handleSearch">查询</el-button>
      <el-button style="margin-left: 20px;" type="primary" @click="handleReset">重置</el-button>
    </div>
    <div class="table-container">
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="date" label="日期"  />
            <el-table-column prop="device" label="指标" />
        </el-table>
    </div>
  </div>
</template>

<script>
import charge from '@/assets/JSON/charge.json'

export default {
  data() {
    return {
      filterValues: {
        type: '',
        // selectedIndicator:[],
        vin: '',
        model: [],
        dateRange: [],
        expression: {
            value1: '',
            value2: '>',
            value3: '',
            value4: '&&',
            value5: '',
            value6: '>',
            value7: ''
        }
      },
      models:['model1','model2','model3'],
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
      indicators: [],
      typeOptions: ['充电指标','放电指标','静止指标','其他指标'],
      tableData: [],
      operatorOptions: [ '>', '<', '>=', '<=','==','!='],
      relationalOptions: ['&&','||','null']
    }
    
  },
  mounted() {
    this.indicators = [... new Set(charge.target)]
  },
  methods: { 
    handleSearch() { 
    },
    handleReset() { 
    }
  }
}
</script>

<style scoped lang="scss">
.insulation-container {
  padding: 20px;
  .search-container {
    display: flex;
    align-items: center;
  }
  .search-button {
    display: flex;
    justify-content: center;
  }
}

h1 {
  margin-bottom: 20px;
  color: #303133;
}

.analysis-card {
  width: 100%;
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.expression-select {
  width: 200px;
}
.expression-input {
  width: 300px;

}
.expression-select, .expression-input {
  margin-right: 10px;
}

.tips {
  color: #909399;
  font-size: 12px;
}


.table-container {
  margin-top: 20px;
}

.el-row + .el-row {
  margin-top: 20px;
}


</style>