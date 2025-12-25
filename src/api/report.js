// 报表相关API
import service from './index'

export const reportApi = {
  // 获取企业统计报表
  getEnterpriseReport(params) {
    return service({
      url: '/report/enterprise',
      method: 'get',
      params
    })
  },
  // 获取仓库统计报表
  getWarehouseReport(params) {
    return service({
      url: '/report/warehouse',
      method: 'get',
      params
    })
  }
}

