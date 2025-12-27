import service from './index'

export const categoryApi = {
    // 获取类别列表
    getCategoryNameList() {
        return service({
            url: '/category/names',
            method: 'get'
        })
    },

    getCategoryList() {
        return service({
            url: '/category/list',
            method: 'get'
        })
    }
}