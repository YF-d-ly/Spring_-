<template>
  <div class="login-container">
    <!-- 背景层 -->
    <div class="login-background">
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
            <h3>账号登录</h3>
          </div>
          
          <el-form 
            :model="loginForm" 
            :rules="loginRules" 
            ref="loginForm"
            @submit.native.prevent="handleLogin"
            class="login-form"
          >
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
        Copyright ©2024 仓储管理系统 All Right Reserved
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    // 验证码验证规则
    const validateCaptcha = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else if (value.toLowerCase() !== this.captchaText.toLowerCase()) {
        callback(new Error('验证码不正确'))
      } else {
        callback()
      }
    }
    
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        captcha: [
          { required: true, validator: validateCaptcha, trigger: 'blur' }
        ]
      },
      loading: false,
      rememberPassword: false,
      captchaText: '' // 存储验证码文本
    }
  },
  methods: {
    async handleLogin() {
      try {
        await this.$refs.loginForm.validate()
        this.loading = true
        await this.$store.dispatch('user/login', { username: this.loginForm.username })
        // 更新菜单树并跳转到仪表盘
        await this.$store.dispatch('user/updateMenuTree')
        
        // 记住密码
        if (this.rememberPassword) {
          localStorage.setItem('rememberedUsername', this.loginForm.username)
        } else {
          localStorage.removeItem('rememberedUsername')
        }
        
        this.$message.success('登录成功')
        this.$router.push('/dashboard')
      } catch (err) {
        if (err !== false) {
          console.error(err)
          this.$message.error('登录失败')
        }
      } finally {
        this.loading = false
      }
    },
    handleForgotPassword() {
      this.$message.info('忘记密码功能开发中...')
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
      this.$message.info('注册功能开发中...')
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
      
      // 绘制背景
      ctx.fillStyle = this.getRandomColor(180, 240)
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制干扰线
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = this.getRandomColor(100, 180)
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
      
      // 绘制验证码字符
      ctx.textBaseline = 'middle'
      for (let i = 0; i < captcha.length; i++) {
        const char = captcha[i]
        ctx.fillStyle = this.getRandomColor(0, 100)
        ctx.font = `${Math.floor(canvas.height * 0.8)}px Arial`
        ctx.fillText(
          char,
          (canvas.width / captcha.length) * i + 5,
          canvas.height / 2,
          canvas.width / captcha.length - 5
        )
      }
      
      // 添加扰动
      for (let i = 0; i < 30; i++) {
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
    },
    
    // 生成随机颜色
    getRandomColor(min, max) {
      const r = Math.floor(Math.random() * (max - min) + min)
      const g = Math.floor(Math.random() * (max - min) + min)
      const b = Math.floor(Math.random() * (max - min) + min)
      return `rgb(${r}, ${g}, ${b})`
    }
  },
  mounted() {
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
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(30, 60, 114, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(46, 82, 152, 0.6) 0%, transparent 50%),
    linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
  z-index: 1;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(180deg, rgba(30, 60, 114, 0.3) 0%, transparent 30%),
    linear-gradient(0deg, rgba(46, 82, 152, 0.2) 0%, transparent 40%);
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
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 夜间模式适配 */
body.dark-mode .login-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

body.dark-mode .login-card {
  background: rgba(31, 41, 55, 0.95) !important;
  border: 1px solid #374151 !important;
}

body.dark-mode .card-header h3 {
  color: #e4e7ed !important;
}

body.dark-mode .login-footer {
  color: rgba(228, 231, 237, 0.8) !important;
}
</style>