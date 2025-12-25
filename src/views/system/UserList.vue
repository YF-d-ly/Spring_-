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
      
      <el-table 
        :data="userList" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="账号名" width="150"></el-table-column>
        <el-table-column prop="nickname" label="用户名" width="150"></el-table-column>
        <el-table-column prop="role" label="角色" width="150">
          <template slot-scope="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ getRoleName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="300">
          <template slot-scope="scope">
            <el-button size="mini" @click="editUser(scope.row)">编辑</el-button>
            <el-button size="mini" type="primary" @click="resetPassword(scope.row)">重置密码</el-button>
            <el-button 
              size="mini" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              size="mini" 
              type="danger" 
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
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="userForm" 
        :rules="userRules" 
        ref="userForm" 
        label-width="100px"
      >
        <el-form-item label="账号名" prop="username">
          <el-input v-model="userForm.username" :disabled="!!userForm.id"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="nickname">
          <el-input v-model="userForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="super_admin"></el-option>
            <el-option label="信息管理员" value="info_admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!userForm.id">
          <el-input v-model="userForm.confirmPassword" type="password"></el-input>
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
export default {
  name: 'UserListPage',
  data() {
    // 密码确认验证
    const validatePass = (rule, value, callback) => {
      if (value !== this.userForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    
    return {
      userList: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      userForm: {
        id: null,
        username: '',
        nickname: '',
        role: '',
        password: '',
        confirmPassword: '',
        status: 1
      },
      userRules: {
        username: [
          { required: true, message: '请输入账号名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        password: [
          { required: !this.userForm.id, validator: (rule, value, callback) => {
            if (!this.userForm.id && !value) {
              callback(new Error('请输入密码'));
            } else if (this.userForm.id) {
              callback(); // 编辑时密码非必填
            } else if (value.length < 6) {
              callback(new Error('密码长度不能少于6位'));
            } else {
              callback();
            }
          }, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: !this.userForm.id, validator: validatePass, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchUserList();
  },
  methods: {
    // 获取用户列表
    async fetchUserList() {
      this.loading = true;
      
      // 模拟API调用
      setTimeout(() => {
        // 模拟用户数据
        this.userList = [
          { id: 1, username: 'admin', nickname: '超级管理员', role: 'super_admin', status: 1 },
          { id: 2, username: 'info', nickname: '信息管理员', role: 'info_admin', status: 1 },
          { id: 3, username: 'user1', nickname: '普通用户1', role: 'info_admin', status: 1 },
          { id: 4, username: 'user2', nickname: '普通用户2', role: 'info_admin', status: 0 }
        ];
        this.total = this.userList.length;
        this.loading = false;
      }, 500);
    },
    
    // 添加用户
    addUser() {
      this.dialogTitle = '新增用户';
      this.dialogVisible = true;
      this.resetForm();
      this.userForm.status = 1;
    },
    
    // 编辑用户
    editUser(row) {
      this.dialogTitle = '编辑用户';
      this.dialogVisible = true;
      this.resetForm();
      
      // 复制用户数据
      this.userForm = { ...row };
    },
    
    // 重置表单
    resetForm() {
      this.userForm = {
        id: null,
        username: '',
        nickname: '',
        role: '',
        password: '',
        confirmPassword: '',
        status: 1
      };
      
      // 清除验证
      this.$nextTick(() => {
        if (this.$refs.userForm) {
          this.$refs.userForm.clearValidate();
        }
      });
    },
    
    // 保存用户
    async saveUser() {
      try {
        await this.$refs.userForm.validate();
        
        // 模拟API调用
        if (this.userForm.id) {
          // 编辑用户
          setTimeout(() => {
            const index = this.userList.findIndex(u => u.id === this.userForm.id);
            if (index !== -1) {
              // 更新用户信息
              this.userList.splice(index, 1, { ...this.userForm });
              this.$message.success('用户更新成功');
            }
            this.dialogVisible = false;
          }, 500);
        } else {
          // 新增用户
          setTimeout(() => {
            const newUser = {
              ...this.userForm,
              id: this.userList.length + 1
            };
            this.userList.push(newUser);
            this.total = this.userList.length;
            this.$message.success('用户添加成功');
            this.dialogVisible = false;
          }, 500);
        }
      } catch (error) {
        this.$message.error('表单验证失败');
      }
    },
    
    // 删除用户
    deleteUser(row) {
      this.$confirm(`确定删除用户 "${row.username}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          const index = this.userList.findIndex(u => u.id === row.id);
          if (index !== -1) {
            this.userList.splice(index, 1);
            this.total = this.userList.length;
            this.$message.success('删除成功');
          }
        }, 500);
      }).catch(() => {
        // 取消删除
      });
    },
    
    // 重置密码
    resetPassword(row) {
      this.$confirm(`确定重置用户 "${row.username}" 的密码吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          this.$message.success('密码重置成功，新密码为：123456');
        }, 500);
      }).catch(() => {
        // 取消重置
      });
    },
    
    // 切换用户状态
    toggleStatus(row) {
      const newStatus = row.status === 1 ? 0 : 1;
      // 模拟API调用
      setTimeout(() => {
        const index = this.userList.findIndex(u => u.id === row.id);
        if (index !== -1) {
          this.userList[index].status = newStatus;
          this.$message.success(newStatus === 1 ? '启用成功' : '禁用成功');
        }
      }, 500);
    },
    
    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchUserList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchUserList();
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
    },
    
    // 获取角色标签类型
    getRoleTagType(role) {
      switch (role) {
        case 'super_admin':
          return 'danger';
        case 'info_admin':
          return 'primary';
        default:
          return 'info';
      }
    }
  }
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}
</style>