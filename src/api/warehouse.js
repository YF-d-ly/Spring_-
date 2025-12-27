// 仓库相关API
import service from './index'

export const warehouseApi = {
  // 获取仓库列表
  getWarehouseList() {
    return service({
      url: '/warehouse/names', // 修正接口路径
      method: 'get'
    })
  }
}