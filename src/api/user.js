// 用户相关API
import service from './index'

export const userApi = {
  // 获取用户列表
  getUserList(params) {
    return service({
      url: '/user/list',
      method: 'get',
      params
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
  getProfile() {
    return service({
      url: '/user/profile',
      method: 'get'
    })
  }
}

