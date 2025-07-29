<template>
  <div class="insulation-container">
    <el-row>
      <el-col :span="8">
        <div class="search-container">
          <span style="margin-right: 10px;">任务名称: </span>
          <el-input placeholder="请输入任务名称" v-model="taskNameInput" style="width: 220px;" clearable @keyup.enter="handleSearch" />
        </div>
      </el-col>
      <el-col :span="6">
        <div class="search-container">
          <span style="margin-right: 10px;">指标: </span>
          <el-input placeholder="请输入指标" v-model="searchText" style="width: 220px;" clearable @keyup.enter="handleSearch" />
        </div>
      </el-col>
      <el-button style="margin-left: 20px;" type="primary" @click="handleSearch">搜索</el-button>
      <el-button style="margin-left: 20px;" type="primary" @click="dialogVisible = true">新增下载任务</el-button>
    </el-row>
    <!-- <div class="search-button">
      
    </div> -->

    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>下载任务列表</span>
        </div>
      </template>
      <div class="table-container">
        <el-table :data="tableData" style="width: 100%">
          
          <el-table-column prop="taskName" label="任务名称"  />
          <el-table-column prop="date" label="日期"  />
          <el-table-column prop="device" label="指标" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === '下载完成' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="操作">
            <template #default="scope">
              <el-button :disabled="scope.row.status !== '下载完成'" type="primary" size="mini" @click="goToDetail(scope.row)">下载详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
  <!-- 新增下载任务弹窗 -->
  <el-dialog title="新增下载任务" v-model="dialogVisible" width="40%">
    <el-form>
      <el-form-item label="行为类型">
        <el-select
          v-model="filterValues.selectedType"
          filterable
          placeholder="请选择指标"
          style="width: 240px;"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="指标">
        <el-select
          v-model="filterValues.selectedIndicators"
          multiple
          filterable
          placeholder="请选择指标"
          style="width: 240px;"
        >
          <el-option
            v-for="item in indicatorOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="VIN">
        <el-input
          :disabled="filterValues.model.length !== 0 || VinDisable"
          v-model="filterValues.vin"
          placeholder="请输入最多5个VIN号，用分号;隔开"
          clearable
          style="width: 240px;"
          @input="handleVinInput"
        ></el-input>
      </el-form-item>
      <el-form-item label="车型">
        <el-select v-model="filterValues.model" :disabled="filterValues.vin !== ''" placeholder="选择车型" multiple collapse-tags filterable clearable style="width: 240px;">
          <el-option v-for="model in models" :key="model" :label="model" :value="model"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="日期" style="width: 300px;">
          <el-date-picker
            v-model="filterValues.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          >
          </el-date-picker>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleStartAnalysis">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const searchText = ref('');
const taskNameInput = ref('');
const filteredData = ref([]);
const dialogVisible = ref(false);
const vinInput = ref('');
const indicatorOptions = ref([]);
const selectedIndicators = ref([]);

const filterValues = ref({
  selectedType: '',
  selectedIndicator: '',
  vin: '',
  model: [],
  dateRange: [],
})

const typeOptions = ref(['充电指标','放电指标','静止指标','其他指标'])

// 计算过滤后的数据
const filteredTableData = computed(() => {
  if (!searchText.value) {
    return tableData.value;
  }
  return tableData.value.filter(item => item.device.includes(searchText.value));
});

// 搜索事件处理
const handleSearch = () => {
  filteredData.value = filteredTableData.value;
};

const VinDisable = ref(false)
const handleVinInput = (val) => {
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
}

// 模拟表格数据
const tableData = ref([
  {
    taskName: '任务1',
    date: '2023-05-01',
    device: 'BAT-001',
    value: '2.5 MΩ',
    status: '下载完成'
  },
  {
    taskName: '任务2',
    date: '2023-05-02',
    device: 'BAT-002',
    value: '0.8 MΩ',
    status: '下载失败'
  },
  {
    taskName: '任务3',
    date: '2023-05-03',
    device: 'BAT-003',
    value: '3.2 MΩ',
    status: '下载完成'
  },
  {
    taskName: '任务4',
    date: '2023-05-03',
    device: 'BAT-003',
    value: '3.2 MΩ',
    status: '正在下载'
  }
]);

// 模拟VIN号与指标的映射
const vinToIndicators = {
  'VIN001': ['电流', '电压', '温度'],
  'VIN002': ['绝缘', '电流'],
  'VIN003': ['温度', '电压'],
};

const handleQueryIndicators = () => {
  indicatorOptions.value = vinToIndicators[vinInput.value] || [];
  selectedIndicators.value = [];
};

const handleStartAnalysis = () => {
  if (!vinInput.value || selectedIndicators.value.length === 0) {
    ElMessage.warning('请填写VIN号并选择指标');
    return;
  }
  // 这里可以发起下载任务请求
  console.log('开始下载', vinInput.value, selectedIndicators.value);
  dialogVisible.value = false;
  vinInput.value = '';
  indicatorOptions.value = [];
  selectedIndicators.value = [];
};

const router = useRouter();

// 跳转到详情页
const goToDetail = (row) => {
  router.push({
    name: 'VoltageDetail',
    query: {
      device: row.device,
      date: row.date
    }
  });
};
</script>

<style scoped lang="scss">
.insulation-container {
  padding: 20px;
  .search-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
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

.table-container {
  margin-top: 20px;
}


</style>