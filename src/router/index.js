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
    }
    
  ]
})

export default router