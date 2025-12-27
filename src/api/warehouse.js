// 仓库相关API
import service from './index'

export const warehouseApi = {
  // 获取仓库列表
  getWarehouseList() {
    return service({
      url: '/warehouse/names',
      method: 'get'
    })
  },
  // 获取仓库列表（分页）
  getWarehousePage(params) {
    return service({
      url: '/warehouse/Page',
      method: 'get',
      params
    })
  },
  // 删除仓库
  deleteWarehouse(id) {
    return service({
      url: '/warehouse/' + id,
      method: 'delete'
    })
  },
  // 添加仓库
  addWarehouse(data) {
    return service({
      url: '/warehouse',
      method: 'post',
      data
    })
  },

}

