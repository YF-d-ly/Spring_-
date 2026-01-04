<template>
  <div class="login-container">
    <!-- 背景层 -->
    <div class="login-background" :style="bgStyle">
      <div class="background-overlay"></div>
    </div>
    
    <!-- 内容层 -->
    <div class="login-content">
      <!-- 左侧品牌区域 -->
      <div class="login-left">
        <div class="brand-logo">
          <h1>仓储管理系统</h1>
          <div class="logo-dots">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        
        <div class="main-slogan">
          <h2>再小的仓库，也能轻松管出智能范儿！</h2>
        </div>
        
        <div class="features-list">
          <div class="feature-line">
            <span class="feature-cn">高效</span>
            <span class="feature-divider">/</span>
            <span class="feature-en">EFFICIENT</span>
          </div>
          <div class="feature-line">
            <span class="feature-cn">智能</span>
            <span class="feature-divider">/</span>
            <span class="feature-en">INTELLIGENT</span>
          </div>
          <div class="feature-line">
            <span class="feature-cn">简单</span>
            <span class="feature-divider">/</span>
            <span class="feature-en">SIMPLE</span>
          </div>
          <div class="feature-line">
            <span class="feature-cn">精准</span>
            <span class="feature-divider">/</span>
            <span class="feature-en">ACCURATE</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="login-card">
          <div class="card-decoration"></div>
          <div class="card-header">
            <h3>账号登录    
              <span class="method-switch">
              <el-radio-group v-model="loginMethod" size="small">
                <el-radio-button label="password">密码登录</el-radio-button>
                <el-radio-button label="emailCode">邮箱验证码登录</el-radio-button>
              </el-radio-group>
            </span>
          </h3>
         
          </div>
          
          <el-form 
            :model="loginForm" 
            :rules="loginRules" 
            ref="loginForm"
            @submit.native.prevent="handleLogin"
            class="login-form"
          >
            <template v-if="loginMethod==='password'">
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入账号/手机号"
                  prefix-icon="el-icon-user"
                  size="large"
                  class="login-input"
                ></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="el-icon-lock"
                  size="large"
                  class="login-input"
                  @keyup.enter.native="handleLogin"
                ></el-input>
              </el-form-item>
            </template>
            
            <template v-else>
              <el-form-item prop="email">
                <el-input
                  v-model="loginForm.email"
                  placeholder="请输入邮箱"
                  prefix-icon="el-icon-message"
                  size="large"
                  class="login-input"
                ></el-input>
              </el-form-item>
              <el-form-item prop="code">
                <div class="captcha-container">
                  <el-input
                    v-model="loginForm.code"
                    placeholder="请输入邮箱验证码"
                    prefix-icon="el-icon-key"
                    size="large"
                    class="captcha-input"
                    maxlength="6"
                  ></el-input>
                  <el-button type="primary" @click="handleSendLoginCode" :disabled="codeCountdown>0 || sendingCode">
                    {{ codeCountdown>0 ? codeCountdown + 's后重试' : (sendingCode ? '发送中...' : '发送验证码') }}
                  </el-button>
                </div>
              </el-form-item>
              <br>
              
            </template>
            
            <!-- 验证码 -->
            <el-form-item prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="el-icon-lock"
                  size="large"
                  class="captcha-input"
                  maxlength="4"
                ></el-input>
                <div class="captcha-image" @click="generateCaptcha">
                  <canvas ref="captchaCanvas" width="120" height="40" />
                </div>
              </div>
            </el-form-item>
            
            <div class="form-options">
              <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
              <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码了?</a>
            </div>
            
            <el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                :loading="loading"
                @click="handleLogin"
                class="login-button"
              >
                {{ loading ? '登录中...' : '立即登录' }}
              </el-button>
            </el-form-item>
            
            <el-button 
              type="text" 
              class="wechat-login"
              @click="handleWeChatLogin"
            >
              <i class="el-icon-chat-line-round"></i>
              企业微信登录
            </el-button>
            
            <div class="register-link">
              <a href="#" @click.prevent="handleExperience">体验一下</a>
              <span> | </span>
          <a href="#" @click.prevent="handleRegister">立即注册</a>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    
    <!-- 底部信息 -->
    <div class="login-footer">
      <div class="platform-links">
        <span>鸿蒙版</span>
        <span>安卓版</span>
        <span>iPhone版</span>
        <span>Win桌面版</span>
        <span>Mac Intel版</span>
      </div>
      <div class="copyright">
        Copyright ©2026 仓储管理系统 All Right Reserved
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { userApi } from '@/api/user'

export default {
  name: 'LoginPage',
  data() {
    return {
      loginMethod: 'password',
      loginForm: {
        username: '',
        password: '',
        email: '',
        code: '',
        captcha: ''
      },
      loading: false,
      rememberPassword: false,
      captchaText: '',
      sendingCode: false,
      codeCountdown: 0,
      codeTimer: null,
      bgStyle: {}
    }
  },
  computed: {
    loginRules() {
      const baseCaptcha = { required: true, validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入验证码'))
        } else if (value.toLowerCase() !== this.captchaText.toLowerCase()) {
          callback(new Error('验证码不正确'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
      if (this.loginMethod === 'password') {
        return {
          username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
          password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
          captcha: [baseCaptcha]
        }
      }
      return {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        captcha: [baseCaptcha]
      }
    }
  },
  methods: {
    ...mapActions('user', ['login', 'loginByCode', 'updateMenuTree']),
    
    async handleLogin() {
      try {
        await this.$refs.loginForm.validate()
        this.loading = true
        
        let res
        if (this.loginMethod === 'password') {
          res = await this.login({
            username: this.loginForm.username,
            password: this.loginForm.password
          })
        } else {
          res = await this.loginByCode({
            email: this.loginForm.email,
            code: this.loginForm.code
          })
        }
        
        if (res) {
          if (this.rememberPassword) {
            const key = this.loginMethod === 'password' ? this.loginForm.username : this.loginForm.email
            localStorage.setItem('rememberedUsername', key)
          } else {
            localStorage.removeItem('rememberedUsername')
          }
          
          this.$message.success('登录成功')
          this.$router.push('/dashboard')
        } else {
          this.$alert('登录失败', '提示', { confirmButtonText: '确定', type: 'error' })
        }
      } catch (err) {
        if (err !== false) {
          console.error(err)
          this.$alert(err.message || '登录失败', '登录失败', { confirmButtonText: '确定', type: 'error' })
        }
      } finally {
        this.loading = false
      }
    },
    async handleSendLoginCode() {
      if (this.sendingCode || this.codeCountdown > 0) return
      try {
        await this.$refs.loginForm.validateField('email')
        this.sendingCode = true
        const res = await userApi.sendEmailCode({ email: this.loginForm.email })
        if (res && (res.code === 200 || res.success === true)) {
          this.$message.success('验证码已发送')
          this.startCodeCountdown()
        } else {
          this.$message.error(res.message || '发送验证码失败')
        }
      } catch (e) {
        console.error('发送验证码失败:', e)
        if (e && e.message) this.$message.error(e.message)
      } finally {
        this.sendingCode = false
      }
    },
    startCodeCountdown() {
      this.codeCountdown = 60
      if (this.codeTimer) {
        clearInterval(this.codeTimer)
        this.codeTimer = null
      }
      this.codeTimer = setInterval(() => {
        this.codeCountdown--
        if (this.codeCountdown <= 0) {
          clearInterval(this.codeTimer)
          this.codeTimer = null
        }
      }, 1000)
    },
    handleForgotPassword() {
      this.$router.push('/forgot-password')
    },
    handleWeChatLogin() {
      this.$message.info('企业微信登录功能开发中...')
    },
    handleExperience() {
      // 使用体验账号登录
      this.loginForm.username = 'admin'
      this.loginForm.password = '123456'
      this.handleLogin()
    },
    handleRegister() {
      this.$router.push('/register')
    },
    // 生成验证码
    generateCaptcha() {
      const canvas = this.$refs.captchaCanvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 生成随机验证码文本
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
      let captcha = ''
      for (let i = 0; i < 4; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.captchaText = captcha
      
      // 绘制背景 (透明背景，移除填充)
      // ctx.fillStyle = this.getRandomColor(180, 240)
      // ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制干扰线 (使用较亮的颜色)
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = this.getRandomColor(150, 220)
        ctx.beginPath()
        ctx.moveTo(
          Math.floor(Math.random() * canvas.width),
          Math.floor(Math.random() * canvas.height)
        )
        ctx.lineTo(
          Math.floor(Math.random() * canvas.width),
          Math.floor(Math.random() * canvas.height)
        )
        ctx.stroke()
      }
      
      // 绘制验证码字符 (使用亮色字体以适配深色背景)
      ctx.textBaseline = 'middle'
      for (let i = 0; i < captcha.length; i++) {
        const char = captcha[i]
        ctx.fillStyle = this.getRandomColor(200, 255) // 亮色文字
        ctx.font = `bold ${Math.floor(canvas.height * 0.8)}px Arial`
        ctx.fillText(
          char,
          (canvas.width / captcha.length) * i + 5,
          canvas.height / 2 + 2, // 微调垂直位置
          canvas.width / captcha.length - 5
        )
      }
      
      // 添加扰动 (亮色)
      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = this.getRandomColor(150, 255)
        ctx.globalAlpha = 0.3 // 增加透明度
        ctx.beginPath()
        ctx.moveTo(
          Math.floor(Math.random() * canvas.width),
          Math.floor(Math.random() * canvas.height)
        )
        ctx.lineTo(
          Math.floor(Math.random() * canvas.width),
          Math.floor(Math.random() * canvas.height)
        )
        ctx.stroke()
        ctx.globalAlpha = 1.0 // 恢复透明度
      }
    },
    
    // 生成随机颜色
    getRandomColor(min, max) {
      const r = Math.floor(Math.random() * (max - min) + min)
      const g = Math.floor(Math.random() * (max - min) + min)
      const b = Math.floor(Math.random() * (max - min) + min)
      return `rgb(${r}, ${g}, ${b})`
    },
    // 设置随机背景图
    setRandomBackground() {
      const images = [
        'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=2560&auto=format&fit=crop', // 荷花/自然
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2560&auto=format&fit=crop', // 山水/湖泊
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop', // 森林/阳光
        'https://images.unsplash.com/photo-1501854140884-074bf86ed91c?q=80&w=2560&auto=format&fit=crop', // 天空/云彩
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560&auto=format&fit=crop', // 群山
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560&auto=format&fit=crop'  // 溪流/风景
      ]
      const randomImage = images[Math.floor(Math.random() * images.length)]
      this.bgStyle = {
        backgroundImage: `url('${randomImage}'), linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%)`
      }
    }
  },
  mounted() {
    // 设置随机背景
    this.setRandomBackground()
    
    // 检查是否有记住的账号
    const rememberedUsername = localStorage.getItem('rememberedUsername')
    if (rememberedUsername) {
      this.loginForm.username = rememberedUsername
      this.rememberPassword = true
    }
    
    // 初始化验证码
    this.generateCaptcha()
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 背景层 */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 默认背景 (渐变) */
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 加深遮罩，确保文字在风景图上清晰可见 */
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

/* 内容层 */
.login-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 左侧品牌区域 */
.login-left {
  flex: 1;
  color: white;
  padding-right: 60px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 60px;
}

.brand-logo h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  color: white;
  letter-spacing: 2px;
}

.logo-dots {
  display: flex;
  gap: 6px;
}

.logo-dots span {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
}

.main-slogan {
  margin-bottom: 50px;
}

.main-slogan h2 {
  font-size: 36px;
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-line {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: white;
  opacity: 0.95;
}

.feature-cn {
  font-weight: 500;
  margin-right: 8px;
}

.feature-divider {
  margin: 0 12px;
  opacity: 0.6;
}

.feature-en {
  font-size: 16px;
  letter-spacing: 1px;
  opacity: 0.8;
}

/* 右侧登录表单 */
.login-right {
  flex: 0 0 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: background 0.3s, border 0.3s, box-shadow 0.3s;
}

/* 主题切换按钮 */
.theme-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  color: white;
  font-size: 20px;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.theme-switch:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(30deg);
}

.card-decoration {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
  border-radius: 50%;
  z-index: 0;
}

.card-header {
  position: relative;
  z-index: 1;
  margin-bottom: 30px;
}

.card-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.login-form {
  position: relative;
  z-index: 1;
}

.login-input {
  margin-bottom: 20px;
}

.captcha-container {
  display: flex;
  gap: 16px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.forgot-password {
  color: #409EFF;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #66b1ff;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
}

.wechat-login {
  width: 100%;
  height: 44px;
  color: #409EFF;
  border: 1px solid #409EFF;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.wechat-login:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #66b1ff;
  border-color: #66b1ff;
}

.wechat-login i {
  margin-right: 8px;
  font-size: 18px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.register-link a {
  color: #409EFF;
  text-decoration: none;
  transition: color 0.3s;
}

.register-link a:hover {
  color: #66b1ff;
}

/* 底部信息 */
.login-footer {
  position: relative;
  z-index: 2;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.platform-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
}

.platform-links span {
  cursor: pointer;
  transition: color 0.3s;
}

.platform-links span:hover {
  color: white;
}

.copyright {
  font-size: 12px;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
    padding: 20px;
  }
  
  .login-left {
    padding-right: 0;
    margin-bottom: 40px;
    text-align: center;
  }
  
  .brand-logo {
    justify-content: center;
    margin-bottom: 30px;
  }
  
  .main-slogan h2 {
    font-size: 28px;
  }
  
  .login-right {
    flex: 1;
    width: 100%;
    max-width: 420px;
  }
}

@media (max-width: 768px) {
  .main-slogan h2 {
    font-size: 24px;
  }
  
  .feature-line {
    font-size: 16px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .captcha-container {
    flex-direction: column;
  }
  
  .captcha-image {
    height: 40px;
  }
  
  .platform-links {
    flex-wrap: wrap;
    gap: 10px;
    font-size: 12px;
  }
}
</style>
