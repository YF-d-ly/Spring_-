import service from './index'

export const categoryApi = {
    // 获取类别列表
    getCategoryList() {
        return service({
            url: '/category/names',
            method: 'get'
        })
    }
}