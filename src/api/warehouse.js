// 仓库相关API
import service from './index'

export const warehouseApi = {
  // 获取仓库列表
  getWarehouseList(params) {
    return service({
      url: '/warehouse/list',
      method: 'get',
      params
    })
  },
  // 添加仓库
  addWarehouse(data) {
    return service({
      url: '/warehouse/add',
      method: 'post',
      data
    })
  },
  // 更新仓库
  updateWarehouse(data) {
    return service({
      url: '/warehouse/update',
      method: 'put',
      data
    })
  },
  // 删除仓库
  deleteWarehouse(id) {
    return service({
      url: `/warehouse/delete/${id}`,
      method: 'delete'
    })
  },
  // 获取用户仓库权限
  getUserWarehousePermissions(userId) {
    return service({
      url: `/warehouse/user-permissions/${userId}`,
      method: 'get'
    })
  },
  // 设置用户仓库权限
  setUserWarehousePermissions(data) {
    return service({
      url: '/warehouse/user-permissions',
      method: 'post',
      data
    })
  }
}

