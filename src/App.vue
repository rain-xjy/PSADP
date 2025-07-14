<template>
  <el-container>
    <el-aside width="200px">
      <div class="logo">PSADP</div>
      <el-menu
        router
        :default-active="$route.path"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF">
        <!-- <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/devices">
          <el-icon><Monitor /></el-icon>
          <span>设备管理</span>
        </el-menu-item>
        <el-menu-item index="/data">
          <el-icon><Document /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        <el-menu-item index="/chat">
          <el-icon><Comment /></el-icon>
          <span>AI对话</span>
        </el-menu-item>
        <el-menu-item index="/dataset">
          <el-icon><Document /></el-icon>
          <span>数据集管理</span>
        </el-menu-item> -->
          <el-menu-item index="/Charge">
            <el-icon><Document /></el-icon>
            <span>充电指标展示</span>
          </el-menu-item>
          <el-menu-item index="/Discharge">
            <el-icon><Document /></el-icon>
            <span>放电指标展示</span>
          </el-menu-item>
          <el-menu-item index="/Motionless">
            <el-icon><Document /></el-icon>
            <span>静止指标展示</span>
          </el-menu-item>
          <el-menu-item index="/Other">
            <el-icon><Document /></el-icon>
            <span>其他指标展示</span>
          </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>应用测试AppTest48</el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { DataLine, Monitor, Document, Comment } from '@element-plus/icons-vue'
</script>

<style>
.el-container {
  height: 100vh;
}
.el-header {
  color: black;
  line-height: 60px;
  font-size: 20px;
  display: flex;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  justify-content: flex-end;
}
.el-aside {
  background-color: #304156;
  transition: width 0.3s;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  background-color: #2b3649;
}
.el-menu {
  border-right: none;
}
.el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 4px 0;
}
.el-menu-item:hover {
  background-color: #263445 !important;
}
.el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #fff !important;
}
.el-menu-item .el-icon {
  margin-right: 10px;
  font-size: 18px;
}
</style>