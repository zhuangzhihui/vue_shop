import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/Login', component: Login },
  { path: '/Home', component: Home }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫，控制用户访问权限
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //    next() 两种形式 一种是 next()直接放行；另一种是 next('/login') 强制跳转
  if (to.path === '/login') return next() // 如果用户访问的是 login 登录页面，直接放行
  const tokenStr = window.sessionStorage.getItem('token') // 如果用户不是访问 login 登录页面，则先获取token判断是否登录
  if (!tokenStr) return next('/login') // 没有获取到 token，强制跳转到 login 登录页面
  next() // 成功获取到 token，直接放行
})

export default router
