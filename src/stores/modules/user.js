// 模拟用户数据
const state = {
  token: localStorage.getItem('token') || null,
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}') || {},
  menuTree: []
}

const getters = {
  isAuthenticated: state => !!state.token,
  userInfo: state => state.userInfo,
  menuTree: state => state.menuTree,
  isSuperAdmin: state => state.userInfo.role === 'super_admin',
  isAdmin: state => state.userInfo.role === 'super_admin' || state.userInfo.role === 'info_admin'
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  CLEAR_TOKEN(state) {
    state.token = null
    localStorage.removeItem('token')
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  SET_MENU_TREE(state, menuTree) {
    state.menuTree = menuTree
  }
}

const actions = {
  // 用户登录
  async login({ commit }, { username }) {
    // 模拟登录请求
    // 这里应该调用实际的API
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        // 模拟不同用户角色
        if (username === 'admin') {
          resolve({
            data: {
              token: `token_${username}_${Date.now()}`,
              user: {
                id: 1,
                username: username,
                nickname: '超级管理员',
                role: 'super_admin'
              }
            }
          })
        } else if (username === 'info') {
          resolve({
            data: {
              token: `token_${username}_${Date.now()}`,
              user: {
                id: 2,
                username: username,
                nickname: '信息管理员',
                role: 'info_admin'
              }
            }
          })
        } else {
          resolve({
            data: {
              token: `token_${username}_${Date.now()}`,
              user: {
                id: 3,
                username: username,
                nickname: username,
                role: 'normal_user'
              }
            }
          })
        }
      }, 500)
    })
    
    const { token, user } = response.data
    commit('SET_TOKEN', token)
    commit('SET_USER_INFO', user)
    return Promise.resolve(response.data)
  },
  
  // 用户登出
  logout({ commit }) {
    commit('CLEAR_TOKEN')
    commit('SET_USER_INFO', {})
    commit('SET_MENU_TREE', [])
  },
  
  // 获取用户信息
  async getUserInfo({ commit, state }) {
    if (!state.token) return
    
    // 模拟获取用户信息
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: state.userInfo
        })
      }, 300)
    })
    
    commit('SET_USER_INFO', response.data)
    return Promise.resolve(response.data)
  },
  
  // 更新用户菜单权限
  updateMenuTree({ commit, state }) {
    // 根据用户角色生成菜单树
    const baseMenus = [
      {
        id: 1,
        menu_name: '仪表盘',
        menu_path: '/dashboard',
        icon: 'el-icon-s-home'
      },
      {
        id: 2,
        menu_name: '仓库管理',
        menu_path: '/warehouse/list',
        icon: 'el-icon-warehouse',
        children: [
          { id: 21, menu_name: '仓库列表', menu_path: '/warehouse/list', icon: 'el-icon-list' }
        ]
      },
      {
        id: 3,
        menu_name: '货品管理',
        menu_path: '/goods/list',
        icon: 'el-icon-goods',
        children: [
          { id: 31, menu_name: '货品列表', menu_path: '/goods/list', icon: 'el-icon-list' },
          { id: 32, menu_name: '货品类别', menu_path: '/goods/category', icon: 'el-icon-menu' }
        ]
      },
      {
        id: 4,
        menu_name: '库存管理',
        menu_path: '/stock/log',
        icon: 'el-icon-takeaway-box',
        children: [
          { id: 41, menu_name: '库存日志', menu_path: '/stock/log', icon: 'el-icon-document' },
          { id: 42, menu_name: '调拨管理', menu_path: '/stock/transfer', icon: 'el-icon-position' }
        ]
      },
      {
        id: 5,
        menu_name: '统计报表',
        menu_path: '/report/enterprise',
        icon: 'el-icon-data-line',
        children: [
          { id: 51, menu_name: '企业统计', menu_path: '/report/enterprise', icon: 'el-icon-data-line' },
          { id: 52, menu_name: '仓库统计', menu_path: '/report/warehouse', icon: 'el-icon-data-line' }
        ]
      }
    ]
    
    // 如果是超级管理员，添加系统管理菜单
    if (state.userInfo.role === 'super_admin') {
      baseMenus.push({
        id: 6,
        menu_name: '系统管理',
        menu_path: '/system/user',
        icon: 'el-icon-setting',
        children: [
          { id: 61, menu_name: '用户管理', menu_path: '/system/user', icon: 'el-icon-user' },
          { id: 62, menu_name: '权限管理', menu_path: '/system/permission', icon: 'el-icon-key' },
          { id: 63, menu_name: '企业信息', menu_path: '/system/enterprise', icon: 'el-icon-office-building' }
        ]
      })
    } else {
      // 非超级管理员也显示企业信息
      baseMenus.push({
        id: 6,
        menu_name: '系统管理',
        menu_path: '/system/enterprise',
        icon: 'el-icon-setting',
        children: [
          { id: 63, menu_name: '企业信息', menu_path: '/system/enterprise', icon: 'el-icon-office-building' }
        ]
      })
    }
    
    commit('SET_MENU_TREE', baseMenus)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}