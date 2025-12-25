<template>
  <div class="transfer-goods">
    <el-card>
      <div slot="header" class="clearfix">
        <span>调货管理</span>
      </div>
      
      <el-form 
        :model="transferForm" 
        :rules="transferRules" 
        ref="transferForm" 
        label-width="120px"
        style="max-width: 800px;"
      >
        <el-form-item label="源仓库" prop="from_warehouse_id">
          <el-select v-model="transferForm.from_warehouse_id" placeholder="请选择源仓库" style="width: 100%;" @change="handleFromWarehouseChange">
            <el-option 
              v-for="item in warehouseList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标仓库" prop="to_warehouse_id">
          <el-select v-model="transferForm.to_warehouse_id" placeholder="请选择目标仓库" style="width: 100%;" @change="handleToWarehouseChange">
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
            v-model="transferForm.goods_id" 
            placeholder="请选择货品" 
            filterable
            style="width: 100%;"
            @change="handleGoodsChange"
          >
            <el-option 
              v-for="item in fromGoodsList" 
              :key="item.id" 
              :label="`${item.name} (库存: ${item.stock})`" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="源仓库库存">
          <span>{{ fromStock }}</span>
        </el-form-item>
        
        <el-form-item label="调货数量" prop="quantity">
          <el-input-number 
            v-model="transferForm.quantity" 
            :min="1" 
            :max="fromStock"
            style="width: 100%;"
          ></el-input-number>
          <div v-if="transferForm.quantity > fromStock" style="color: red; margin-top: 5px;">
            调货数量不能超过源仓库库存
          </div>
        </el-form-item>
        
        <el-form-item label="对接人" prop="operator">
          <el-input v-model="transferForm.operator" placeholder="请输入对接人"></el-input>
        </el-form-item>
        
        <el-form-item label="调货时间" prop="transfer_time">
          <el-date-picker
            v-model="transferForm.transfer_time"
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
            v-model="transferForm.remark">
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitTransfer">提交调货</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 调货记录列表 -->
      <el-divider>调货记录</el-divider>
      
      <el-table 
        :data="transferList" 
        v-loading="loading"
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="goods_name" label="货品名称" width="150"></el-table-column>
        <el-table-column prop="from_warehouse_name" label="源仓库" width="150"></el-table-column>
        <el-table-column prop="to_warehouse_name" label="目标仓库" width="150"></el-table-column>
        <el-table-column prop="quantity" label="数量" width="100"></el-table-column>
        <el-table-column prop="operator" label="对接人" width="120"></el-table-column>
        <el-table-column prop="transfer_time" label="调货时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
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
  </div>
</template>

<script>
// import { stockApi } from '@/api/stock'
// import { warehouseApi } from '@/api/warehouse'
// import { goodsApi } from '@/api/goods'

export default {
  name: 'TransferGoodsPage',
  data() {
    return {
      warehouseList: [],
      goodsList: [],
      transferList: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      transferForm: {
        from_warehouse_id: null,
        to_warehouse_id: null,
        goods_id: null,
        quantity: 1,
        operator: '',
        transfer_time: '',
        remark: ''
      },
      transferRules: {
        from_warehouse_id: [
          { required: true, message: '请选择源仓库', trigger: 'change' }
        ],
        to_warehouse_id: [
          { required: true, message: '请选择目标仓库', trigger: 'change' },
          { validator: (rule, value, callback) => {
            if (value === this.transferForm.from_warehouse_id) {
              callback(new Error('目标仓库不能与源仓库相同'))
            } else {
              callback()
            }
          }, trigger: 'change' }
        ],
        goods_id: [
          { required: true, message: '请选择货品', trigger: 'change' }
        ],
        quantity: [
          { required: true, message: '请输入调货数量', trigger: 'blur' }
        ],
        operator: [
          { required: true, message: '请输入对接人', trigger: 'blur' }
        ],
        transfer_time: [
          { required: true, message: '请选择调货时间', trigger: 'change' }
        ]
      },
      fromStock: 0
    }
  },
  computed: {
    fromGoodsList() {
      if (!this.transferForm.from_warehouse_id) {
        return []
      }
      return this.goodsList.filter(g => g.warehouse_id === this.transferForm.from_warehouse_id)
    }
  },
  created() {
    this.fetchWarehouseList()
    this.fetchGoodsList()
    this.fetchTransferList()
    this.transferForm.transfer_time = this.formatDateTime(new Date())
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
        { id: 2, name: '洗发水', warehouse_id: 2, stock: 200 },
        { id: 3, name: '笔记本电脑', warehouse_id: 1, stock: 30 }
      ]
    },
    
    // 获取调货记录列表
    async fetchTransferList() {
      this.loading = true
      
      setTimeout(() => {
        this.transferList = [
          {
            id: 1,
            goods_id: 1,
            goods_name: 'iPhone 15',
            from_warehouse_id: 1,
            from_warehouse_name: '一号仓库',
            to_warehouse_id: 2,
            to_warehouse_name: '二号仓库',
            quantity: 10,
            operator: '张三',
            transfer_time: '2024-01-15 16:00:00',
            remark: '调货补充'
          }
        ]
        this.total = this.transferList.length
        this.loading = false
      }, 500)
    },
    
    // 源仓库变化
    handleFromWarehouseChange() {
      this.transferForm.goods_id = null
      this.fromStock = 0
    },
    
    // 目标仓库变化
    handleToWarehouseChange() {
      // 验证不能与源仓库相同
      if (this.transferForm.to_warehouse_id === this.transferForm.from_warehouse_id) {
        this.$message.warning('目标仓库不能与源仓库相同')
        this.transferForm.to_warehouse_id = null
      }
    },
    
    // 货品选择变化
    handleGoodsChange(goodsId) {
      const goods = this.goodsList.find(g => g.id === goodsId && g.warehouse_id === this.transferForm.from_warehouse_id)
      if (goods) {
        this.fromStock = goods.stock || 0
        if (this.transferForm.quantity > this.fromStock) {
          this.transferForm.quantity = this.fromStock
        }
      }
    },
    
    // 提交调货
    async submitTransfer() {
      try {
        await this.$refs.transferForm.validate()
        
        if (this.transferForm.quantity > this.fromStock) {
          this.$message.error('调货数量不能超过源仓库库存')
          return
        }
        
        if (this.transferForm.from_warehouse_id === this.transferForm.to_warehouse_id) {
          this.$message.error('源仓库和目标仓库不能相同')
          return
        }
        
        setTimeout(() => {
          const goods = this.goodsList.find(g => g.id === this.transferForm.goods_id)
          const fromWarehouse = this.warehouseList.find(w => w.id === this.transferForm.from_warehouse_id)
          const toWarehouse = this.warehouseList.find(w => w.id === this.transferForm.to_warehouse_id)
          
          // 添加调货记录
          const newTransfer = {
            ...this.transferForm,
            id: this.transferList.length + 1,
            goods_name: goods ? goods.name : '',
            from_warehouse_name: fromWarehouse ? fromWarehouse.name : '',
            to_warehouse_name: toWarehouse ? toWarehouse.name : ''
          }
          this.transferList.push(newTransfer)
          this.total = this.transferList.length
          
          // 更新库存：源仓库减少，目标仓库增加
          if (goods) {
            // 源仓库减少
            goods.stock = Math.max(0, (goods.stock || 0) - this.transferForm.quantity)
            
            // 目标仓库增加（如果目标仓库已有该货品）
            const toGoods = this.goodsList.find(g => g.id === this.transferForm.goods_id && g.warehouse_id === this.transferForm.to_warehouse_id)
            if (toGoods) {
              toGoods.stock = (toGoods.stock || 0) + this.transferForm.quantity
            } else {
              // 如果目标仓库没有该货品，创建新记录
              const newGoods = {
                ...goods,
                id: this.goodsList.length + 1,
                warehouse_id: this.transferForm.to_warehouse_id,
                stock: this.transferForm.quantity
              }
              this.goodsList.push(newGoods)
            }
          }
          
          this.$message.success('调货成功！已自动生成对应的出入库记录')
          this.resetForm()
        }, 500)
      } catch (error) {
        this.$message.error('表单验证失败')
      }
    },
    
    // 重置表单
    resetForm() {
      this.transferForm = {
        from_warehouse_id: null,
        to_warehouse_id: null,
        goods_id: null,
        quantity: 1,
        operator: '',
        transfer_time: this.formatDateTime(new Date()),
        remark: ''
      }
      this.fromStock = 0
      this.$nextTick(() => {
        if (this.$refs.transferForm) {
          this.$refs.transferForm.clearValidate()
        }
      })
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
      this.fetchTransferList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchTransferList()
    }
  }
}
</script>

<style scoped>
.transfer-goods {
  padding: 20px;
}
</style>