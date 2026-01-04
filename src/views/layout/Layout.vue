<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapse" class="logo-text">仓储管理系统</span>
        <span v-else class="logo-icon">仓</span>
      </div>
          <el-menu
            :default-active="$route.path"
            :collapse="isCollapse"
            :background-color="isDarkMode ? '#1f2937' : '#4a5f57'"
            :text-color="isDarkMode ? '#bfcbd9' : '#bfcbd9'"
            :active-text-color="isDarkMode ? '#ffffff' : '#ffffff'"
            class="el-menu-vertical"
            :unique-opened="true"
          >
            <template v-for="item in menuList">
              <el-menu-item 
                v-if="!item.children" 
                :index="item.menu_path" 
                :key="`${item.id}_item`" 
                @click="navigateTo(item.menu_path)"
              >
                <i :class="getIcon(item)" class="menu-icon"></i>
                <span slot="title">{{ item.menu_name }}</span>
              </el-menu-item>
              <el-submenu v-else :index="String(item.id)" :key="`${item.id}_submenu`">
                <template slot="title">
                  <i :class="getIcon(item)" class="menu-icon"></i>
                  <span>{{ item.menu_name }}</span>
                </template>
                <el-menu-item
                  v-for="child in item.children"
                  :key="child.id"
                  :index="child.menu_path"
                  @click="navigateTo(child.menu_path)"
                >
                  <i :class="getIcon(child)" class="menu-icon"></i>
                  <span slot="title">{{ child.menu_name }}</span>
                </el-menu-item>
              </el-submenu>
            </template>
          </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container :class="['main-container', { collapsed: isCollapse }]">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <i 
            :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'" 
            class="collapse-icon"
            @click="toggleCollapse"
          ></i>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item 
              v-for="(item, index) in breadcrumbList" 
              :key="index"
              :to="item.path"
            >
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip :content="isDarkMode ? '切换到日间模式' : '切换到夜间模式'" placement="bottom">
            <i 
              :class="isDarkMode ? 'el-icon-sunny' : 'el-icon-moon'" 
              class="theme-toggle"
              @click="toggleTheme"
            ></i>
          </el-tooltip>
          <el-badge :value="3" class="header-badge">
            <i class="el-icon-bell"></i>
          </el-badge>
          <el-badge :value="5" class="header-badge">
            <i class="el-icon-message"></i>
          </el-badge>
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userAvatar" class="user-avatar">
                {{ userInfo?.nickname ? userInfo.nickname.charAt(0) : 'U' }}
              </el-avatar>
              <span class="user-name">{{ userInfo?.nickname || '用户' }}</span>
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i> 个人信息
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
    
    <!-- 快捷操作面板
    <QuickActionsPanel /> -->


    
    <!-- 快捷操作面板弹窗 -->
    <el-dialog
      title="快捷操作"
      :visible.sync="showQuickActions"
      width="30%"
      :before-close="handleCloseQuickActions"
      class="quick-actions-dialog"
    >
      <QuickActionsPanel :isDialog="true" @close="showQuickActions = false"/>
    </el-dialog>

  </el-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import QuickActionsPanel from '@/components/QuickActionsPanel.vue'

export default {
  name: 'LayoutPage',
  components: {
    QuickActionsPanel
  },
  data() {
    return {
      isCollapse: false,
      userAvatar: '',
      showQuickActions: false
    }
  },
  computed: {
    ...mapGetters('user', ['menuTree', 'userInfo']),
    ...mapGetters('theme', ['isDarkMode']),
    menuList() {
      return this.menuTree
    },
    breadcrumbList() {
      const matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]
      
      if (!first || first.name === 'dashboard') {
        return [{ name: '首页', path: '/dashboard' }]
      }
      
      return matched.map(item => ({
        name: item.meta.title || item.name,
        path: item.path
      }))
    }
  },
  methods: {
    ...mapActions('user', ['logout']),
    ...mapActions('theme', ['toggleTheme']),
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    getIcon(entry) {
      const raw = entry.icon
      const normalized = raw ? (raw.startsWith('el-icon-') ? raw : `el-icon-${raw}`) : ''
      const allowed = [
        's-home','office-building','goods','takeaway-box','data-line','setting',
        'document','position','list','menu','user','key','bell','message','switch-button','s-unfold','s-fold','sunny','moon'
      ]
      if (normalized) {
        const name = normalized.replace('el-icon-','')
        if (allowed.includes(name)) return normalized
      }
      const p = entry.menu_path || ''
      const n = entry.menu_name || ''
      if (p.startsWith('/dashboard') || n.includes('首页')) return 'el-icon-s-home'
      if (p.includes('/warehouse') || n.includes('仓库')) return 'el-icon-menu'
      if (p.includes('/goods') || n.includes('商品')) return 'el-icon-goods'
      if (p.includes('/stock') || n.includes('库存')) return 'el-icon-document'
      if (p.includes('/report') || n.includes('报表')) return 'el-icon-s-data'
      if (p.includes('/system') || n.includes('系统')) return 'el-icon-setting'
      return 'el-icon-menu'
    },
    navigateTo(target) {
      const route = typeof target === 'string' ? { path: target } : target
      const samePath = route.path === this.$route.path
      const sameQuery = JSON.stringify(route.query || {}) === JSON.stringify(this.$route.query || {})
      if (samePath && sameQuery) {
        return
      }
      this.$router.push(route)
    },
    handleCommand(command) {
      if (command === 'logout') {
        this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.logout()
          this.$message.success('已退出登录')
          this.$router.push('/login')
        }).catch(() => {})
      } else if (command === 'profile') {
        this.navigateTo('/system/profile')
      }
    },
    handleCloseQuickActions() {
      this.showQuickActions = false
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #4a5f57;
  transition: width 0.3s;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1000;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3e4e48;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px;
}

.logo-text {
  white-space: nowrap;
}

.logo-icon {
  font-size: 24px;
}

.el-menu-vertical {
  border: none;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 240px;
}

.main-container {
  margin-left: 240px;
  transition: margin-left 0.3s;
}

.main-container.collapsed {
  margin-left: 64px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .main-container {
    margin-left: 0 !important;
  }
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  color: #606266;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #6e9387;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-badge {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
  transition: color 0.3s;
}

.header-badge:hover {
  color: #6e9387;
}

.theme-toggle {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  margin-right: 15px;
  transition: color 0.3s, transform 0.3s;
}

.theme-toggle:hover {
  color: #6e9387;
  transform: rotate(20deg);
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  transition: background-color 0.3s;
  border-radius: 4px;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  margin-right: 8px;
  background-color: #6e9387;
}

.user-name {
  margin-right: 5px;
  font-size: 14px;
  color: #303133;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 侧边栏滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>

<style>
/* 全局样式覆盖 */
.el-menu--collapse .el-menu-item span,
.el-menu--collapse .el-submenu__title span {
  height: 0;
  width: 0;
  overflow: hidden;
  visibility: hidden;
  display: inline-block;
}

/* 侧边栏菜单样式优化 - 仅在非夜间模式下应用 Morandi Green 主题 */
body:not(.dark-mode) .el-menu {
  background-color: #4a5f57 !important;
}

.el-menu-item,
.el-submenu__title {
  height: 50px;
  line-height: 50px;
}

body:not(.dark-mode) .el-menu-item:hover,
body:not(.dark-mode) .el-submenu__title:hover {
  background-color: rgba(110, 147, 135, 0.4) !important;
}

body:not(.dark-mode) .el-menu-item.is-active {
  background-color: #6e9387 !important;
  color: #ffffff !important;
}

body:not(.dark-mode) .el-submenu .el-menu-item {
  background-color: #3e4e48 !important;
}

body:not(.dark-mode) .el-submenu .el-menu-item:hover {
  background-color: rgba(110, 147, 135, 0.4) !important;
}
</style>
