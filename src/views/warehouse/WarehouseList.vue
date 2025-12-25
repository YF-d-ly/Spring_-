<template>
  <div class="warehouse-list">
    <el-card>
      <div slot="header" class="clearfix">
        <span>仓库管理</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text"
          @click="addWarehouse"
        >
          添加仓库
        </el-button>
      </div>
      
      <el-table 
        :data="warehouseList" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="仓库名称" width="200"></el-table-column>
        <el-table-column prop="address" label="地址" width="300"></el-table-column>
        <el-table-column prop="contact_person" label="联系人" width="150"></el-table-column>
        <el-table-column prop="contact_phone" label="联系方式" width="150"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template slot-scope="scope">
            <el-button size="mini" @click="editWarehouse(scope.row)">编辑</el-button>
            <el-button 
              size="mini" 
              type="danger" 
              @click="deleteWarehouse(scope.row)"
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
    
    <!-- 仓库编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="warehouseForm" 
        :rules="warehouseRules" 
        ref="warehouseForm" 
        label-width="100px"
      >
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="warehouseForm.name"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="warehouseForm.address"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact_person">
          <el-input v-model="warehouseForm.contact_person"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="contact_phone">
          <el-input v-model="warehouseForm.contact_phone"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            type="textarea" 
            :rows="3" 
            placeholder="请输入仓库描述" 
            v-model="warehouseForm.description">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveWarehouse">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'WarehouseListPage',
  data() {
    return {
      warehouseList: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      warehouseForm: {
        id: null,
        name: '',
        address: '',
        contact_person: '',
        contact_phone: '',
        description: ''
      },
      warehouseRules: {
        name: [
          { required: true, message: '请输入仓库名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入仓库地址', trigger: 'blur' }
        ],
        contact_person: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        contact_phone: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchWarehouseList();
  },
  methods: {
    // 获取仓库列表
    async fetchWarehouseList() {
      this.loading = true;
      
      // 模拟API调用
      setTimeout(() => {
        // 模拟仓库数据
        this.warehouseList = [
          { id: 1, name: '一号仓库', address: '厦门市集美区', contact_person: '张三', contact_phone: '13800138001', description: '主要存放电子产品' },
          { id: 2, name: '二号仓库', address: '厦门市思明区', contact_person: '李四', contact_phone: '13800138002', description: '主要存放日用品' },
          { id: 3, name: '三号仓库', address: '泉州市晋江市', contact_person: '王五', contact_phone: '13800138003', description: '主要存放食品' }
        ];
        this.total = this.warehouseList.length;
        this.loading = false;
      }, 500);
    },
    
    // 添加仓库
    addWarehouse() {
      this.dialogTitle = '新增仓库';
      this.dialogVisible = true;
      this.resetForm();
    },
    
    // 编辑仓库
    editWarehouse(row) {
      this.dialogTitle = '编辑仓库';
      this.dialogVisible = true;
      this.resetForm();
      
      // 复制仓库数据
      this.warehouseForm = { ...row };
    },
    
    // 重置表单
    resetForm() {
      this.warehouseForm = {
        id: null,
        name: '',
        address: '',
        contact_person: '',
        contact_phone: '',
        description: ''
      };
      
      // 清除验证
      this.$nextTick(() => {
        if (this.$refs.warehouseForm) {
          this.$refs.warehouseForm.clearValidate();
        }
      });
    },
    
    // 保存仓库
    async saveWarehouse() {
      try {
        await this.$refs.warehouseForm.validate();
        
        // 模拟API调用
        if (this.warehouseForm.id) {
          // 编辑仓库
          setTimeout(() => {
            const index = this.warehouseList.findIndex(w => w.id === this.warehouseForm.id);
            if (index !== -1) {
              // 更新仓库信息
              this.warehouseList.splice(index, 1, { ...this.warehouseForm });
              this.$message.success('仓库更新成功');
            }
            this.dialogVisible = false;
          }, 500);
        } else {
          // 新增仓库
          setTimeout(() => {
            const newWarehouse = {
              ...this.warehouseForm,
              id: this.warehouseList.length + 1
            };
            this.warehouseList.push(newWarehouse);
            this.total = this.warehouseList.length;
            this.$message.success('仓库添加成功');
            this.dialogVisible = false;
          }, 500);
        }
      } catch (error) {
        this.$message.error('表单验证失败');
      }
    },
    
    // 删除仓库
    deleteWarehouse(row) {
      this.$confirm(`确定删除仓库 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          const index = this.warehouseList.findIndex(w => w.id === row.id);
          if (index !== -1) {
            this.warehouseList.splice(index, 1);
            this.total = this.warehouseList.length;
            this.$message.success('删除成功');
          }
        }, 500);
      }).catch(() => {
        // 取消删除
      });
    },
    
    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchWarehouseList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchWarehouseList();
    }
  }
}
</script>

<style scoped>
.warehouse-list {
  padding: 20px;
}
</style>