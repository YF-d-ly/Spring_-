<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <div class="card-header">
        <h3>找回密码</h3>
        <p class="subtitle">通过手机号或邮箱重置登录密码</p>
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-position="top"
        class="forgot-form"
      >
        <div class="method-tabs">
          <el-radio-group v-model="method">
            <el-radio-button label="phone">手机号</el-radio-button>
            <el-radio-button label="email">邮箱</el-radio-button>
          </el-radio-group>
        </div>

        <el-form-item v-if="method==='phone'" label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入绑定的手机号" />
        </el-form-item>
        <el-form-item v-else label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入绑定的邮箱" />
        </el-form-item>

        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-row">
            <el-input v-model="form.captcha" placeholder="请输入验证码" maxlength="6" />
            <el-button
              type="primary"
              :disabled="countdown>0 || sending"
              @click="handleSendCaptcha"
            >
              {{ countdown>0 ? countdown + 's后重试' : (sending ? '发送中...' : '发送验证码') }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="block-btn" :loading="loading" @click="handleReset">
            {{ loading ? '提交中...' : '重置密码' }}
          </el-button>
          <div class="form-footer">
            已记起密码？
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
  name: 'ForgotPasswordPage',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.form.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      method: 'phone',
      sending: false,
      countdown: 0,
      timer: null,
      loading: false,
      form: {
        phone: '',
        email: '',
        captcha: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        phone: [
          { required: function() { return this.method==='phone' }.bind(this), message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        email: [
          { required: function() { return this.method==='email' }.bind(this), message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async handleSendCaptcha() {
      if (this.sending || this.countdown > 0) return
      try {
        // 基于当前方式校验对应字段
        if (this.method === 'phone') {
          await this.$refs.form.validateField('phone')
        } else {
          await this.$refs.form.validateField('email')
        }
        this.sending = true
        const payload = this.method === 'phone'
          ? { phone: this.form.phone }
          : { email: this.form.email }
        const res = await userApi.sendCaptcha(payload)
        if (res && (res.code === 200 || res.success === true)) {
          this.$message.success('验证码已发送')
          this.startCountdown()
        } else {
          this.$message.error(res.message || '发送验证码失败')
        }
      } catch (e) {
        console.error('发送验证码失败:', e)
        if (e && e.message) {
          this.$message.error(e.message)
        }
      } finally {
        this.sending = false
      }
    },
    startCountdown() {
      this.countdown = 60
      this.clearTimer()
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.clearTimer()
        }
      }, 1000)
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    async handleReset() {
      try {
        await this.$refs.form.validate()
        this.loading = true
        const payload = {
          captcha: this.form.captcha,
          newPassword: this.form.newPassword
        }
        if (this.method === 'phone') {
          payload.phone = this.form.phone
        } else {
          payload.email = this.form.email
        }
        const res = await userApi.resetPasswordByCaptcha(payload)
        if (res && (res.code === 200 || res.success === true)) {
          this.$message.success('密码重置成功，请登录')
          this.$router.push('/login')
        } else {
          this.$message.error(res.message || '密码重置失败')
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        this.$message.error(error.message || '重置密码失败')
      } finally {
        this.loading = false
      }
    }
  },
  beforeDestroy() {
    this.clearTimer()
  }
}
</script>

<style scoped>
.forgot-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
  padding: 20px;
}
.forgot-card {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 24px 24px 8px;
}
.card-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
.subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}
.method-tabs {
  margin: 12px 0 6px;
}
.captcha-row {
  display: flex;
  gap: 10px;
}
.block-btn {
  width: 100%;
}
.form-footer {
  margin-top: 6px;
  text-align: center;
  color: #909399;
}
</style>

