<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <div slot="header" class="clearfix">
        <span>个人信息</span>
      </div>
      
      <el-form 
        :model="profileForm" 
        :rules="profileRules" 
        ref="profileForm" 
        label-width="100px"
        class="profile-form"
      >
        <el-form-item label="账号名">
          <el-input v-model="profileForm.username" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="用户名" prop="nickname">
          <el-input v-model="profileForm.nickname"></el-input>
        </el-form-item>
        
        <el-form-item label="角色">
          <el-input :value="getRoleName(profileForm.role)" disabled></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="updateProfile">更新信息</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="password-card">
      <div slot="header" class="clearfix">
        <span>修改密码</span>
      </div>
      
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordForm" 
        label-width="120px"
        class="password-form"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password"></el-input>
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password"></el-input>
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmNewPassword">
          <el-input v-model="passwordForm.confirmNewPassword" type="password"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
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
      profileForm: {
        username: '',
        nickname: '',
        role: ''
      },
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
        const res = await userApi.getProfile();
        if (res.code === 200) {
          this.profileForm = { ...res.data };
        } else {
          this.$message.error(res.message || '获取用户信息失败');
        }
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
    getRoleName(role) {
      switch (role) {
        case 'super_admin':
          return '超级管理员';
        case 'info_admin':
          return '信息管理员';
        default:
          return '普通用户';
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card, .password-card {
  max-width: 600px;
  margin: 0 auto;
}

.profile-form, .password-form {
  margin-top: 20px;
}

.clearfix {
  font-size: 18px;
  font-weight: bold;
}
</style>