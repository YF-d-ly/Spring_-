// 导入axios实例
import service from '@/api/interpter/request'

// 用户状态管理
const state = {
  token: localStorage.getItem('token') || null,
  userInfo: (() => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      return userInfoStr ? JSON.parse(userInfoStr) : {};
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return {};
    }
  })(),
  menuTree: [],
  warehousePermissions: [],
  menuPermissions: []
}

const getters = {
  isAuthenticated: state => !!state.token,
  userInfo: state => state.userInfo,
  menuTree: state => state.menuTree,
  isSuperAdmin: state => {
    // 添加安全检查，避免访问 undefined 对象的属性
    if (!state.userInfo || !state.userInfo.roleId) {
      return false;
    }
    return state.userInfo.roleId === 'ROLE_001';
  },
  isAdmin: state => {
    if (!state.userInfo || !state.userInfo.roleId) {
      return false;
    }
    return state.userInfo.roleId === 'ROLE_001' || state.userInfo.roleId === 'ROLE_002';
  },
  warehousePermissions: state => state.warehousePermissions,
  menuPermissions: state => state.menuPermissions
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
  },
  SET_WAREHOUSE_PERMISSIONS(state, warehousePermissions) {
    state.warehousePermissions = warehousePermissions
  },
  SET_MENU_PERMISSIONS(state, menuPermissions) {
    state.menuPermissions = menuPermissions
  }
}

const actions = {
  // 用户登录
  async login({ commit, dispatch }, { username, password }) {
    try {
      // 发送登录请求到后端
      const response = await service.post('/auth/login', {
        username,
        password
      });

      // 检查响应状态，使用可选链操作符确保安全访问
      // 注意：拦截器已经解包了response.data，所以这里的response直接就是后端返回的数据对象
      if (response.code === 200) {
        // 从响应数据中提取token和用户信息
        const token = response.data.token;
        const userInfo = {
          userId: response.data.userId,
          username: response.data.username,
          roleId: response.data.roleId,
          menus: response.data.menus,
          warehouses: response.data.warehouses
        };

        commit('SET_TOKEN', token);
        commit('SET_USER_INFO', userInfo);

        // 根据后端返回的菜单数据构建菜单树
        dispatch('updateMenuTree', response.data.menus);

        return Promise.resolve({
          token,
          user: userInfo
        });
      } else if (response.code === 401) {
        // 处理401状态码，提示用户未授权
        throw new Error('未授权，请检查账号密码');
      } else {
        // 处理其他状态码，提供默认错误消息
        const errorMessage = response.message || '登录失败';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 用户登出
  logout({ commit }) {
    commit('CLEAR_TOKEN')
    commit('SET_USER_INFO', {})
    commit('SET_MENU_TREE', [])
    commit('SET_WAREHOUSE_PERMISSIONS', [])
    commit('SET_MENU_PERMISSIONS', [])
  },

  // 获取用户信息
  async getUserInfo({ commit, state }) {
    if (!state.token) return

    // 实际获取用户信息的API调用
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

  // 获取用户权限
  async getUserPermissions({ commit, state }) {
    if (!state.token) return

    try {
      // 获取用户菜单权限
      const menuResponse = await service.get(`/permission/menu/${state.userInfo.userId}`);
      // 注意：拦截器已经解包了response.data，所以这里的menuResponse直接就是后端返回的数据对象
      // 如果后端返回的是 { code: 200, data: [...] }，那么 menuResponse.data 就是数据数组
      const menuPermissions = menuResponse.data || [];

      // 获取用户仓库权限
      const warehouseResponse = await service.get(`/permission/warehouse/${state.userInfo.userId}`);
      const warehousePermissions = warehouseResponse.data || [];

      commit('SET_MENU_PERMISSIONS', menuPermissions);
      commit('SET_WAREHOUSE_PERMISSIONS', warehousePermissions);

      return {
        menuPermissions,
        warehousePermissions
      };
    } catch (error) {
      console.error('获取用户权限失败:', error);
      return {
        menuPermissions: [],
        warehousePermissions: []
      };
    }
  },

  // 更新用户菜单权限 - 基于后端返回的权限列表动态生成菜单
  updateMenuTree({ commit }, menus) {
    // 将后端返回的扁平菜单数据转换为树形结构
    if (!menus || !Array.isArray(menus)) {
      commit('SET_MENU_TREE', []);
      return;
    }

    // 创建菜单映射表，便于查找
    const menuMap = {};
    const rootMenus = [];

    // 首先创建所有菜单项的映射
    menus.forEach(menu => {
      const convertedMenu = {
        id: menu.id,
        menu_name: menu.menuName,
        menu_path: menu.menuPath,
        icon: menu.icon ? `el-icon-${menu.icon}` : 'el-icon-menu',
        children: []
      };

      menuMap[menu.id] = convertedMenu;

      // 如果是根菜单（parentId为null），直接添加到根菜单数组
      if (!menu.parentId) {
        rootMenus.push(convertedMenu);
      }
    });

    // 将子菜单添加到对应的父菜单下
    menus.forEach(menu => {
      if (menu.parentId && menuMap[menu.parentId]) {
        // 将当前菜单添加到其父菜单的children数组中
        const convertedMenu = {
          id: menu.id,
          menu_name: menu.menuName,
          menu_path: menu.menuPath,
          icon: menu.icon ? `el-icon-${menu.icon}` : 'el-icon-menu'
        };
        menuMap[menu.parentId].children.push(convertedMenu);
      }
    });

    // 对每个根菜单的子菜单按排序顺序排序
    rootMenus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        menu.children.sort((a, b) => {
          // 从原始菜单数据中找到对应的排序值
          const menuA = menus.find(m => m.id === a.id);
          const menuB = menus.find(m => m.id === b.id);
          return (menuA ? menuA.sortOrder : 0) - (menuB ? menuB.sortOrder : 0);
        });
      }
    });

    // 按照排序顺序对根菜单排序
    rootMenus.sort((a, b) => {
      const menuA = menus.find(m => m.id === a.id);
      const menuB = menus.find(m => m.id === b.id);
      return (menuA ? menuA.sortOrder : 0) - (menuB ? menuB.sortOrder : 0);
    });

    commit('SET_MENU_TREE', rootMenus);
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}