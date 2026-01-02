// 权限相关API
import service from './index'

export const permissionApi = {
  // 获取用户菜单权限
  getUserMenuPermissions(userId) {
    return service({
      url: `/permission/user-menus/${userId}`,
      method: 'get'
    })
  },
  // 设置用户菜单权限
  setUserMenuPermissions(data) {
    return service({
      url: '/permission/assign-menu',
      method: 'post',
      data
    })
  },
  // 获取所有菜单
  getAllMenus() {
    return service({
      url: '/permission//all-menus',
      method: 'get'
    })
  },
  // 获取用户仓库权限
  getUserWarehousePermissions(userId) {
    return service({
      url: `/permission/user-warehouses/${userId}`,
      method: 'get'
    })
  },
  // 设置用户仓库权限
  setUserWarehousePermissions(data) {
    return service({
      url: '/permission/assign-warehouse',
      method: 'post',
      data
    })
  },

  // 角色的菜单权限
  getRoleMenuPermissions(roleId) {
    return service({
      url: `/permission/role-menus/${roleId}`,
      method: 'get'
    })
  },
  // 设置角色菜单权限
  setRoleMenuPermissions(data) {
    return service({
      url: '/permission/assign-role-menu',
      method: 'post',
      data
    })
  },
  // 获取所有角色
  getRoleList() {
    return service({
      url: '/permission/roles',
      method: 'get'
    })

  }
  ,
  // 获取角色仓库权限
  getRoleWarehousePermissions(roleId) {
    return service({
      url: `/permission/role-warehouses/${roleId}`,
      method: 'get'
    })
  },
  // 获取角色权限
  getRolePermissions(roleId) {
    return service({
      url: `/permission/role-permissions/${roleId}`,
    })
  }
}