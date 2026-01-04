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
      
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="地址">
          <el-input v-model="searchForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="searchForm.contact" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table 
        :data="warehouseList" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="仓库名称" width="200"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="contact" label="联系人"></el-table-column>
        <el-table-column prop="phone" label="联系方式"></el-table-column> <!-- 修改：contact_phone -> phone -->
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
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
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 仓库编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="warehouseForm" 
        :rules="warehouseRules" 
        ref="warehouseForm" 
        label-width="100px"
      >
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="warehouseForm.name" placeholder="请输入仓库名称"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="warehouseForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="warehouseForm.contact" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone"> <!-- 修改：contact_phone -> phone -->
          <el-input v-model="warehouseForm.phone" placeholder="请输入联系方式"></el-input>
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
import { warehouseApi } from '@/api/warehouse'

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
      searchForm: {
        address: '',
        contact: ''
      },
      warehouseForm: {
        id: null,
        name: '',
        address: '',
        contact: '',
        phone: '', // 修改：contact_phone -> phone
        description: ''
      },
      warehouseRules: {
        name: [
          { required: true, message: '请输入仓库名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        phone: [ // 修改：contact_phone -> phone
          { required: true, message: '请输入联系方式', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchWarehouseList()
  },
  methods: {
    // 获取仓库列表
    async fetchWarehouseList() {
      this.loading = true

      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          address: this.searchForm.address,
          contact: this.searchForm.contact
        }

        const res = await warehouseApi.getWarehousePage(params)
        console.log('API Response:', res) // 调试用，确保数据结构正确

        if (res && res.data && res.data.records) {
          this.warehouseList = res.data.records
          this.total = res.data.total
        } else {
          this.warehouseList = []
          this.total = 0
          this.$message.error('数据格式异常')
        }
      } catch (error) {
        this.$message.error('获取仓库列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 查询
    handleSearch() {
      this.currentPage = 1
      this.fetchWarehouseList()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        address: '',
        contact: ''
      }
      this.fetchWarehouseList()
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchWarehouseList()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchWarehouseList()
    },
    
    // 添加仓库
    addWarehouse() {
      this.dialogTitle = '新增仓库'
      this.dialogVisible = true
      this.resetForm()
    },
    
    // 编辑仓库
    editWarehouse(row) {
      this.dialogTitle = '编辑仓库'
      this.dialogVisible = true
      this.resetForm()
      this.warehouseForm = { ...row }
    },
    
    // 重置表单
    resetForm() {
      this.warehouseForm = {
        id: null,
        name: '',
        address: '',
        contact: '',
        phone: '', // 修改：contact_phone -> phone
        description: ''
      }
      this.$nextTick(() => {
        if (this.$refs.warehouseForm) {
          this.$refs.warehouseForm.clearValidate()
        }
      })
    },
    
    // 保存仓库
    async saveWarehouse() {
      try {
        await this.$refs.warehouseForm.validate()
        
        if (this.warehouseForm.id) {
          // 更新仓库
          await warehouseApi.updateWarehouse(this.warehouseForm)
          this.$message.success('仓库更新成功')
          this.fetchWarehouseList()
        } else {
          // 添加仓库
          await warehouseApi.addWarehouse(this.warehouseForm)
          this.$message.success('仓库添加成功')
          this.fetchWarehouseList()
        }
        
        this.dialogVisible = false
      } catch (error) {
        console.error('保存仓库失败:', error)
        if (error === false) {
           this.$message.error('表单验证失败')
        } else {
           this.$message.error('保存失败，请稍后重试')
        }
      }
    },
    
    // 删除仓库
    deleteWarehouse(row) {
      this.$confirm(`确定删除仓库 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        warehouseApi.deleteWarehouse(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchWarehouseList()
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.warehouse-list {
  padding: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>