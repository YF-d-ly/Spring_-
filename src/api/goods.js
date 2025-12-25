// 货品相关API
import service from './index'

export const goodsApi = {
    // 获取货品列表
    getGoodsList(params) {
        return service({
            url: '/goods/list',
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
    },
    // 获取货品类别列表
    getCategoryList() {
        return service({
            url: '/goods/category/list',
            method: 'get'
        })
    },
    // 添加货品类别
    addCategory(data) {
        return service({
            url: '/goods/category/add',
            method: 'post',
            data
        })
    },
    // 更新货品类别
    updateCategory(data) {
        return service({
            url: '/goods/category/update',
            method: 'put',
            data
        })
    },
    // 删除货品类别
    deleteCategory(id) {
        return service({
            url: `/goods/category/delete/${id}`,
            method: 'delete'
        })
    },
    // 上传图片
    uploadImage(file) {
        const formData = new FormData()
        formData.append('file', file)
        return service({
            url: '/goods/upload',
            method: 'post',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}

