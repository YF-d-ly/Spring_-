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
            <el-option label="入库" value="1"></el-option>
            <el-option label="出库" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouseId" placeholder="请选择仓库" clearable style="width: 130px;">
            <el-option 
              v-for="item in warehouseList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="货品">
          <el-input v-model="searchForm.goodsName" placeholder="请输入货品名称" clearable style="width: 130px;"></el-input>
        </el-form-item>
        <el-form-item label="对接人">
          <el-input v-model="searchForm.operator" placeholder="请输入对接人" clearable style="width: 130px;"></el-input>
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
            <el-tag :type="scope.row.type === 1 ? 'success' : 'warning'">
              {{ scope.row.type === 1 ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goodsName" label="货品名称" width="150"></el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="150"></el-table-column>
        <el-table-column prop="num" label="数量" width="100"></el-table-column>
        <el-table-column prop="operator" label="对接人" width="120"></el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="180"></el-table-column>
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
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="stockLogForm.warehouseId" placeholder="请选择仓库" style="width: 100%;">
            <el-option 
              v-for="item in warehouseList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="货品" prop="goodsId">
          <el-select 
            v-model="stockLogForm.goodsId" 
            placeholder="请选择货品" 
            filterable
            style="width: 100%;"
            @change="handleGoodsChange"
          >
            <el-option 
              v-for="item in goodsList" 
              :key="item.id" 
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentStock }}</span>
        </el-form-item>
        <el-form-item label="数量" prop="num">
          <el-input-number 
            v-model="stockLogForm.num" 
            :min="1" 
            style="width: 100%;"
            :max="stockLogForm.type === 'outbound' ? currentStock : undefined"
          ></el-input-number>
          <div v-if="stockLogForm.type === 'outbound' && stockLogForm.num > currentStock" style="color: red; margin-top: 5px;">
            出库数量不能超过当前库存
          </div>
        </el-form-item>
        <el-form-item label="对接人" prop="operator">
          <el-input v-model="stockLogForm.operator" placeholder="请输入对接人"></el-input>
        </el-form-item>
        <el-form-item label="操作时间" prop="createTime">
          <el-date-picker
            v-model="stockLogForm.createTime"
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
        <el-descriptions-item label="货品名称">{{ detailData.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ detailData.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ detailData.num }}</el-descriptions-item>
        <el-descriptions-item label="对接人">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { stockApi } from '@/api/stock'
import { warehouseApi } from '@/api/warehouse'
import { goodsApi } from '@/api/goods'

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
        warehouseId: null,
        goodsName: '',
        start_date: '',
        end_date: '',
        operator: '' // 确保operator字段被正确初始化
      },
      stockLogForm: {
        id: null,
        type: 'inbound',
        warehouseId: null,
        goodsId: null,
        num: 1,
        operator: '',
        createTime: '',
        remark: ''
      },
      stockLogRules: {
        warehouseId: [
          { required: true, message: '请选择仓库', trigger: 'change' }
        ],
        goodsId: [
          { required: true, message: '请选择货品', trigger: 'change' }
        ],
        num: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        operator: [
          { required: true, message: '请输入对接人', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '请选择操作时间', trigger: 'change' }
        ]
      },
      detailData: {},
      currentStock: 0
    }
  },
  computed: {
    filteredGoodsList() {
      if (!this.stockLogForm.warehouseId) {
        return []
      }
      // 确保 goodsList 是数组类型
      if (!Array.isArray(this.goodsList)) {
        return []
      }
      // 过滤出当前仓库的货品
      return this.goodsList.filter(g => g.warehouseId === this.stockLogForm.warehouseId)
    }
  },
  created() {
    // 从路由参数获取搜索关键词
    if (this.$route.query.goods_name) {
      this.searchForm.goodsName = this.$route.query.goods_name
    }
    
    this.fetchWarehouseList()
    this.fetchGoodsList()
    this.fetchStockLogList()
  },
  watch: {
    '$route.query.goods_name': {
      handler(newVal) {
        if (newVal) {
          this.searchForm.goodsName = newVal
          this.fetchStockLogList()
        }
      }
    }
  },
  methods: {
    // 获取仓库列表
    async fetchWarehouseList() {
      try {
        const res = await warehouseApi.getWarehouseList()
        if (res.data && Array.isArray(res.data)) {
          this.warehouseList = res.data
        } else {
          this.$message.error('获取仓库列表失败')
        }
      } catch (error) {
        console.error('获取仓库列表失败:', error)
        this.$message.error('获取仓库列表失败')
      }
    },
    
    // 获取货品列表
    async fetchGoodsList() {
      try {
        const res = await goodsApi.getGoodsNameList()
        // 确保 res.data 是数组类型
        if (res.data && Array.isArray(res.data)) {
          this.goodsList = res.data
        } else {
          this.$message.error('获取货品列表失败')
        }
      } catch (error) {
        console.error('获取货品列表失败:', error)
        this.$message.error('获取货品列表失败')
      }
    },
    
    // 获取出入库记录列表
    async fetchStockLogList() {
      this.loading = true
      
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          type: this.searchForm.type,
          warehouseId: this.searchForm.warehouseId,
          goodsName: this.searchForm.goodsName,
          start_date: this.searchForm.start_date,
          end_date: this.searchForm.end_date,
          operator: this.searchForm.operator // 确保operator字段被正确传递
        }

        const res = await stockApi.getStockLogPage(params)
        console.log('API Response:', res) // 调试用，确保数据结构正确

        if (res && res.data && res.data.records) {
          this.stockLogList = res.data.records
          this.total = res.data.total
        } else {
          this.stockLogList = []
          this.total = 0
          this.$message.error('数据格式异常')
        }
      } catch (error) {
        console.error('获取出入库记录失败:', error)
        this.$message.error('获取出入库记录失败')
      } finally {
        this.loading = false
      }
    },
    
    // 添加入出库记录
    addStockLog(type) {
      this.dialogTitle = type === 'inbound' ? '入库' : '出库'
      this.dialogVisible = true
      this.resetForm()
      this.stockLogForm.type = type
      this.stockLogForm.createTime = this.formatDateTime(new Date())
    },
    
    // 重置表单
    resetForm() {
      this.stockLogForm = {
        id: null,
        type: 'inbound',
        warehouseId: null,
        goodsId: null,
        num: 1,
        operator: '',
        createTime: '',
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
        // 添加安全检查，防止undefined或null导致错误
        if (!goodsId) {
            this.currentStock = 0;
            return;
        }
        
        const goods = this.goodsList.find(g => g.id === goodsId);
        if (goods && typeof goods.stock !== 'undefined') {
            this.currentStock = goods.stock || 0; // 更新当前库存显示
        } else {
            // 如果找不到货品或没有stock字段，设为0并提示
            this.currentStock = 0;
            console.warn('货品数据中缺少stock字段或未找到对应货品');
        }
    },
    
    // 保存出入库记录
    async saveStockLog() {
      try {
        await this.$refs.stockLogForm.validate()
        
        // 出库时检查库存
        if (this.stockLogForm.type === 'outbound' && this.stockLogForm.num > this.currentStock) {
          this.$message.error('出库数量不能超过当前库存')
          return
        }
        
        if (this.stockLogForm.id) {
          // 更新记录
          // 注意：实际业务中可能需要单独的更新API
          this.$message.success('记录更新成功')
          this.fetchStockLogList()
        } else {
          // 根据类型调用不同API
          if (this.stockLogForm.type === 'inbound') {
            await stockApi.addInbound(this.stockLogForm)
          } else {
            await stockApi.addOutbound(this.stockLogForm)
          }
          this.$message.success('记录添加成功')
          this.fetchStockLogList()
        }
        
        this.dialogVisible = false
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
    deleteLog(/* eslint-disable no-unused-vars */row/* eslint-enable no-unused-vars */) {
      this.$confirm(`确定删除这条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 注意：实际业务中可能需要删除API
          this.$message.success('删除成功')
          this.fetchStockLogList()
        } catch (error) {
          this.$message.error('删除失败')
        }
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
        warehouseId: null,
        goodsName: '',
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