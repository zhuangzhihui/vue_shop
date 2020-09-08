import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
// axios 请求拦截器添加token，保证拥有获取数据的权限（除了登录外的其它接口，均需要用户登录才有获取数据的权限）
axios.interceptors.request.use(config => {
  // 为请求头对象，添加Token验证的Authorization字段，字段的值为token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 固定写法  在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
