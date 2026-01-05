// 报表相关API
import service from './index'

export const reportApi = {
  // 获取企业统计报表
  getGoodsTop10(params) {
    return service({
      url: '/report/goods-top10',
      method: 'get',
      params
    })
  },

  // 获取仓库中货品Top10排行
  getWarehouseGoodsTop10(warehouseId) {
    return service({
      url: `/report/warehouse/${warehouseId}/goods-top10`,
      method: 'get',
    })
  },

  // 获取仓库每日货品进出情况
  getWarehouseDailyTrend(params) {
    return service({
      url: '/report/warehouse/daily-trend',
      method: 'get',
      params
    })
  },

  // 获取企业整体每日进出趋势
  getCompanyDailyTrend(params) {
    return service({
      url: '/report/company-daily-trend',
      method: 'get',
      params
    })
  }

}
