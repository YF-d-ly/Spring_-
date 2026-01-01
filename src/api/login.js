// 用户相关API
import service from './index'

export const LoginApi = {
    // 用户登录
    login(data) {
        return service({
            url: '/login/auth',
            method: 'post',
            data
        })
    },


}