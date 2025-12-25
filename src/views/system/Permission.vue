<template>
  <div class="permission-page">
    <el-card>
      <div slot="header" class="clearfix">
        <span>权限管理</span>
      </div>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 菜单权限标签页 -->
        <el-tab-pane label="菜单权限" name="menu">
          <el-form :inline="true" style="margin-bottom: 20px;">
            <el-form-item label="选择用户">
              <el-select v-model="selectedUserId" placeholder="请选择用户" @change="loadUserMenuPermissions" style="width: 300px;">
                <el-option 
                  v-for="user in userList" 
                  :key="user.id" 
                  :label="`${user.username} (${user.nickname})`" 
                  :value="user.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          
          <el-tree
            ref="menuTree"
            :data="menuTreeData"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedMenuKeys"
            :props="{ children: 'children', label: 'menu_name' }"
            style="margin-top: 20px;"
          >
          </el-tree>
          
          <div style="margin-top: 20px;">
            <el-button type="primary" @click="saveMenuPermissions" :disabled="!selectedUserId">保存菜单权限</el-button>
            <el-button @click="resetMenuPermissions">重置</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 仓库权限标签页 -->
        <el-tab-pane label="仓库权限" name="warehouse">
          <el-form :inline="true" style="margin-bottom: 20px;">
            <el-form-item label="选择用户">
              <el-select v-model="selectedUserId" placeholder="请选择用户" @change="loadUserWarehousePermissions" style="width: 300px;">
                <el-option 
                  v-for="user in userList" 
                  :key="user.id" 
                  :label="`${user.username} (${user.nickname})`" 
                  :value="user.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          
          <el-checkbox-group v-model="checkedWarehouseIds" style="margin-top: 20px;">
            <el-checkbox 
              v-for="warehouse in warehouseList" 
              :key="warehouse.id" 
              :label="warehouse.id"
            >
              {{ warehouse.name }}
            </el-checkbox>
          </el-checkbox-group>
          
          <div style="margin-top: 20px;">
            <el-button type="primary" @click="saveWarehousePermissions" :disabled="!selectedUserId">保存仓库权限</el-button>
            <el-button @click="resetWarehousePermissions">重置</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
// import { permissionApi } from '@/api/permission'
// import { userApi } from '@/api/user'
// import { warehouseApi } from '@/api/warehouse'

export default {
  name: 'PermissionPage',
  data() {
    return {
      activeTab: 'menu',
      selectedUserId: null,
      userList: [],
      warehouseList: [],
      menuTreeData: [],
      checkedMenuKeys: [],
      checkedWarehouseIds: []
    }
  },
  created() {
    this.fetchUserList()
    this.fetchWarehouseList()
    this.loadAllMenus()
  },
  methods: {
    // 获取用户列表
    async fetchUserList() {
      // 模拟数据
      this.userList = [
        { id: 1, username: 'admin', nickname: '超级管理员', role: 'super_admin' },
        { id: 2, username: 'info', nickname: '信息管理员', role: 'info_admin' },
        { id: 3, username: 'user1', nickname: '普通用户1', role: 'info_admin' }
      ]
    },
    
    // 获取仓库列表
    async fetchWarehouseList() {
      this.warehouseList = [
        { id: 1, name: '一号仓库' },
        { id: 2, name: '二号仓库' },
        { id: 3, name: '三号仓库' }
      ]
    },
    
    // 加载所有菜单
    loadAllMenus() {
      this.menuTreeData = [
        {
          id: 1,
          menu_name: '仪表盘',
          menu_path: '/dashboard',
          icon: 'el-icon-s-home'
        },
        {
          id: 2,
          menu_name: '仓库管理',
          menu_path: '/warehouse/list',
          icon: 'el-icon-warehouse',
          children: [
            { id: 21, menu_name: '仓库列表', menu_path: '/warehouse/list', icon: 'el-icon-list' }
          ]
        },
        {
          id: 3,
          menu_name: '货品管理',
          menu_path: '/goods/list',
          icon: 'el-icon-goods',
          children: [
            { id: 31, menu_name: '货品列表', menu_path: '/goods/list', icon: 'el-icon-list' },
            { id: 32, menu_name: '货品类别', menu_path: '/goods/category', icon: 'el-icon-menu' }
          ]
        },
        {
          id: 4,
          menu_name: '库存管理',
          menu_path: '/stock/log',
          icon: 'el-icon-takeaway-box',
          children: [
            { id: 41, menu_name: '库存日志', menu_path: '/stock/log', icon: 'el-icon-document' },
            { id: 42, menu_name: '调拨管理', menu_path: '/stock/transfer', icon: 'el-icon-position' }
          ]
        },
        {
          id: 5,
          menu_name: '统计报表',
          menu_path: '/report/enterprise',
          icon: 'el-icon-data-line',
          children: [
            { id: 51, menu_name: '企业统计', menu_path: '/report/enterprise', icon: 'el-icon-data-line' },
            { id: 52, menu_name: '仓库统计', menu_path: '/report/warehouse', icon: 'el-icon-data-line' }
          ]
        },
        {
          id: 6,
          menu_name: '系统管理',
          menu_path: '/system/user',
          icon: 'el-icon-setting',
          children: [
            { id: 61, menu_name: '用户管理', menu_path: '/system/user', icon: 'el-icon-user' },
            { id: 62, menu_name: '权限管理', menu_path: '/system/permission', icon: 'el-icon-key' }
          ]
        }
      ]
    },
    
    // 加载用户菜单权限
    loadUserMenuPermissions() {
      if (!this.selectedUserId) {
        this.checkedMenuKeys = []
        return
      }
      
      // 模拟数据：根据用户角色设置默认权限
      const user = this.userList.find(u => u.id === this.selectedUserId)
      if (user) {
        if (user.role === 'super_admin') {
          // 超级管理员拥有所有权限
          this.checkedMenuKeys = [1, 2, 21, 3, 31, 32, 4, 41, 42, 5, 51, 52, 6, 61, 62]
        } else {
          // 信息管理员默认权限
          this.checkedMenuKeys = [1, 2, 21, 3, 31, 32, 4, 41, 42, 5, 51]
        }
      }
      
      // 实际项目中应该调用API
      // permissionApi.getUserMenuPermissions(this.selectedUserId).then(res => {
      //   this.checkedMenuKeys = res.data
      // })
    },
    
    // 加载用户仓库权限
    loadUserWarehousePermissions() {
      if (!this.selectedUserId) {
        this.checkedWarehouseIds = []
        return
      }
      
      // 模拟数据
      const user = this.userList.find(u => u.id === this.selectedUserId)
      if (user) {
        if (user.role === 'super_admin') {
          // 超级管理员拥有所有仓库权限
          this.checkedWarehouseIds = this.warehouseList.map(w => w.id)
        } else {
          // 信息管理员默认拥有部分仓库权限
          this.checkedWarehouseIds = [1, 2]
        }
      }
      
      // 实际项目中应该调用API
      // warehouseApi.getUserWarehousePermissions(this.selectedUserId).then(res => {
      //   this.checkedWarehouseIds = res.data
      // })
    },
    
    // 保存菜单权限
    async saveMenuPermissions() {
      if (!this.selectedUserId) {
        this.$message.warning('请先选择用户')
        return
      }
      
      // 模拟API调用
      setTimeout(() => {
        this.$message.success('菜单权限保存成功')
      }, 500)
      
      // 实际项目中应该调用API
      // const checkedKeys = this.$refs.menuTree.getCheckedKeys()
      // const halfCheckedKeys = this.$refs.menuTree.getHalfCheckedKeys()
      // const allKeys = [...checkedKeys, ...halfCheckedKeys]
      // try {
      //   await permissionApi.setUserMenuPermissions({
      //     user_id: this.selectedUserId,
      //     menu_ids: allKeys
      //   })
      //   this.$message.success('菜单权限保存成功')
      // } catch (error) {
      //   this.$message.error('保存失败')
      // }
    },
    
    // 保存仓库权限
    async saveWarehousePermissions() {
      if (!this.selectedUserId) {
        this.$message.warning('请先选择用户')
        return
      }
      
      // 模拟API调用
      setTimeout(() => {
        this.$message.success('仓库权限保存成功')
      }, 500)
      
      // 实际项目中应该调用API
      // try {
      //   await warehouseApi.setUserWarehousePermissions({
      //     user_id: this.selectedUserId,
      //     warehouse_ids: this.checkedWarehouseIds
      //   })
      //   this.$message.success('仓库权限保存成功')
      // } catch (error) {
      //   this.$message.error('保存失败')
      // }
    },
    
    // 重置菜单权限
    resetMenuPermissions() {
      this.loadUserMenuPermissions()
    },
    
    // 重置仓库权限
    resetWarehousePermissions() {
      this.loadUserWarehousePermissions()
    }
  }
}
</script>

<style scoped>
.permission-page {
  padding: 20px;
}
</style>

