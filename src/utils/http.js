import axios from 'axios'
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'

// 创建loading状态管理对象
const loading = reactive({})

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // 从环境变量获取基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送前做一些处理
    // 例如：获取token并添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 设置loading状态
    const url = config.url
    loading[url] = true
    
    return config
  },
  error => {
    // 请求错误处理
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 获取响应数据
    const res = response.data
    
    // 清除loading状态
    const url = response.config.url
    loading[url] = false
    
    // 根据自定义状态码判断请求是否成功
    // 这里假设后端返回的数据格式为 { code: 200, data: {}, message: '' }
    if (res.code && res.code !== 200) {
      // 显示错误消息
      ElMessage.error(res.message || '请求失败')
      
      // 特定状态码处理，例如：401 未授权
      if (res.code === 401) {
        // 可以在这里处理登出逻辑
        localStorage.removeItem('token')
        // 跳转到登录页
        // router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      // 请求成功，返回数据
      return res.data || res
    }
  },
  error => {
    // 清除loading状态
    if (error.config && error.config.url) {
      loading[error.config.url] = false
    }
    
    // 处理HTTP错误状态
    let message = '请求失败'
    
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 可以在这里处理登出逻辑
          localStorage.removeItem('token')
          // router.push('/login')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址出错'
          break
        case 408:
          message = '请求超时'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 501:
          message = '服务未实现'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        case 505:
          message = 'HTTP版本不受支持'
          break
        default:
          message = `未知错误(${error.response.status})`
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '网络异常，请检查您的网络连接'
    } else {
      // 请求配置有误
      message = error.message
    }
    
    ElMessage.error(message)
    console.error('响应错误：', error)
    return Promise.reject(error)
  }
)

// 封装HTTP请求方法
const http = {
  /**
   * GET请求
   * @param {string} url - 请求地址
   * @param {object} params - 请求参数
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  get(url, params = {}, config = {}) {
    return service.get(url, { params, ...config })
  },
  
  /**
   * POST请求
   * @param {string} url - 请求地址
   * @param {object} data - 请求数据
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  post(url, data = {}, config = {}) {
    return service.post(url, data, config)
  },
  
  /**
   * PUT请求
   * @param {string} url - 请求地址
   * @param {object} data - 请求数据
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  put(url, data = {}, config = {}) {
    return service.put(url, data, config)
  },
  
  /**
   * DELETE请求
   * @param {string} url - 请求地址
   * @param {object} params - 请求参数
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  delete(url, params = {}, config = {}) {
    return service.delete(url, { params, ...config })
  },
  
  /**
   * 上传文件
   * @param {string} url - 上传地址
   * @param {FormData} formData - 表单数据
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  upload(url, formData, config = {}) {
    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }
}

// 导出http请求方法和loading状态
export default http
export { loading }