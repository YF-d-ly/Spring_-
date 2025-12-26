// 货品相关API
import service from './index'

export const goodsApi = {
    // 获取货品列表（分页）
    getGoodsList(params) {
        return service({
            url: '/goods/page',  // 移除 /api 前缀，因为代理会自动添加
            method: 'get',
            params
        })
    },
    // 添加货品
    addGoods(data) {
        return service({
            url: '/goods/add',
            method: 'post',
            data
        })
    },
    // 更新货品
    updateGoods(data) {
        return service({
            url: '/goods/update',
            method: 'put',
            data
        })
    },
    // 删除货品
    deleteGoods(id) {
        return service({
            url: `/goods/delete/${id}`,
            method: 'delete'
        })
    }
}