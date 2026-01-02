<template>
  <div class="user-list">
    <el-card>
      <div slot="header" class="clearfix">
        <span>用户管理</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text"
          @click="addUser"
        >
          添加用户
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.roleId" placeholder="请选择角色" clearable style="width: 200px;">
            <el-option 
              v-for="item in roleList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table 
        :data="userList" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="150"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150"></el-table-column>
        <el-table-column prop="roleId" label="角色" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.roleId === 'ROLE_001' ? 'danger' : 'primary'">
              {{ getRoleName(scope.row.roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
        <el-table-column prop="telephone" label="电话" width="150"></el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="editUser(scope.row)">编辑</el-button>
            <el-button size="mini" type="text" @click="handleResetPassword(scope.row)">重置密码</el-button>
            <el-button 
              size="mini" 
              type="text" 
              style="color: #f56c6c;"
              @click="deleteUser(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right;"
      >
      </el-pagination>
    </el-card>
    
    <!-- 用户编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="userForm" 
        :rules="userRules" 
        ref="userForm" 
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="userForm.roleId" placeholder="请选择角色" style="width: 100%;">
            <el-option 
              v-for="item in roleList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="telephone">
          <el-input v-model="userForm.telephone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="userForm.password" 
            type="password" 
            :placeholder="userForm.id ? '请输入密码（留空则不修改）' : '请输入密码'"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="userForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          >
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user'
// import { roleApi } from '@/api/role'

export default {
  name: 'UserListPage',
  data() {
    return {
      userList: [],
      roleList: [
        { id: 'ROLE_001', name: '超级管理员' },
        { id: 'ROLE_002', name: '信息管理员' }
      ],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchForm: {
        username: '',
        roleId: null
      },
      userForm: {
        id: null,
        username: '',
        nickname: '',
        roleId: null,
        email: '',
        phone: '',
        password: '',
        status: 1
      },
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        roleId: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度应在6-20位之间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // this.fetchRoleList()
    this.fetchUserList()
  },
  methods: {
    // 获取角色列表
    async fetchRoleList() {
      // 使用静态数据，不再调用API
      // try {
      //   const res = await roleApi.getRoleList()
      //   if (res && res.code === 200) {
      //     this.roleList = res.data || []
      //   } else {
      //     this.$message.error('获取角色列表失败')
      //   }
      // } catch (error) {
      //   console.error('获取角色列表失败:', error)
      //   this.$message.error('获取角色列表失败')
      // }
    },
    
    // 获取用户列表
    async fetchUserList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          username: this.searchForm.username,
          roleId: this.searchForm.roleId
        }
        const res = await userApi.getUserList(params)
        
        if (res && res.code === 200) {
          if (res.data && res.data.records) {
            this.userList = res.data.records
            this.total = res.data.total || 0
          } else if (res.data && Array.isArray(res.data)) {
            this.userList = res.data
            this.total = res.data.length
          } else {
            this.userList = []
            this.total = 0
          }
        } else {
          if (res && res.records) {
            this.userList = res.records
            this.total = res.total || 0
          } else if (Array.isArray(res)) {
            this.userList = res
            this.total = res.length
          } else {
            this.userList = []
            this.total = 0
          }
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.fetchUserList()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        username: '',
        roleId: null
      }
      this.handleSearch()
    },
    
    // 添加用户
    addUser() {
      this.dialogTitle = '新增用户'
      this.dialogVisible = true
      this.resetForm()
    },
    
    // 编辑用户
    editUser(row) {
      this.dialogTitle = '编辑用户'
      this.dialogVisible = true
      this.resetForm()
      this.userForm = { ...row }
    },
    
    // 重置表单
    resetForm() {
      this.userForm = {
        id: null,
        username: '',
        nickname: '',
        roleId: null,
        email: '',
        phone: '',
        password: '',
        status: 1
      }
      this.$nextTick(() => {
        if (this.$refs.userForm) {
          this.$refs.userForm.clearValidate()
        }
      })
    },
    
    // 保存用户
    async saveUser() {
      try {
        // 如果是编辑且密码为空，暂时移除密码验证规则
        if (this.userForm.id && !this.userForm.password) {
           // 临时移除密码必填规则
           const passwordRule = this.userRules.password;
           delete this.userRules.password;
           
           try {
             await this.$refs.userForm.validate()
           } catch(e) {
             // 恢复规则并抛出错误
             this.$set(this.userRules, 'password', passwordRule);
             throw e;
           }
           // 恢复规则
           this.$set(this.userRules, 'password', passwordRule);
        } else {
           await this.$refs.userForm.validate()
        }
        
        let result
        if (this.userForm.id) {
          // 更新用户
          const updateData = { ...this.userForm }
          if (!updateData.password) {
            delete updateData.password
          }
          result = await userApi.updateUser(updateData)
          if (result && result.code === 200) {
            this.$message.success('用户更新成功')
          } else {
            this.$message.error(result.message || '更新失败')
            return
          }
        } else {
          // 添加用户
          result = await userApi.addUser(this.userForm)
          if (result && result.code === 200) {
            this.$message.success('用户添加成功')
          } else {
            this.$message.error(result.message || '添加失败')
            return
          }
        }
        
        // 重新获取列表
        this.fetchUserList()
        this.dialogVisible = false
      } catch (error) {
        console.error(error)
        this.$message.error('表单验证失败')
      }
    },
    
    // 删除用户
    deleteUser(row) {
      this.$confirm(`确定删除用户 "${row.username}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const result = await userApi.deleteUser(row.id)
          if (result && result.code === 200) {
            this.$message.success('删除成功')
            this.fetchUserList() // 重新获取列表
          } else {
            this.$message.error(result.message || '删除失败')
          }
        } catch (error) {
          console.error('删除用户失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    
    // 重置密码
    handleResetPassword(row) {
      this.$confirm(`确定重置用户 "${row.username}" 的密码吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const result = await userApi.resetPassword(row.id)
          if (result && result.code === 200) {
            this.$message.success('密码重置成功')
          } else {
            this.$message.error(result.message || '重置失败')
          }
        } catch (error) {
          console.error('重置密码失败:', error)
          this.$message.error('重置失败')
        }
      }).catch(() => {})
    },

    // 状态更改
    async handleStatusChange(row) {
      try {
        const result = await userApi.updateUser(row)
        if (result && result.code === 200) {
          this.$message.success('状态更新成功')
        } else {
          row.status = row.status === 1 ? 0 : 1 // 恢复原状
          this.$message.error(result.message || '状态更新失败')
        }
      } catch (error) {
        row.status = row.status === 1 ? 0 : 1 // 恢复原状
        console.error('状态更新失败:', error)
        this.$message.error('状态更新失败')
      }
    },

    // 获取角色名称
    getRoleName(roleId) {
      const role = this.roleList.find(r => r.id === roleId)
      return role ? role.name : '未知角色'
    },
    
    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchUserList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchUserList()
    }
  }
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
</style>