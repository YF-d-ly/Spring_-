// 权限相关API
import service from './index'

export const permissionApi = {
  // 获取用户菜单权限
  getUserMenuPermissions(userId) {
    return service({
      url: `/permission/menu/${userId}`,
      method: 'get'
    })
  },
  // 设置用户菜单权限
  setUserMenuPermissions(data) {
    return service({
      url: '/permission/menu',
      method: 'post',
      data
    })
  },
  // 获取所有菜单
  getAllMenus() {
    return service({
      url: '/permission/menus',
      method: 'get'
    })
  }
}

