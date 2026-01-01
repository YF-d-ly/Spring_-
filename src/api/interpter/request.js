import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/stores/index'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // 基础路径，与vue.config.js中的代理配置对应
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = store.getters.token || localStorage.getItem('token')

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 添加请求时间戳，防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.parse(new Date()) / 1000
      }
    }

    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    Message.error(error.message || '请求发送失败')
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data

    // 如果后端有特殊的错误码定义，请根据实际调整
    if (res.code !== 200 && res.code !== 0) {
      // 未授权，跳转到登录页
      if (res.code === 401 || response.status === 401) {
        Message.error('登录已过期，请重新登录')

        // 清除本地存储的用户信息
        store.dispatch('user/logout')
        localStorage.removeItem('token')

        // 跳转到登录页
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)

        return Promise.reject(new Error(res.message || '登录已过期'))
      }
      // token过期
      else if (res.code === 403) {
        Message.error('权限不足')
        return Promise.reject(new Error(res.message || '权限不足'))
      }
      else {
        // 其他错误
        Message.error(res.message || '发生错误')
        return Promise.reject(new Error(res.message || '发生错误'))
      }
    }

    return res
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)

    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        // 未授权，跳转到登录页
        Message.error('登录已过期，请重新登录')

        // 清除本地存储的用户信息
        store.dispatch('user/logout')
        localStorage.removeItem('token')

        // 跳转到登录页
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      } else if (status === 403) {
        Message.error('权限不足')
      } else if (status === 404) {
        Message.error('请求地址不存在')
      } else if (status >= 500) {
        Message.error('服务器错误')
      } else {
        Message.error(error.response.data.message || '网络错误')
      }
    } else {
      Message.error('网络连接异常')
    }

    return Promise.reject(error)
  }
)

export default service