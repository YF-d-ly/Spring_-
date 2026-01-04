<template>
  <div class="register-page">
    <div class="register-card">
      <div class="card-header">
        <h3>账号注册</h3>
        <div class="subtext">创建您的仓储管理系统账号</div>
      </div>
      
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="100px"
        class="register-form"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <div class="inline-row">
            <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
            <el-button 
              type="primary" 
              class="send-btn" 
              :disabled="countdown>0 || sending"
              @click="handleSendCode"
            >
              {{ countdown>0 ? countdown + 's后重试' : (sending ? '发送中...' : '发送验证码') }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="form.code" placeholder="请输入邮箱验证码" maxlength="6"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入密码"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit" class="block-btn">
            {{ loading ? '注册中...' : '提交注册' }}
          </el-button>
          <div class="form-footer">
            已有账号？
            <el-button type="text" @click="$router.push('/login')">去登录</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
 </template>

<script>
import { userApi } from '@/api/user'

export default {
  name: 'RegisterPage',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      sending: false,
      countdown: 0,
      timer: null,
      form: {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        code: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async handleSendCode() {
      if (this.sending || this.countdown > 0) return
      try {
        await this.$refs.form.validateField('email')
        this.sending = true
        const res = await userApi.sendEmailCode({ email: this.form.email })
        if (res && (res.code === 200 || res.success === true)) {
          this.$message.success('验证码已发送')
          this.startCountdown()
        } else {
          this.$message.error(res.message || '发送验证码失败')
        }
      } catch (e) {
        console.error('发送验证码失败:', e)
        if (e && e.message) this.$message.error(e.message)
      } finally {
        this.sending = false
      }
    },
    startCountdown() {
      this.countdown = 60
      this.clearTimer()
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) this.clearTimer()
      }, 1000)
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        this.loading = true
        
        const payload = {
          username: this.form.username,
          nickname: this.form.nickname,
          email: this.form.email,
          phone: this.form.phone,
          code: this.form.code,
          password: this.form.password
        }
        
        const res = await userApi.register(payload)
        if (res && (res.code === 200 || res.success === true)) {
          this.$message.success('注册成功，请登录')
          this.$router.push('/login')
        } else {
          this.$message.error(res.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)
        this.$message.error(error.message || '注册失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.inline-row {
  display: flex;
  gap: 10px;
}
.send-btn {
  flex: 0 0 140px;
}
  /* 注册卡片背景色调整 */
  .register-card {
    width: 560px;
    background-color: #eafff6; /* 浅薄荷绿背景 */
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    padding: 24px 24px 8px;
  }

  /* 页面大背景调整 */
  .register-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #d7f3ef 0%, #c9ece7 100%);
    padding: 20px;
  }
.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
.subtext {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.register-form {
  margin-top: 16px;
}
.block-btn {
  width: 100%;
}
.form-footer {
  margin-top: 8px;
  text-align: center;
  color: #909399;
}
  /* 输入框背景适配 (白色，去黑底) */
  /deep/ .el-input__inner {
    background-color: #ffffff !important;
    border-color: #dcdfe6 !important;
    color: #606266 !important;
  }
  
  /deep/ .el-input__inner::placeholder {
    color: #c0c4cc !important;
  }
  
  /deep/ .el-input__inner:focus {
    border-color: #3aa7ff !important;
  }

  /* 标签颜色适配 */
  /deep/ .el-form-item__label {
    color: #606266;
    font-weight: 500;
  }
  
  /* 发送验证码按钮适配 */
  .send-btn {
    background-color: #3aa7ff !important;
    border-color: #3aa7ff !important;
  }
  
  .send-btn:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
  }

  /* 提交按钮适配 */
  .block-btn {
    background-color: #3aa7ff !important;
    border-color: #3aa7ff !important;
    font-size: 16px;
    margin-top: 10px;
  }

  .block-btn:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
  }

  /* 注册卡片背景色调整 */
  .register-card {
    background-color: #eafff6; /* 浅薄荷绿背景 */
  }

  /* 页面大背景调整 */
  .register-page {
    background: linear-gradient(135deg, #d7f3ef 0%, #c9ece7 100%);
  }
  
  /* 头部标题颜色 */
  .card-header h3 {
    color: #004d40; /* 深青色标题 */
  }
</style>

