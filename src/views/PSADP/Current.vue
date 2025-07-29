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
      <el-button style="margin-left: 20px;" type="primary" @click="dialogVisible = true">新增分析任务</el-button>
    </el-row>
    <!-- <div class="search-button">
      
    </div> -->

    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>电流分析</span>
        </div>
      </template>
      <div class="table-container">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="taskName" label="任务名称"  />
          <el-table-column prop="date" label="日期"  />
          <el-table-column prop="device" label="指标" />
          <el-table-column prop="value" label="绝缘值" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="操作">
            <template #default="scope">
              <el-button :disabled="scope.row.status !== '0'" type="primary" size="mini" @click="goToDetail(scope.row)">分析详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
  <!-- 新增分析任务弹窗 -->
  <el-dialog title="新增分析任务" v-model="dialogVisible" width="60%">
    <el-form>
      <el-form-item label="任务名称">
        <el-input v-model="taskName" placeholder="请输入任务名称" style="width: 240px;" />
      </el-form-item>
      <el-form-item label="VIN号">
        <el-input v-model="vinInput" placeholder="请输入VIN号" style="width: 240px;" />
      </el-form-item>
      <el-form-item label="日期" style="width: 260px;">
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            :default-value="[new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]"
            :shortcuts="shortcuts"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
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
const taskName = ref('');
const dateRange = ref([]);
const shortcuts =  [
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
const indicatorOptions = ref([]);
const selectedIndicators = ref([]);

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

// 模拟表格数据
const tableData = ref([
  {
    taskName: '任务1',
    date: '2023-05-01',
    device: 'BAT-001',
    value: '2.5 MΩ',
    status: '0'
  },
  {
    taskName: '任务2',
    date: '2023-05-02',
    device: 'BAT-002',
    value: '0.8 MΩ',
    status: '2'
  },
  {
    taskName: '任务3',
    date: '2023-05-03',
    device: 'BAT-003',
    value: '3.2 MΩ',
    status: '0'
  },
  {
    taskName: '任务4',
    date: '2023-05-03',
    device: 'BAT-003',
    value: '3.2 MΩ',
    status: '1'
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
  // 这里可以发起分析任务请求
  console.log('开始分析', vinInput.value, selectedIndicators.value);
  dialogVisible.value = false;
  vinInput.value = '';
  indicatorOptions.value = [];
  selectedIndicators.value = [];
};

const router = useRouter();

// 跳转到详情页
const goToDetail = (row) => {
  router.push({
    name: 'CurrentDetail',
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