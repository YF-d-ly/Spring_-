<template>
  <div class="quick-actions-panel" :class="{ 'panel-open': isOpen }">
    <div class="panel-toggle" @click="togglePanel">
      <i class="el-icon-menu"></i>
    </div>
    
    <transition name="slide-fade">
      <div v-if="isOpen" class="panel-content">
        <div class="panel-header">
          <h3>快捷操作</h3>
          <i class="el-icon-close" @click="closePanel"></i>
        </div>
        
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="库存查询"
            prefix-icon="el-icon-search"
            size="small"
            clearable
          ></el-input>
        </div>
        
        <div class="actions-container">
          <!-- 入库管理 -->
          <div class="action-section">
            <div class="section-title">
              <i class="el-icon-plus"></i>
              <span>入库管理</span>
            </div>
            <div class="action-grid">
              <div 
                v-for="action in inboundActions" 
                :key="action.key"
                class="action-item"
                @click="handleAction(action)"
              >
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <i :class="action.icon"></i>
                </div>
                <span class="action-label">{{ action.label }}</span>
              </div>
            </div>
          </div>
          
          <!-- 库内管理 -->
          <div class="action-section">
            <div class="section-title">
              <i class="el-icon-box"></i>
              <span>库内管理</span>
            </div>
            <div class="action-grid">
              <div 
                v-for="action in warehouseActions" 
                :key="action.key"
                class="action-item"
                @click="handleAction(action)"
              >
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <i :class="action.icon"></i>
                </div>
                <span class="action-label">{{ action.label }}</span>
              </div>
            </div>
          </div>
          
          <!-- 出库管理 -->
          <div class="action-section">
            <div class="section-title">
              <i class="el-icon-shopping-bag-1"></i>
              <span>出库管理</span>
            </div>
            <div class="action-grid">
              <div 
                v-for="action in outboundActions" 
                :key="action.key"
                class="action-item"
                @click="handleAction(action)"
              >
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <i :class="action.icon"></i>
                </div>
                <span class="action-label">{{ action.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 遮罩层 -->
    <transition name="fade">
      <div v-if="isOpen" class="panel-overlay" @click="closePanel"></div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'QuickActionsPanel',
  data() {
    return {
      isOpen: false,
      searchKeyword: '',
      inboundActions: [
        {
          key: 'receive',
          label: '收货',
          icon: 'el-icon-plus',
          color: '#409EFF',
          path: '/stock/log',
          type: 'inbound'
        },
        {
          key: 'quality',
          label: '质检',
          icon: 'el-icon-check',
          color: '#67C23A',
          path: '/stock/log',
          type: 'quality'
        },
        {
          key: 'putaway',
          label: '上架',
          icon: 'el-icon-sort',
          color: '#E6A23C',
          path: '/stock/log',
          type: 'putaway'
        }
      ],
      warehouseActions: [
        {
          key: 'transfer',
          label: '移库',
          icon: 'el-icon-position',
          color: '#409EFF',
          path: '/stock/transfer'
        },
        {
          key: 'pack',
          label: '装箱',
          icon: 'el-icon-box',
          color: '#67C23A',
          path: '/stock/log',
          type: 'pack'
        },
        {
          key: 'unpack',
          label: '拆箱',
          icon: 'el-icon-folder-opened',
          color: '#E6A23C',
          path: '/stock/log',
          type: 'unpack'
        },
        {
          key: 'inventory',
          label: '盘点',
          icon: 'el-icon-s-data',
          color: '#909399',
          path: '/stock/log',
          type: 'inventory'
        },
        {
          key: 'replenish',
          label: '补货',
          icon: 'el-icon-sort',
          color: '#F56C6C',
          path: '/stock/log',
          type: 'replenish'
        }
      ],
      outboundActions: [
        {
          key: 'picking',
          label: '拣货',
          icon: 'el-icon-shopping-cart-2',
          color: '#409EFF',
          path: '/stock/log',
          type: 'outbound'
        },
        {
          key: 'review',
          label: '复核',
          icon: 'el-icon-check',
          color: '#67C23A',
          path: '/stock/log',
          type: 'review'
        }
      ]
    }
  },
  methods: {
    togglePanel() {
      this.isOpen = !this.isOpen
    },
    closePanel() {
      this.isOpen = false
    },
    handleSearch() {
      if (!this.searchKeyword) return
      
      this.closePanel()
      this.$router.push({
        path: '/stock/log',
        query: { goods_name: this.searchKeyword }
      })
      
      this.searchKeyword = '' // 清空搜索框
    },
    handleAction(action) {
      this.closePanel()
      
      // 根据不同的操作类型执行不同的逻辑
      if (action.path) {
        if (action.type) {
          // 如果有类型，可以传递参数
          this.$router.push({
            path: action.path,
            query: { type: action.type }
          })
        } else {
          this.$router.push(action.path)
        }
      }
      
      // 显示提示信息
      this.$message.success(`已打开${action.label}功能`)
    }
  }
}
</script>

<style scoped>
.quick-actions-panel {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2000;
}

.panel-toggle {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25px 0 0 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  color: white;
  font-size: 20px;
}

.panel-toggle:hover {
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.25);
  transform: translateX(-5px);
}

.panel-content {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 380px;
  background: #fff;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.panel-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.panel-header .el-icon-close {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.panel-header .el-icon-close:hover {
  transform: rotate(90deg);
}

.search-bar {
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.actions-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.action-section {
  margin-bottom: 30px;
}

.action-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 18px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 15px 10px;
  border-radius: 8px;
  transition: all 0.3s;
  background: #fafafa;
}

.action-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.action-item:hover .action-icon {
  transform: scale(1.1);
}

.action-label {
  font-size: 13px;
  color: #606266;
  text-align: center;
  font-weight: 500;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* 夜间模式适配 */
body.dark-mode .panel-content {
  background: #1f2937 !important;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.5) !important;
}

body.dark-mode .search-bar {
  background: #111827 !important;
  border-bottom-color: #374151 !important;
}

body.dark-mode .action-item {
  background: #111827 !important;
}

body.dark-mode .action-item:hover {
  background: #374151 !important;
}

body.dark-mode .section-title {
  color: #e4e7ed !important;
}

body.dark-mode .action-label {
  color: #e4e7ed !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .panel-content {
    width: 100%;
  }
  
  .action-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .action-label {
    font-size: 12px;
  }
}
</style>

