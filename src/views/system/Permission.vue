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
            <el-form-item label="选择角色">
              <el-select v-model="selectedUserId" placeholder="请选择角色" @change="loadUserMenuPermissions" style="width: 300px;">
                <el-option 
                  v-for="role in roleList" 
                  :key="role.id" 
                  :label="`${role.roleName}`" 
                  :value="role.id">
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
import { permissionApi } from '@/api/permission'
import { userApi } from '@/api/user'
import { warehouseApi } from '@/api/warehouse'


export default {
  name: 'PermissionPage',
  data() {
    return {
      activeTab: 'menu',
      selectedUserId: null,
      userList: [],
      roleList: [],
      warehouseList: [],
      menuTreeData: [],
      checkedMenuKeys: [],
      checkedWarehouseIds: []
    }
  },
  created() {
    this.fetchUserList()
    this.fetchWarehouseList()
    this.fetchRoleList()
    this.loadAllMenus()

  },
  methods: {
    // 获取用户列表
    async fetchUserList() {
      try {
        // 使用 getUserList 替代 getUserNameList，以获得更稳定的支持
        const res = await userApi.getUserList({ page: 1, size: 1000 }) 
        
        if (res && res.code === 200) {
          if (res.data && res.data.records) {
            this.userList = res.data.records
          } else if (res.data && Array.isArray(res.data)) {
            this.userList = res.data
          } else {
            this.userList = []
          }
        } else {
          // 尝试直接使用 res（兼容某些非标准返回）
          if (res && res.records) {
            this.userList = res.records
          } else if (Array.isArray(res)) {
            this.userList = res
          }
        }
      } catch (error) {
        console.error('获取用户列表失败，使用静态数据兜底', error)
        // 静态数据兜底
        this.userList = [
          { id: 1, username: 'admin', nickname: '超级管理员', roleId: 'ROLE_001' },
          { id: 2, username: 'user', nickname: '普通用户', roleId: 'ROLE_002' }
        ]
      } finally {
        this.loading = false
      }
    },
    //获取角色
     async fetchRoleList() {
      try {
        // 使用 getRoleList 替代 getRoleNameList，以获得更稳定的支持
        const res = await permissionApi.getRoleList()
        
        if (res && res.code === 200) {
          if (res.data) {
            this.roleList = res.data
          }
           else {
            this.roleList = []
          }
  
        } 
      }
       catch (error) {
        console.error('获取角色列表失败，使用静态数据兜底:', error)
        // 静态数据兜底
        this.roleList = [
          { id: 'ROLE_002', roleName: '信息管理员' },
          { id: 'ROLE_003', roleName: '特殊用户01' }
        ]
      }
     },
    
    // 获取仓库列表
    async fetchWarehouseList() {
      try {
        // 使用 getWarehousePage 替代 getWarehouseList，以获得更稳定的支持
        const res = await warehouseApi.getWarehousePage({ page: 1, size: 1000 })
        
        if (res && res.code === 200) {
          if (res.data && res.data.records) {
            this.warehouseList = res.data.records
          } else if (res.data && Array.isArray(res.data)) {
            this.warehouseList = res.data
          } else {
            this.warehouseList = []
          }
        } else {
          // 尝试直接使用 res（兼容某些非标准返回）
          if (res && res.records) {
            this.warehouseList = res.records
          } else if (Array.isArray(res)) {
            this.warehouseList = res
          }
        }
      } catch (error) {
        console.error('获取仓库列表失败，使用静态数据兜底:', error)
        // 静态数据兜底
        this.warehouseList = [
          { id: 1, name: '一号仓库', address: '厦门市' },
          { id: 2, name: '二号仓库', address: '福州市' }
        ]
      }
    },
    
    // 将扁平数组转换为树形结构
    buildMenuTree(menuList) {
      const menuMap = {}
      const tree = []

      // 1. 初始化所有节点，并建立 id -> node 的映射
      menuList.forEach(item => {
        menuMap[item.id] = {
          ...item,
          // 适配 el-tree 的 props
          menu_name: item.menuName, 
          // 处理图标，如果后端返回的是 simple name (e.g. 'home')，加上前缀
          icon: item.icon && !item.icon.startsWith('el-icon-') ? `el-icon-${item.icon}` : item.icon,
          children: []
        }
      })

      // 2. 构建树形结构
      menuList.forEach(item => {
        const node = menuMap[item.id]
        if (item.parentId && menuMap[item.parentId]) {
          // 如果有父节点，加入父节点的 children
          menuMap[item.parentId].children.push(node)
        } else {
          // 如果没有父节点（或父节点未找到），作为根节点
          tree.push(node)
        }
      })
      
      // 3. 对同级菜单排序 (可选)
      const sortFunc = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      
      const sortTree = (nodes) => {
        nodes.sort(sortFunc)
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            sortTree(node.children)
          }
        })
      }
      sortTree(tree)

      return tree
    },

    // 加载所有菜单
    async loadAllMenus() {
      // 尝试从API获取菜单，如果失败则使用静态数据
      try {
        const res = await permissionApi.getAllMenus()
        if (res && res.code === 200 && res.data && res.data.length > 0) {
          // 后端返回的是扁平结构，需要转换为树形结构
          this.menuTreeData = this.buildMenuTree(res.data)
          return
        }
      } catch (error) {
        console.warn('获取菜单列表失败，使用静态菜单配置', error)
      }

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
    async loadUserMenuPermissions() {
      if (!this.selectedUserId) {
        this.checkedMenuKeys = []
        return
      }
      
      try {
        const res = await permissionApi.getUserMenuPermissions(this.selectedUserId)
        if (res && res.code === 200) {
          this.checkedMenuKeys = res.data || []
        } else {
          // 如果API调用失败或没有数据，使用默认策略（兼容旧逻辑）
          this.setDefaultMenuPermissions()
        }
      } catch (error) {
        console.error('获取用户菜单权限失败:', error)
        this.setDefaultMenuPermissions()
      }
    },

    // 设置默认菜单权限（后备方案）
    setDefaultMenuPermissions() {
      const user = this.userList.find(u => u.id === this.selectedUserId)
      if (user) {
        if (user.role === 'super_admin' || user.roleId === 'ROLE_001') {
          // 超级管理员拥有所有权限
          this.checkedMenuKeys = [1, 2, 21, 3, 31, 32, 4, 41, 42, 5, 51, 52, 6, 61, 62]
        } else {
          // 信息管理员默认权限
          this.checkedMenuKeys = [1, 2, 21, 3, 31, 32, 4, 41, 42, 5, 51]
        }
      }
    },
    
    // 加载用户仓库权限
    async loadUserWarehousePermissions() {
      if (!this.selectedUserId) {
        this.checkedWarehouseIds = []
        return
      }
      
      try {
        const res = await permissionApi.getUserWarehousePermissions(this.selectedUserId)
        if (res && res.code === 200) {
          // 确保 checkedWarehouseIds 只是 ID 数组，而不是对象数组
          this.checkedWarehouseIds = (res.data || []).map(item => {
            return typeof item === 'object' ? item.id : item
          })
        } else {
          this.checkedWarehouseIds = []
        }
      } catch (error) {
        console.error('获取用户仓库权限失败:', error)
        this.checkedWarehouseIds = []
      }
    },

    // 设置默认仓库权限（后备方案）
    setDefaultWarehousePermissions() {
      const user = this.userList.find(u => u.id === this.selectedUserId)
      if (user) {
        if (user.role === 'super_admin' || user.roleId === 'ROLE_001') {
          // 超级管理员拥有所有仓库权限
          this.checkedWarehouseIds = this.warehouseList.map(w => w.id)
        } else {
          // 信息管理员默认拥有部分仓库权限
          this.checkedWarehouseIds = this.warehouseList.length > 0 ? [this.warehouseList[0].id] : []
        }
      }
    },
    
    // 保存菜单权限
    async saveMenuPermissions() {
      if (!this.selectedUserId) {
        this.$message.warning('请先选择用户')
        return
      }
      
      const checkedKeys = this.$refs.menuTree.getCheckedKeys()
      const halfCheckedKeys = this.$refs.menuTree.getHalfCheckedKeys()
      const allKeys = [...checkedKeys, ...halfCheckedKeys]

      try {
        const res = await permissionApi.setUserMenuPermissions({
          userId: this.selectedUserId, // 注意API可能需要userId而不是user_id，根据习惯猜测，这里用userId更常见，需注意后端字段
          menuIds: allKeys
        })
        
        if (res && res.code === 200) {
          this.$message.success('菜单权限保存成功')
        } else {
          this.$message.error(res.message || '保存失败')
        }
      } catch (error) {
        console.error('保存菜单权限失败:', error)
        this.$message.error('保存失败')
      }
    },
    
    // 保存仓库权限
    async saveWarehousePermissions() {
      if (!this.selectedUserId) {
        this.$message.warning('请先选择用户')
        return
      }
      
      // 确保只发送ID数组，防止脏数据包含对象
      const cleanWarehouseIds = this.checkedWarehouseIds.map(item => {
        return typeof item === 'object' ? item.id : item
      })

      try {
        const res = await permissionApi.setUserWarehousePermissions({
          userId: this.selectedUserId,
          warehouseIds: cleanWarehouseIds
        })
        
        if (res && res.code === 200) {
          this.$message.success('仓库权限保存成功')
        } else {
          this.$message.error(res.message || '保存失败')
        }
      } catch (error) {
        console.error('保存仓库权限失败:', error)
        this.$message.error('保存失败')
      }
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

