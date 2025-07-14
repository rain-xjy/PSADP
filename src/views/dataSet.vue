<template>
  <div class="dataset-container">
    <div class="dataset-header">
      <h3>数据集管理</h3>
    </div>
    
    <!-- 表格数据展示区域 -->
    <div class="table-container">
      <!-- 搜索和功能按钮区域 -->
      <div class="table-header">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="请输入要查询的问题或数据类型"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
        <div class="action-buttons">
          <el-button type="success" @click="handleAddDataSet">
            <el-icon><Plus /></el-icon>新建训练数据集
          </el-button>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <el-table :data="paginatedData" style="width: 100%" border>
        <!-- <el-table-column label="问题" width="120">
        </el-table-column> -->
        <el-table-column label="数据类型" width="120">
          <template #header>
            <div class="column-header">
              <span>数据类型</span>
              <el-dropdown @command="handleTypeFilter" trigger="click">
                <el-button type="primary" size="small" plain>
                  <el-icon><Filter /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="all">全部</el-dropdown-item>
                    <el-dropdown-item command="DDL">DDL</el-dropdown-item>
                    <el-dropdown-item command="SQL">SQL</el-dropdown-item>
                    <el-dropdown-item command="DOC">DOC</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag type="success" effect="plain" >{{ scope.row.dataType }}</el-tag>
          </template>
        </el-table-column>
        <!-- 根据数据类型显示不同内容 -->
        <el-table-column label="内容" min-width="200">
          <template #header>
            <div class="column-header">
              <span>内容</span>
              <el-input
                v-model="contentFilter"
                placeholder="搜索内容"
                size="small"
                style="width: 150px; margin-left: 10px;"
                clearable
                @input="handleContentFilter"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          <template #default="scope">
            <div v-if="scope.row.dataType === 'DDL'" class="table-cell-content sql-content">{{ scope.row.dataContent }}</div>
            <div v-else-if="scope.row.dataType === 'DOC'" class="table-cell-content">{{ scope.row.dataContent }}</div>
            <div v-else-if="scope.row.dataType === 'SQL'" class="table-cell-content">
              <div><strong>问题:</strong> {{ scope.row.question }}</div>
              <div class="sql-content"><strong>SQL:</strong> {{ scope.row.dataContent }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="handleEdit(scope.row, scope.$index)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTableData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 新增/编辑数据集对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑数据集' : '新增数据集'"
      width="60%"
      :show-close="true"
      center
    >
      <div class="dialog-form">
        <div class="form-item">
          <div class="form-label"><span style="color: red;">*</span>数据类型：</div>
          <el-select v-model="currentDataSet.dataType" placeholder="请选择数据类型">
            <el-option label="DDL" value="DDL" />
            <el-option label="SQL" value="SQL" />
            <el-option label="DOC" value="DOC" />
          </el-select>
          <div class="type-description">
            <template v-if="currentDataSet.dataType === 'DDL'">建表语句</template>
            <template v-else-if="currentDataSet.dataType === 'DOC'">文本内容</template>
            <template v-else-if="currentDataSet.dataType === 'SQL'">问答对</template>
          </div>
        </div>
        
        <!-- DDL类型表单 -->
        <template v-if="currentDataSet.dataType === 'DDL'">
          <div class="form-item">
            <div class="form-label"><span style="color: red;">*</span>DDL文本：</div>
            <el-input
              v-model="currentDataSet.dataContent"
              type="textarea"
              :rows="4"
              placeholder="请输入建表语句"
            />
          </div>
        </template>
        
        <!-- DOC类型表单 -->
        <template v-else-if="currentDataSet.dataType === 'DOC'">
          <div class="form-item">
            <div class="form-label"><span style="color: red;">*</span>文本内容：</div>
            <el-input
              v-model="currentDataSet.dataContent"
              type="textarea"
              :rows="4"
              placeholder="请输入文本内容"
            />
          </div>
        </template>
        
        <!-- SQL类型表单 -->
        <template v-else-if="currentDataSet.dataType === 'SQL'">
          <div class="form-item">
            <div class="form-label"><span style="color: red;">*</span>问题：</div>
            <el-input
              v-model="currentDataSet.question"
              type="input"
              placeholder="请输入问题"
            />
          </div>
          <div class="form-item">
            <div class="form-label"><span style="color: red;">*</span>SQL：</div>
            <el-input
              v-model="currentDataSet.dataContent"
              type="textarea"
              :rows="4"
              placeholder="请输入SQL语句"
            />
          </div>
        </template>
      </div>
      <div class="dialog-footer">
        <el-button class="save-btn" type="success" @click="saveDataSet">保存</el-button>
        <el-button class="cancel-btn" @click="dialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit, Delete, Filter } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'


// 搜索和筛选相关
const searchQuery = ref('')
const typeFilter = ref('all') // 数据类型筛选
const contentFilter = ref('') // 内容筛选

const handleSearch = () => {
  // 实现搜索功能
  console.log('搜索:', searchQuery.value)
  // 搜索后返回第一页
  currentPage.value = 1
}

// 处理数据类型筛选
const handleTypeFilter = (command) => {
  typeFilter.value = command
  console.log('数据类型筛选:', command)
  // 筛选后返回第一页
  currentPage.value = 1
}

// 处理内容筛选
const handleContentFilter = () => {
  console.log('内容筛选:', contentFilter.value)
  // 筛选后返回第一页
  currentPage.value = 1
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const handleSizeChange = (val) => {
  pageSize.value = val
  console.log('每页显示数量:', val)
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  console.log('当前页:', val)
}

// 表格数据
const tableData = ref([
  {
    id: 1,
    question: '查询所有用户信息',
    dataType: 'SQL',
    dataContent: 'SELECT * FROM users WHERE status = 1'
  },
  {
    id: 2,
    question: '',
    dataType: 'DDL',
    dataContent: 'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), created_at TIMESTAMP)'
  },
  {
    id: 3,
    question: '',
    dataType: 'DOC',
    dataContent: '这是一个关于订单数据的文本内容示例，描述了最近一周的订单情况。'
  }
])

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let result = tableData.value
  
  // 全局搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      // 根据数据类型搜索不同字段
      if (item.dataType.toLowerCase().includes(query)) {
        return true
      } else if (item.question && item.question.toLowerCase().includes(query)) {
        return true
      } else if (item.dataContent && item.dataContent.toLowerCase().includes(query)) {
        return true
      }
      return false
    })
  }
  
  // 数据类型筛选
  if (typeFilter.value !== 'all') {
    result = result.filter(item => item.dataType === typeFilter.value)
  }
  
  // 内容筛选
  if (contentFilter.value) {
    const query = contentFilter.value.toLowerCase()
    result = result.filter(item => {
      if (item.dataContent && item.dataContent.toLowerCase().includes(query)) {
        return true
      } else if (item.dataType === 'SQL' && item.question && item.question.toLowerCase().includes(query)) {
        return true
      }
      return false
    })
  }
  
  return result
})

// 分页后的表格数据
const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredTableData.value.slice(startIndex, endIndex)
})

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentDataSet = ref({
  id: '',
  milvusId: '',
  dataType: '',
  dataContent: '',
  question: '',
  dbType: ''
})
const currentIndex = ref(-1)

// 新增数据集
const handleAddDataSet = () => {
  isEdit.value = false
  currentDataSet.value = {
    id: '',
    milvusId: '',
    dataType: '',
    dataContent: '',
    question: '',
    dbType: ''
  }
  dialogVisible.value = true
}

// 编辑数据集
const handleEdit = (row, index) => {
  isEdit.value = true
  currentDataSet.value = JSON.parse(JSON.stringify(row))
  console.log('当前数据集:', currentDataSet.value)
  currentIndex.value = index
  dialogVisible.value = true
}

// 删除数据集
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除这条数据吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    console.log('当前数据集:', row)
    // tableData.value.splice(index, 1)
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
  }).catch(() => {
    // 取消删除
  })
}

// 保存数据集
const saveDataSet = () => {
  // 表单验证
  if (!currentDataSet.value.dataType) {
    ElMessage.error('请选择数据类型')
    return
  }
  
  // 根据不同数据类型进行验证
  if (currentDataSet.value.dataType === 'DDL') {
    if (!currentDataSet.value.dataContent) {
      ElMessage.error('请输入DDL文本')
      return
    }
  } else if (currentDataSet.value.dataType === 'DOC') {
    if (!currentDataSet.value.dataContent) {
      ElMessage.error('请输入文本内容')
      return
    }
  } else if (currentDataSet.value.dataType === 'SQL') {
    if (!currentDataSet.value.question) {
      ElMessage.error('请输入问题')
      return
    }
    if (!currentDataSet.value.dataContent) {
      ElMessage.error('请输入SQL语句')
      return
    }
  }
  
  if (isEdit.value) {
    // 编辑模式
    tableData.value[currentIndex.value] = JSON.parse(JSON.stringify(currentDataSet.value))
    ElMessage({
      type: 'success',
      message: '更新成功'
    })
  } else {
    // 新增模式
    tableData.value.push(JSON.parse(JSON.stringify(currentDataSet.value)))
    ElMessage({
      type: 'success',
      message: '添加成功'
    })
  }
  
  dialogVisible.value = false
}

// 生命周期钩子
onMounted(() => {
  // 可以在这里加载初始数据
  console.log('数据集管理页面已加载')
})
</script>

<style scoped>
.dataset-container {
  display: flex;
  flex-direction: column;
  /* height: 100%; */
  padding: 20px;
}

.dataset-header {
  margin-bottom: 20px;
}

.menu-bar {
  margin-bottom: 20px;
}

.dataset-menu {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.table-container {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.table-cell-content {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

.sql-content {
  font-family: monospace;
  max-height: 100px;
  overflow-y: auto;
}

.table-actions {
  display: flex;
  gap: 8px;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 表头筛选样式 */
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-header .el-dropdown {
  margin-left: 5px;
}

/* 对话框样式 */
.dialog-form {
  padding: 10px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  margin-bottom: 8px;
  font-weight: bold;
}

.type-description {
  margin-top: 5px;
  margin-bottom: 15px;
  color: #606266;
  font-size: 12px;
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>