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
  },
  // 获取用户仓库权限
  getUserWarehousePermissions(userId) {
    return service({
      url: `/permission/warehouse/${userId}`,
      method: 'get'
    })
  },
  // 设置用户仓库权限
  setUserWarehousePermissions(data) {
    return service({
      url: '/permission/warehouse',
      method: 'post',
      data
    })
  }
}