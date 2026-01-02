<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-left">
        <el-avatar class="avatar" size="large" icon="el-icon-user"></el-avatar>
        <div class="user-basic">
          <div class="nickname">{{ profileForm.nickname || '用户' }}</div>
          <div class="username">{{ profileForm.username }}</div>
        </div>
      </div>
      <div class="header-right">
        <el-tag :type="profileForm.roleId === 'ROLE_001' ? 'danger' : 'primary'">
          {{ getRoleName(profileForm.roleId) }}
        </el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="card">
          <div slot="header" class="card-title">个人信息</div>
          <div class="card-body">
            <el-form
              :model="profileForm"
              :rules="profileRules"
              ref="profileForm"
              label-width="90px"
              class="form"
            >
              <el-form-item label="账号名">
                <el-input v-model="profileForm.username" disabled></el-input>
              </el-form-item>
              <el-form-item label="用户名" prop="nickname">
                <el-input v-model="profileForm.nickname"></el-input>
              </el-form-item>
              <el-form-item label="角色">
                <el-input :value="getRoleName(profileForm.roleId)" disabled></el-input>
              </el-form-item>
              <el-form-item>
                <el-button class="block-btn" type="primary" @click="updateProfile">更新信息</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="card">
          <div slot="header" class="card-title">修改密码</div>
          <div class="card-body">
            <el-form
              :model="passwordForm"
              :rules="passwordRules"
              ref="passwordForm"
              label-width="100px"
              class="form"
            >
              <el-form-item label="当前密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmNewPassword">
                <el-input v-model="passwordForm.confirmNewPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item>
                <el-button class="block-btn" type="primary" @click="changePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { userApi } from '@/api/user'

export default {
  name: 'ProfilePage',
  data() {
    // 密码确认验证
    const validatePass = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    
    return {
      profileForm: { },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      profileRules: {
        nickname: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmNewPassword: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo'])
  },
  created() {
    this.loadProfile();
  },
  methods: {
    // 加载用户信息
    async loadProfile() {
      try {
        const userId = this.userInfo && (this.userInfo.userId || this.userInfo.id)
        if (!userId) {
          this.$message.error('用户ID缺失，无法获取个人信息')
          return
        }
        const res = await userApi.getInfo(userId)
        this.profileForm = res && res.data ? { ...res.data } : { ...res }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.$message.error('获取用户信息失败');
      }
    },
    
    // 更新个人信息
    async updateProfile() {
      try {
        await this.$refs.profileForm.validate();
        
        const res = await userApi.updateProfile(this.profileForm);
        if (res.code === 200) {
          this.$message.success('个人信息更新成功');
          // 更新store中的用户信息
          const updatedUserInfo = {
            ...this.$store.state.user.userInfo,
            nickname: this.profileForm.nickname
          };
          this.$store.commit('user/SET_USER_INFO', updatedUserInfo);
        } else {
          this.$message.error(res.message || '更新失败');
        }
      } catch (error) {
        console.error('更新个人信息失败:', error);
        this.$message.error('表单验证失败');
      }
    },
    
    // 修改密码
    async changePassword() {
      try {
        await this.$refs.passwordForm.validate();
        
        const data = {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        };
        
        const res = await userApi.changePassword(data);
        if (res.code === 200) {
          this.$message.success('密码修改成功');
          // 重置表单
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          };
        } else {
          this.$message.error(res.message || '密码修改失败');
        }
      } catch (error) {
        console.error('修改密码失败:', error);
        this.$message.error('表单验证失败');
      }
    },
    
    // 获取角色名称
    getRoleName(roleId) {
      switch (roleId) {
        case 'ROLE_001':
          return '超级管理员';
        case 'ROLE_002':
          return '信息管理员';
        default:
          return '普通用户';
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding: 16px 20px 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  background: #409EFF;
  color: #fff;
}
.user-basic {
  display: flex;
  flex-direction: column;
}
.nickname {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 22px;
}
.username {
  font-size: 13px;
  color: #909399;
  line-height: 18px;
}
.content-row {
  margin-top: 4px;
}
.card {
  border-radius: 8px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.card-body {
  max-width: 420px;
  margin: 0 auto;
}
.form :deep(.el-input),
.form :deep(.el-select) {
  width: 100%;
}
.block-btn {
  width: 100%;
}
@media (max-width: 768px) {
  .card-body {
    max-width: 100%;
  }
}
</style>
