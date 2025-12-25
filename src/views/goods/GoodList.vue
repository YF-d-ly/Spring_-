<template>
  <div class="good-list">
    <el-card>
      <div slot="header" class="clearfix">
        <span>货品信息管理</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text"
          @click="addGoods"
        >
          添加货品
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="货品名称">
          <el-input v-model="searchForm.name" placeholder="请输入货品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="searchForm.category_id" placeholder="请选择类别" clearable style="width: 200px;">
            <el-option 
              v-for="item in categoryList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouse_id" placeholder="请选择仓库" clearable style="width: 200px;">
            <el-option 
              v-for="item in warehouseList" 
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
        :data="goodsList" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column label="图片" width="100">
          <template slot-scope="scope">
            <el-image 
              v-if="scope.row.image"
              :src="scope.row.image" 
              style="width: 60px; height: 60px;"
              fit="cover"
              :preview-src-list="[scope.row.image]">
            </el-image>
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="货品名称" width="150"></el-table-column>
        <el-table-column prop="category_name" label="类别" width="120"></el-table-column>
        <el-table-column prop="warehouse_name" label="所属仓库" width="150"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100"></el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="editGoods(scope.row)">编辑</el-button>
            <el-button 
              size="mini" 
              type="danger" 
              @click="deleteGoods(scope.row)"
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
    
    <!-- 货品编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="goodsForm" 
        :rules="goodsRules" 
        ref="goodsForm" 
        label-width="100px"
      >
        <el-form-item label="货品名称" prop="name">
          <el-input v-model="goodsForm.name" placeholder="请输入货品名称"></el-input>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类别" prop="category_id">
              <el-select v-model="goodsForm.category_id" placeholder="请选择类别" style="width: 100%;">
                <el-option 
                  v-for="item in categoryList" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属仓库" prop="warehouse_id">
              <el-select v-model="goodsForm.warehouse_id" placeholder="请选择仓库" style="width: 100%;">
                <el-option 
                  v-for="item in warehouseList" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="goodsForm.price" :min="0" :precision="2" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="goodsForm.stock" :min="0" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="货品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
          >
            <img v-if="goodsForm.image" :src="goodsForm.image" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <div style="margin-top: 10px;">
            <el-button size="small" @click="removeImage" v-if="goodsForm.image">删除图片</el-button>
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            type="textarea" 
            :rows="3" 
            placeholder="请输入货品描述" 
            v-model="goodsForm.description">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGoods">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { goodsApi } from '@/api/goods'
// import { warehouseApi } from '@/api/warehouse'

export default {
  name: 'GoodListPage',
  data() {
    return {
      goodsList: [],
      categoryList: [],
      warehouseList: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchForm: {
        name: '',
        category_id: null,
        warehouse_id: null
      },
      goodsForm: {
        id: null,
        name: '',
        category_id: null,
        warehouse_id: null,
        price: 0,
        stock: 0,
        image: '',
        description: ''
      },
      goodsRules: {
        name: [
          { required: true, message: '请输入货品名称', trigger: 'blur' }
        ],
        category_id: [
          { required: true, message: '请选择类别', trigger: 'change' }
        ],
        warehouse_id: [
          { required: true, message: '请选择仓库', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ],
        stock: [
          { required: true, message: '请输入库存', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchCategoryList()
    this.fetchWarehouseList()
    this.fetchGoodsList()
  },
  methods: {
    // 获取类别列表
    async fetchCategoryList() {
      // 模拟数据
      this.categoryList = [
        { id: 1, name: '电子产品', code: 'ELEC' },
        { id: 2, name: '日用品', code: 'DAILY' },
        { id: 3, name: '食品', code: 'FOOD' },
        { id: 4, name: '服装', code: 'CLOTH' }
      ]
    },
    
    // 获取仓库列表
    async fetchWarehouseList() {
      // 模拟数据
      this.warehouseList = [
        { id: 1, name: '一号仓库' },
        { id: 2, name: '二号仓库' },
        { id: 3, name: '三号仓库' }
      ]
    },
    
    // 获取货品列表
    async fetchGoodsList() {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        this.goodsList = [
          { 
            id: 1, 
            name: 'iPhone 15', 
            category_id: 1, 
            category_name: '电子产品',
            warehouse_id: 1,
            warehouse_name: '一号仓库',
            price: 5999.00,
            stock: 50,
            image: 'https://via.placeholder.com/150',
            description: '苹果最新款手机'
          },
          { 
            id: 2, 
            name: '洗发水', 
            category_id: 2, 
            category_name: '日用品',
            warehouse_id: 2,
            warehouse_name: '二号仓库',
            price: 39.90,
            stock: 200,
            image: '',
            description: '去屑洗发水'
          }
        ]
        this.total = this.goodsList.length
        this.loading = false
      }, 500)
    },
    
    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.fetchGoodsList()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        name: '',
        category_id: null,
        warehouse_id: null
      }
      this.handleSearch()
    },
    
    // 添加货品
    addGoods() {
      this.dialogTitle = '新增货品'
      this.dialogVisible = true
      this.resetForm()
    },
    
    // 编辑货品
    editGoods(row) {
      this.dialogTitle = '编辑货品'
      this.dialogVisible = true
      this.resetForm()
      this.goodsForm = { ...row }
    },
    
    // 重置表单
    resetForm() {
      this.goodsForm = {
        id: null,
        name: '',
        category_id: null,
        warehouse_id: null,
        price: 0,
        stock: 0,
        image: '',
        description: ''
      }
      this.$nextTick(() => {
        if (this.$refs.goodsForm) {
          this.$refs.goodsForm.clearValidate()
        }
      })
    },
    
    // 保存货品
    async saveGoods() {
      try {
        await this.$refs.goodsForm.validate()
        
        // 模拟API调用
        if (this.goodsForm.id) {
          setTimeout(() => {
            const index = this.goodsList.findIndex(g => g.id === this.goodsForm.id)
            if (index !== -1) {
              const category = this.categoryList.find(c => c.id === this.goodsForm.category_id)
              const warehouse = this.warehouseList.find(w => w.id === this.goodsForm.warehouse_id)
              this.goodsList.splice(index, 1, {
                ...this.goodsForm,
                category_name: category ? category.name : '',
                warehouse_name: warehouse ? warehouse.name : ''
              })
              this.$message.success('货品更新成功')
            }
            this.dialogVisible = false
          }, 500)
        } else {
          setTimeout(() => {
            const category = this.categoryList.find(c => c.id === this.goodsForm.category_id)
            const warehouse = this.warehouseList.find(w => w.id === this.goodsForm.warehouse_id)
            const newGoods = {
              ...this.goodsForm,
              id: this.goodsList.length + 1,
              category_name: category ? category.name : '',
              warehouse_name: warehouse ? warehouse.name : ''
            }
            this.goodsList.push(newGoods)
            this.total = this.goodsList.length
            this.$message.success('货品添加成功')
            this.dialogVisible = false
          }, 500)
        }
      } catch (error) {
        this.$message.error('表单验证失败')
      }
    },
    
    // 删除货品
    deleteGoods(row) {
      this.$confirm(`确定删除货品 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          const index = this.goodsList.findIndex(g => g.id === row.id)
          if (index !== -1) {
            this.goodsList.splice(index, 1)
            this.total = this.goodsList.length
            this.$message.success('删除成功')
          }
        }, 500)
      }).catch(() => {})
    },
    
    // 上传前验证
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    },
    
    // 处理上传
    handleUpload(options) {
      const file = options.file
      const reader = new FileReader()
      reader.onload = (e) => {
        // 模拟上传成功，实际项目中应该调用API
        this.goodsForm.image = e.target.result
        this.$message.success('图片上传成功')
      }
      reader.readAsDataURL(file)
    },
    
    // 删除图片
    removeImage() {
      this.goodsForm.image = ''
    },
    
    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchGoodsList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchGoodsList()
    }
  }
}
</script>

<style scoped>
.good-list {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}
.avatar-uploader:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
