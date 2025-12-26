<template>
  <div class="stock-log">
    <el-card>
      <div slot="header" class="clearfix">
        <span>出入库管理</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text"
          @click="addStockLog('inbound')"
        >
          入库
        </el-button>
        <el-button 
          style="float: right; padding: 3px 0; margin-right: 10px;" 
          type="text"
          @click="addStockLog('outbound')"
        >
          出库
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.type" placeholder="请选择操作类型" clearable style="width: 150px;">
            <el-option label="入库" value="inbound"></el-option>
            <el-option label="出库" value="outbound"></el-option>
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
        <el-form-item label="货品">
          <el-input v-model="searchForm.goods_name" placeholder="请输入货品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="handleDateChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table 
        :data="stockLogList" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="type" label="操作类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'inbound' ? 'success' : 'warning'">
              {{ scope.row.type === 'inbound' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goods_name" label="货品名称" width="150"></el-table-column>
        <el-table-column prop="warehouse_name" label="仓库" width="150"></el-table-column>
        <el-table-column prop="quantity" label="数量" width="100"></el-table-column>
        <el-table-column prop="operator" label="对接人" width="120"></el-table-column>
        <el-table-column prop="operate_time" label="操作时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewDetail(scope.row)">查看</el-button>
            <el-button 
              size="mini" 
              type="danger" 
              @click="deleteLog(scope.row)"
              v-if="false"
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
    
    <!-- 出入库编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="stockLogForm" 
        :rules="stockLogRules" 
        ref="stockLogForm" 
        label-width="100px"
      >
        <el-form-item label="操作类型">
          <el-tag :type="stockLogForm.type === 'inbound' ? 'success' : 'warning'" size="medium">
            {{ stockLogForm.type === 'inbound' ? '入库' : '出库' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="仓库" prop="warehouse_id">
          <el-select v-model="stockLogForm.warehouse_id" placeholder="请选择仓库" style="width: 100%;">
            <el-option 
              v-for="item in warehouseList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="货品" prop="goods_id">
          <el-select 
            v-model="stockLogForm.goods_id" 
            placeholder="请选择货品" 
            filterable
            style="width: 100%;"
            @change="handleGoodsChange"
          >
            <el-option 
              v-for="item in filteredGoodsList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentStock }}</span>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number 
            v-model="stockLogForm.quantity" 
            :min="1" 
            style="width: 100%;"
            :max="stockLogForm.type === 'outbound' ? currentStock : undefined"
          ></el-input-number>
          <div v-if="stockLogForm.type === 'outbound' && stockLogForm.quantity > currentStock" style="color: red; margin-top: 5px;">
            出库数量不能超过当前库存
          </div>
        </el-form-item>
        <el-form-item label="对接人" prop="operator">
          <el-input v-model="stockLogForm.operator" placeholder="请输入对接人"></el-input>
        </el-form-item>
        <el-form-item label="操作时间" prop="operate_time">
          <el-date-picker
            v-model="stockLogForm.operate_time"
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注" 
            v-model="stockLogForm.remark">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStockLog">确定</el-button>
      </div>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog
      title="出入库详情"
      :visible.sync="detailVisible"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作类型">
          <el-tag :type="detailData.type === 'inbound' ? 'success' : 'warning'">
            {{ detailData.type === 'inbound' ? '入库' : '出库' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="货品名称">{{ detailData.goods_name }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailData.warehouse_name }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ detailData.quantity }}</el-descriptions-item>
        <el-descriptions-item label="对接人">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailData.operate_time }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
// import { stockApi } from '@/api/stock'
// import { warehouseApi } from '@/api/warehouse'
// import { goodsApi } from '@/api/goods'

export default {
  name: 'StockLogPage',
  data() {
    return {
      stockLogList: [],
      warehouseList: [],
      goodsList: [],
      loading: false,
      dialogVisible: false,
      detailVisible: false,
      dialogTitle: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dateRange: [],
      searchForm: {
        type: '',
        warehouse_id: null,
        goods_name: '',
        start_date: '',
        end_date: ''
      },
      stockLogForm: {
        id: null,
        type: 'inbound',
        warehouse_id: null,
        goods_id: null,
        quantity: 1,
        operator: '',
        operate_time: '',
        remark: ''
      },
      stockLogRules: {
        warehouse_id: [
          { required: true, message: '请选择仓库', trigger: 'change' }
        ],
        goods_id: [
          { required: true, message: '请选择货品', trigger: 'change' }
        ],
        quantity: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        operator: [
          { required: true, message: '请输入对接人', trigger: 'blur' }
        ],
        operate_time: [
          { required: true, message: '请选择操作时间', trigger: 'change' }
        ]
      },
      detailData: {},
      currentStock: 0
    }
  },
  computed: {
    filteredGoodsList() {
      if (!this.stockLogForm.warehouse_id) {
        return []
      }
      return this.goodsList.filter(g => g.warehouse_id === this.stockLogForm.warehouse_id)
    }
  },
  created() {
    // 从路由参数获取搜索关键词
    if (this.$route.query.goods_name) {
      this.searchForm.goods_name = this.$route.query.goods_name
    }
    
    this.fetchWarehouseList()
    this.fetchGoodsList()
    this.fetchStockLogList()
  },
  watch: {
    '$route.query.goods_name': {
      handler(newVal) {
        if (newVal) {
          this.searchForm.goods_name = newVal
          this.fetchStockLogList()
        }
      }
    }
  },
  methods: {
    // 获取仓库列表
    async fetchWarehouseList() {
      this.warehouseList = [
        { id: 1, name: '一号仓库' },
        { id: 2, name: '二号仓库' },
        { id: 3, name: '三号仓库' }
      ]
    },
    
    // 获取货品列表
    async fetchGoodsList() {
      this.goodsList = [
        { id: 1, name: 'iPhone 15', warehouse_id: 1, stock: 50 },
        { id: 2, name: '洗发水', warehouse_id: 2, stock: 200 }
      ]
    },
    
    // 获取出入库记录列表
    async fetchStockLogList() {
      this.loading = true
      
      setTimeout(() => {
        this.stockLogList = [
          {
            id: 1,
            type: 'inbound',
            goods_id: 1,
            goods_name: 'iPhone 15',
            warehouse_id: 1,
            warehouse_name: '一号仓库',
            quantity: 10,
            operator: '张三',
            operate_time: '2024-01-15 10:30:00',
            remark: '新货入库'
          },
          {
            id: 2,
            type: 'outbound',
            goods_id: 2,
            goods_name: '洗发水',
            warehouse_id: 2,
            warehouse_name: '二号仓库',
            quantity: 5,
            operator: '李四',
            operate_time: '2024-01-15 14:20:00',
            remark: '销售出库'
          }
        ]
        this.total = this.stockLogList.length
        this.loading = false
      }, 500)
    },
    
    // 添加入出库记录
    addStockLog(type) {
      this.dialogTitle = type === 'inbound' ? '入库' : '出库'
      this.dialogVisible = true
      this.resetForm()
      this.stockLogForm.type = type
      this.stockLogForm.operate_time = this.formatDateTime(new Date())
    },
    
    // 重置表单
    resetForm() {
      this.stockLogForm = {
        id: null,
        type: 'inbound',
        warehouse_id: null,
        goods_id: null,
        quantity: 1,
        operator: '',
        operate_time: '',
        remark: ''
      }
      this.currentStock = 0
      this.$nextTick(() => {
        if (this.$refs.stockLogForm) {
          this.$refs.stockLogForm.clearValidate()
        }
      })
    },
    
    // 货品选择变化
    handleGoodsChange(goodsId) {
      const goods = this.goodsList.find(g => g.id === goodsId)
      if (goods) {
        this.currentStock = goods.stock || 0
      }
    },
    
    // 保存出入库记录
    async saveStockLog() {
      try {
        await this.$refs.stockLogForm.validate()
        
        // 出库时检查库存
        if (this.stockLogForm.type === 'outbound' && this.stockLogForm.quantity > this.currentStock) {
          this.$message.error('出库数量不能超过当前库存')
          return
        }
        
        setTimeout(() => {
          const goods = this.goodsList.find(g => g.id === this.stockLogForm.goods_id)
          const warehouse = this.warehouseList.find(w => w.id === this.stockLogForm.warehouse_id)
          
          if (this.stockLogForm.id) {
            // 编辑
            const index = this.stockLogList.findIndex(l => l.id === this.stockLogForm.id)
            if (index !== -1) {
              this.stockLogList.splice(index, 1, {
                ...this.stockLogForm,
                goods_name: goods ? goods.name : '',
                warehouse_name: warehouse ? warehouse.name : ''
              })
              this.$message.success('记录更新成功')
            }
          } else {
            // 新增
            const newLog = {
              ...this.stockLogForm,
              id: this.stockLogList.length + 1,
              goods_name: goods ? goods.name : '',
              warehouse_name: warehouse ? warehouse.name : ''
            }
            this.stockLogList.push(newLog)
            this.total = this.stockLogList.length
            
            // 更新库存
            if (goods) {
              if (this.stockLogForm.type === 'inbound') {
                goods.stock = (goods.stock || 0) + this.stockLogForm.quantity
              } else {
                goods.stock = Math.max(0, (goods.stock || 0) - this.stockLogForm.quantity)
              }
            }
            
            this.$message.success('记录添加成功')
          }
          this.dialogVisible = false
        }, 500)
      } catch (error) {
        this.$message.error('表单验证失败')
      }
    },
    
    // 查看详情
    viewDetail(row) {
      this.detailData = { ...row }
      this.detailVisible = true
    },
    
    // 删除记录
    deleteLog(row) {
      this.$confirm(`确定删除这条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          const index = this.stockLogList.findIndex(l => l.id === row.id)
          if (index !== -1) {
            this.stockLogList.splice(index, 1)
            this.total = this.stockLogList.length
            this.$message.success('删除成功')
          }
        }, 500)
      }).catch(() => {})
    },
    
    // 日期范围变化
    handleDateChange(val) {
      if (val && val.length === 2) {
        this.searchForm.start_date = val[0]
        this.searchForm.end_date = val[1]
      } else {
        this.searchForm.start_date = ''
        this.searchForm.end_date = ''
      }
    },
    
    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.fetchStockLogList()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        type: '',
        warehouse_id: null,
        goods_name: '',
        start_date: '',
        end_date: ''
      }
      this.dateRange = []
      this.handleSearch()
    },
    
    // 格式化日期时间
    formatDateTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    
    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchStockLogList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchStockLogList()
    }
  }
}
</script>

<style scoped>
.stock-log {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
</style>