import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由懒加载 参照 vue-router 官网路由懒加载
// import Login from '../components/Login'
const Login = () => import(/* webpackChunkName: "Login_home_welcome" */ '../components/Login')
const Home = () => import(/* webpackChunkName: "Login_home_welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "Login_home_welcome" */ '../components/Welcome')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params')

const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/List')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/Add')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
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
