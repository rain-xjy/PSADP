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
        
        <!-- 指标展示菜单组 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><DataLine /></el-icon>
            <span>指标展示</span>
          </template>
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
          <el-menu-item index="/QuickQuery">
            <el-icon><Document /></el-icon>
            <span>数据看板</span>
          </el-menu-item>
          <el-menu-item index="/Download">
            <el-icon><Document /></el-icon>
            <span>数据下载</span>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 异常模块分析菜单组 -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Warning /></el-icon>
            <span>异常模块分析</span>
          </template>
          <el-menu-item index="/insulation">
            <el-icon><Document /></el-icon>
            <span>绝缘情况分析</span>
          </el-menu-item>
          <el-menu-item index="/voltage">
            <el-icon><Document /></el-icon>
            <span>过压欠压分析</span>
          </el-menu-item>
          <el-menu-item index="/temperature">
            <el-icon><Document /></el-icon>
            <span>温度分析</span>
          </el-menu-item>
          <el-menu-item index="/current">
            <el-icon><Document /></el-icon>
            <span>电流分析</span>
          </el-menu-item>
          <el-menu-item index="/resistance">
            <el-icon><Document /></el-icon>
            <span>直流内阻分析</span>
          </el-menu-item>
          <el-menu-item index="/throughput">
            <el-icon><Document /></el-icon>
            <span>吞吐量统计</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="general-calculation">
          <i class="el-icon-menu"></i>
          <span slot="title">数据筛选</span>
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
import { DataLine, Monitor, Document, Comment, Warning } from '@element-plus/icons-vue'
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
  margin-bottom: 1px ;
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

/* 子菜单样式 */
.el-sub-menu__title {
  height: 56px;
  line-height: 56px;
  margin: 4px 0;
}

.el-sub-menu__title:hover {
  background-color: #263445 !important;
}

.el-sub-menu.is-active .el-sub-menu__title {
  color: #409EFF !important;
}

.el-sub-menu .el-menu-item {
  min-width: 200px;
  background-color: #1f2d3d;
}

.el-sub-menu .el-menu-item:hover {
  background-color: #001528 !important;
}
</style>