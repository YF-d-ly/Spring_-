<template>
  <div class="profile-page">
    <el-card>
      <div slot="header" class="clearfix">
        <span>个人信息管理</span>
      </div>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 个人信息标签页 -->
        <el-tab-pane label="个人信息" name="info">
          <el-form 
            :model="profileForm" 
            :rules="profileRules" 
            ref="profileForm" 
            label-width="120px"
            style="max-width: 600px; margin-top: 20px;"
          >
            <el-form-item label="账号名" prop="username">
              <el-input v-model="profileForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="角色">
              <el-tag :type="getRoleTagType(profileForm.role)">
                {{ getRoleName(profileForm.role) }}
              </el-tag>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存</el-button>
              <el-button @click="resetProfileForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 修改密码标签页 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form 
            :model="passwordForm" 
            :rules="passwordRules" 
            ref="passwordForm" 
            label-width="120px"
            style="max-width: 600px; margin-top: 20px;"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword">修改密码</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import { userApi } from '@/api/user'

export default {
  name: 'ProfilePage',
  data() {
    // 密码确认验证
    const validateConfirmPass = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    
    return {
      activeTab: 'info',
      profileForm: {
        username: '',
        nickname: '',
        role: ''
      },
      profileRules: {
        nickname: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPass, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo'])
  },
  created() {
    this.loadProfile()
  },
  methods: {
    // 加载个人信息
    loadProfile() {
      // 从store获取用户信息
      if (this.userInfo) {
        this.profileForm = {
          username: this.userInfo.username || '',
          nickname: this.userInfo.nickname || '',
          role: this.userInfo.role || ''
        }
      }
      
      // 实际项目中应该调用API
      // userApi.getProfile().then(res => {
      //   this.profileForm = res.data
      // })
    },
    
    // 保存个人信息
    async saveProfile() {
      try {
        await this.$refs.profileForm.validate()
        
        // 模拟API调用
        setTimeout(() => {
          // 更新store中的用户信息
          this.$store.commit('user/SET_USER_INFO', {
            ...this.userInfo,
            nickname: this.profileForm.nickname
          })
          this.$message.success('个人信息更新成功')
        }, 500)
        
        // 实际项目中应该调用API
        // await userApi.updateProfile(this.profileForm)
        // this.$message.success('个人信息更新成功')
        // this.loadProfile()
      } catch (error) {
        this.$message.error('表单验证失败')
      }
    },
    
    // 修改密码
    async changePassword() {
      try {
        await this.$refs.passwordForm.validate()
        
        // 模拟API调用
        setTimeout(() => {
          this.$message.success('密码修改成功，请重新登录')
          this.resetPasswordForm()
          // 可以选择退出登录
          // this.$store.dispatch('user/logout')
          // this.$router.push('/login')
        }, 500)
        
        // 实际项目中应该调用API
        // await userApi.changePassword({
        //   oldPassword: this.passwordForm.oldPassword,
        //   newPassword: this.passwordForm.newPassword
        // })
        // this.$message.success('密码修改成功，请重新登录')
        // this.resetPasswordForm()
      } catch (error) {
        this.$message.error('表单验证失败')
      }
    },
    
    // 重置个人信息表单
    resetProfileForm() {
      this.loadProfile()
      this.$nextTick(() => {
        if (this.$refs.profileForm) {
          this.$refs.profileForm.clearValidate()
        }
      })
    },
    
    // 重置密码表单
    resetPasswordForm() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      this.$nextTick(() => {
        if (this.$refs.passwordForm) {
          this.$refs.passwordForm.clearValidate()
        }
      })
    },
    
    // 获取角色名称
    getRoleName(role) {
      switch (role) {
        case 'super_admin':
          return '超级管理员'
        case 'info_admin':
          return '信息管理员'
        default:
          return '普通用户'
      }
    },
    
    // 获取角色标签类型
    getRoleTagType(role) {
      switch (role) {
        case 'super_admin':
          return 'danger'
        case 'info_admin':
          return 'primary'
        default:
          return 'info'
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding: 20px;
}
</style>

