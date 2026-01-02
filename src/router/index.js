// src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/views/login/Login.vue'
import LayoutPage from '@/views/layout/Layout.vue'
import store from '@/stores'

Vue.use(VueRouter)

// 全局拦截重复导航错误（避免 Uncaught runtime errors 遮罩）
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location, onResolve, onReject) {
    if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
    return originalReplace.call(this, location).catch(err => err)
}

const routes = [
    { path: '/login', component: LoginPage },
    {
        path: '/',
        component: LayoutPage,
        meta: { requiresAuth: true },
        redirect: '/dashboard',
        children: [
            { path: 'dashboard', component: () => import('@/views/dashboard/Dashboard.vue') },
            { path: 'warehouse/list', component: () => import('@/views/warehouse/WarehouseList.vue') },
            { path: 'goods/list', component: () => import('@/views/goods/GoodList.vue') },
            { path: 'goods/category', component: () => import('@/views/goods/CategoryList.vue') },
            { path: 'stock/log', component: () => import('@/views/stock/StockLog.vue') },
            { path: 'stock/transfer', component: () => import('@/views/stock/TransferGoods.vue') },
            { path: 'report/enterprise', component: () => import('@/views/report/EnterpriseReport.vue') },
            { path: 'report/warehouse', component: () => import('@/views/report/WarehouseReport.vue'), meta: { adminOnly: true } },
            { path: 'system/user', component: () => import('@/views/system/UserList.vue'), meta: { superOnly: true } },
            { path: 'system/enterprise', component: () => import('@/views/system/EnterpriseInfo.vue') },
            { path: 'system/permission', component: () => import('@/views/system/Permission.vue'), meta: { superOnly: true } },
            { path: 'system/profile', component: () => import('@/views/system/Profile.vue') }
        ]
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const { token, menuTree, userInfo } = store.state.user
    const isSuperAdmin = store.getters['user/isSuperAdmin']
    const isAdmin = store.getters['user/isAdmin']

    // 页面刷新后，如果 Vuex 中的 menuTree 为空，但 localStorage 中的 userInfo 有菜单数据
    // 则重新生成菜单树，防止侧边栏消失
    if (token && (!menuTree || menuTree.length === 0) && userInfo && userInfo.menus) {
        store.dispatch('user/updateMenuTree', userInfo.menus)
    }

    // 如果访问登录页且已登录，重定向到仪表盘
    if (to.path === '/login' && token) {
        next('/')
        return
    }

    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if (to.meta.superOnly && !isSuperAdmin) {
        Vue.prototype.$message.warning('无权限访问')
        next(from.path || '/dashboard')
    } else if (to.meta.adminOnly && !isAdmin) {
        Vue.prototype.$message.warning('无权限访问')
        next(from.path || '/dashboard')
    } else {
        next()
    }
})

export default router
