import service from './index'

export const companyApi = {

    getCompanyInfo() {
        return service({
            url: '/company/info',
            method: 'get'
        })
    },

    updateCompanyInfo(data) {
        return service({
            url: '/company/update',
            method: 'put',
            data
        })
    }
}