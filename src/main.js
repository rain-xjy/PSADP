import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { zhCn } from 'element-plus/es/locale/index.mjs'
import 'element-plus/dist/index.css'
import './style/element-theme.css'
// import './style/style.css'


const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
