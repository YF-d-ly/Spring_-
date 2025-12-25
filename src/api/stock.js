// 库存相关API
import service from './index'

export const stockApi = {
  // 获取出入库记录列表
  getStockLogList(params) {
    return service({
      url: '/stock/log/list',
      method: 'get',
      params
    })
  },
  // 添加入库记录
  addInbound(data) {
    return service({
      url: '/stock/inbound',
      method: 'post',
      data
    })
  },
  // 添加出库记录
  addOutbound(data) {
    return service({
      url: '/stock/outbound',
      method: 'post',
      data
    })
  },
  // 调货
  transferGoods(data) {
    return service({
      url: '/stock/transfer',
      method: 'post',
      data
    })
  }
}

