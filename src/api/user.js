// 用户相关API
import service from './index'

export const userApi = {
  // 用户登录
  login(data) {
    return service({
      url: '/auth/login', // 修改为正确的登录接口路径
      method: 'post',
      data
    })
  },
  // 用户注册
  register(data) {
    return service({
      url: '/auth/register',
      method: 'post',
      data
    })
  },
  // 发送邮箱验证码（后端提供的 /code 接口）
  sendEmailCode(data) {
    // data: { email: string }
    return service({
      url: '/auth/code',
      method: 'post',
      params: data
    })
  },
  // 忘记密码：发送验证码（邮箱或手机号，后端可自行兼容）
  sendCaptcha(data) {
    return service({
      url: '/auth/send-captcha',
      method: 'post',
      data
    })
  },
  // 忘记密码：使用验证码重置密码
  resetPasswordByCaptcha(data) {
    return service({
      url: '/auth/reset-password',
      method: 'post',
      data
    })
  },
  // 获取用户列表
  getUserList(params) {
    return service({
      url: '/user/list',
      method: 'get',
      params
    })
  },
  // 获取用户名列表
  getUserNameList() {
    return service({
      url: '/user/names',
      method: 'get'
    })
  },

  // 添加用户
  addUser(data) {
    return service({
      url: '/user/add',
      method: 'post',
      data
    })
  },
  // 更新用户
  updateUser(data) {
    return service({
      url: '/user/update',
      method: 'put',
      data
    })
  },
  // 删除用户
  deleteUser(id) {
    return service({
      url: `/user/delete/${id}`,
      method: 'delete'
    })
  },
  // 重置密码
  resetPassword(id) {
    return service({
      url: `/user/reset-password/${id}`,
      method: 'post'
    })
  },
  // 修改密码
  changePassword(data) {
    return service({
      url: '/user/change-password',
      method: 'post',
      data
    })
  },
  // 更新个人信息
  updateProfile(data) {
    return service({
      url: '/user/profile',
      method: 'put',
      data
    })
  },
  // 获取个人信息
  getInfo(id) {
    return service({
      url: `/user/${id}`,
      method: 'get'
    })
  },
  // 获取用户权限
  getUserPermissions(userId) {
    return service({
      url: `/permission/user/${userId}`,
      method: 'get'
    })
  }
}
