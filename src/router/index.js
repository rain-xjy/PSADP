import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/PSADP/Charge.vue')
    },
    // {
    //   path: '/',
    //   name: 'home',
    //   component: () => import('../views/Dashboard.vue')
    // },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/Chat.vue')
    },
    {
      path: '/data',
      name: 'data',
      component: () => import('../views/Data.vue')
    },
    {
      path: '/devices',
      name: 'devices',
      component: () => import('../views/Devices.vue')
    },
    {
      path: '/dataSet',
      name: 'dataSet',
      component: () => import('../views/dataSet.vue')
    },
    {
      path: '/Charge',
      name: 'Charge',
      component: () => import('../views/PSADP/Charge.vue')
    },
    {
      path: '/discharge',  
      name: 'discharge',
      component: () => import('../views/PSADP/Discharge.vue')
    },
    {
      path: '/Motionless',  
      name: 'Motionless',
      component: () => import('../views/PSADP/Motionless.vue')
    },
    {      
      path: '/Other',  
      name: 'Other',
      component: () => import('../views/PSADP/Other.vue')
    },
    {      
      path: '/QuickQuery',  
      name: 'QuickQuery',
      component: () => import('../views/PSADP/QuickQuery.vue')
    },
    {      
      path: '/Download',  
      name: 'Download',
      component: () => import('../views/PSADP/Download.vue')
    },
    
    // 异常模块分析路由
    {
      path: '/insulation',
      name: 'Insulation',
      component: () => import('../views/PSADP/Insulation.vue')
    },
    
    {
      path: '/voltage',
      name: 'Voltage',
      component: () => import('../views/PSADP/Voltage.vue')
    },
    {
      path: '/temperature',
      name: 'Temperature',
      component: () => import('../views/PSADP/Temperature.vue')
    },
    {
      path: '/current',
      name: 'Current',
      component: () => import('../views/PSADP/Current.vue')
    },
    {
      path: '/resistance',
      name: 'Resistance',
      component: () => import('../views/PSADP/Resistance.vue')
    },
    {
      path: '/throughput',
      name: 'Throughput',
      component: () => import('../views/PSADP/Throughput.vue')
    },
    {
      path: '/current-detail',
      name: 'CurrentDetail',
      component: () => import('../views/PSADP/CurrentDetail.vue')
    },
    {
      path: '/voltage-detail',
      name: 'VoltageDetail',
      component: () => import('../views/PSADP/VoltageDetail.vue')
    },
    {
      path: '/temperature-detail',
      name: 'TemperatureDetail',
      component: () => import('../views/PSADP/TemperatureDetail.vue')
    },
    {
      path: '/resistance-detail',
      name: 'ResistanceDetail',
      component: () => import('../views/PSADP/ResistanceDetail.vue')
    },
    {
      path: '/throughput-detail',
      name: 'ThroughputDetail',
      component: () => import('../views/PSADP/ThroughputDetail.vue')
    },
    {
      path: '/insulation-detail',
      name: 'InsulationDetail',
      component: () => import('../views/PSADP/InsulationDetail.vue')
    },
    {
      path: '/general-calculation',
      name: 'GeneralCalculation',
      component: () => import('../views/PSADP/GeneralCalculation.vue')
    },
  ]
})

export default router