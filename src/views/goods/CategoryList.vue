<template>
  <div class="category-list">
    <el-card>
      <div slot="header" class="clearfix">
        <span>货品类别管理</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text"
          @click="addCategory"
        >
          添加类别
        </el-button>
      </div>
      
      <el-table 
        :data="categoryList" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="类别名称" width="200"></el-table-column>
        <el-table-column prop="code" label="类别编码" width="150"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="sort_order" label="排序" width="100"></el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="editCategory(scope.row)">编辑</el-button>
            <el-button 
              size="mini" 
              type="danger" 
              @click="deleteCategory(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 类别编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="categoryForm" 
        :rules="categoryRules" 
        ref="categoryForm" 
        label-width="100px"
      >
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入类别名称"></el-input>
        </el-form-item>
        <el-form-item label="类别编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入类别编码"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="categoryForm.sort_order" :min="0" :max="999"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            type="textarea" 
            :rows="3" 
            placeholder="请输入类别描述" 
            v-model="categoryForm.description">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { goodsApi } from '@/api/goods'

export default {
  name: 'CategoryListPage',
  data() {
    return {
      categoryList: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      categoryForm: {
        id: null,
        name: '',
        code: '',
        description: '',
        sort_order: 0
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入类别名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入类别编码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchCategoryList()
  },
  methods: {
    // 获取类别列表
    async fetchCategoryList() {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        this.categoryList = [
          { id: 1, name: '电子产品', code: 'ELEC', description: '各类电子产品', sort_order: 1 },
          { id: 2, name: '日用品', code: 'DAILY', description: '日常生活用品', sort_order: 2 },
          { id: 3, name: '食品', code: 'FOOD', description: '各类食品', sort_order: 3 },
          { id: 4, name: '服装', code: 'CLOTH', description: '各类服装', sort_order: 4 }
        ]
        this.loading = false
      }, 500)
      
      // 实际项目中应该调用API
      // try {
      //   const res = await goodsApi.getCategoryList()
      //   this.categoryList = res.data
      // } catch (error) {
      //   this.$message.error('获取类别列表失败')
      // } finally {
      //   this.loading = false
      // }
    },
    
    // 添加类别
    addCategory() {
      this.dialogTitle = '新增类别'
      this.dialogVisible = true
      this.resetForm()
    },
    
    // 编辑类别
    editCategory(row) {
      this.dialogTitle = '编辑类别'
      this.dialogVisible = true
      this.resetForm()
      this.categoryForm = { ...row }
    },
    
    // 重置表单
    resetForm() {
      this.categoryForm = {
        id: null,
        name: '',
        code: '',
        description: '',
        sort_order: 0
      }
      this.$nextTick(() => {
        if (this.$refs.categoryForm) {
          this.$refs.categoryForm.clearValidate()
        }
      })
    },
    
    // 保存类别
    async saveCategory() {
      try {
        await this.$refs.categoryForm.validate()
        
        // 模拟API调用
        if (this.categoryForm.id) {
          setTimeout(() => {
            const index = this.categoryList.findIndex(c => c.id === this.categoryForm.id)
            if (index !== -1) {
              this.categoryList.splice(index, 1, { ...this.categoryForm })
              this.$message.success('类别更新成功')
            }
            this.dialogVisible = false
          }, 500)
        } else {
          setTimeout(() => {
            const newCategory = {
              ...this.categoryForm,
              id: this.categoryList.length + 1
            }
            this.categoryList.push(newCategory)
            this.$message.success('类别添加成功')
            this.dialogVisible = false
          }, 500)
        }
        
        // 实际项目中应该调用API
        // if (this.categoryForm.id) {
        //   await goodsApi.updateCategory(this.categoryForm)
        //   this.$message.success('类别更新成功')
        // } else {
        //   await goodsApi.addCategory(this.categoryForm)
        //   this.$message.success('类别添加成功')
        // }
        // this.dialogVisible = false
        // this.fetchCategoryList()
      } catch (error) {
        this.$message.error('表单验证失败')
      }
    },
    
    // 删除类别
    deleteCategory(row) {
      this.$confirm(`确定删除类别 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          const index = this.categoryList.findIndex(c => c.id === row.id)
          if (index !== -1) {
            this.categoryList.splice(index, 1)
            this.$message.success('删除成功')
          }
        }, 500)
        
        // 实际项目中应该调用API
        // goodsApi.deleteCategory(row.id).then(() => {
        //   this.$message.success('删除成功')
        //   this.fetchCategoryList()
        // })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.category-list {
  padding: 20px;
}
</style>

