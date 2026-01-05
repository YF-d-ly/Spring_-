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
        <el-form-item label="源仓库" prop="sourceWarehouseId">
          <el-select v-model="transferForm.sourceWarehouseId" placeholder="请选择源仓库" style="width: 100%;" @change="handleFromWarehouseChange">
            <el-option 
              v-for="item in warehouseList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标仓库" prop="targetWarehouseId">
          <el-select v-model="transferForm.targetWarehouseId" placeholder="请选择目标仓库" style="width: 100%;" @change="handleToWarehouseChange">
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
            v-model="transferForm.goodsId" 
            placeholder="请选择货品" 
            filterable
            style="width: 100%;"
            @change="handleGoodsChange"
          >
            <el-option 
              v-for="item in goodsList" 
              :key="item.id" 
              :label="`${item.name}` " 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="源仓库库存">
          <span>{{ fromStock }}</span>
        </el-form-item>
        
        <el-form-item label="调货数量" prop="num">
          <el-input-number 
            v-model="transferForm.num" 
            :min="1" 
            :max="fromStock"
            style="width: 100%;"
          ></el-input-number>
          <div v-if="transferForm.num > fromStock" style="color: red; margin-top: 5px;">
            调货数量不能超过源仓库库存
          </div>
        </el-form-item>
        
        <el-form-item label="对接人" prop="operator">
          <el-input v-model="transferForm.operator" placeholder="请输入对接人"></el-input>
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
        <el-table-column prop="outquantity" label="出库数量" width="100"></el-table-column>
        <el-table-column prop="inquantity" label="入库数量" width="100"></el-table-column>
        <el-table-column prop="outboundOperator" label="出库对接人" width="120"></el-table-column>
        <el-table-column prop="inboundOperator" label="入库对接人" width="120"></el-table-column>
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
import { stockApi } from '@/api/stock'
import { warehouseApi } from '@/api/warehouse'
import { goodsApi } from '@/api/goods'

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
        sourceWarehouseId: null,
        targetWarehouseId: null,
        goodsId: null,
        num: 1,
        operator: '',
        remark: ''
      },
      transferRules: {
        sourceWarehouseId: [
          { required: true, message: '请选择源仓库', trigger: 'change' }
        ],
        targetWarehouseId: [
          { required: true, message: '请选择目标仓库', trigger: 'change' },
          { validator: (rule, value, callback) => {
            if (value === this.transferForm.sourceWarehouseId) {
              callback(new Error('目标仓库不能与源仓库相同'))
            } else {
              callback()
            }
          }, trigger: 'change' }
        ],
        goodsId: [
          { required: true, message: '请选择货品', trigger: 'change' }
        ],
        num: [
          { required: true, message: '请输入调货数量', trigger: 'blur' }
        ],
        operator: [
          { required: true, message: '请输入对接人', trigger: 'blur' }
        ]
      },
      fromStock: 0
    }
  },
  computed: {
    fromGoodsList() {
      if (!this.transferForm.sourceWarehouseId) {
        return []
      }
      return this.goodsList.filter(g => g.warehouseId === this.transferForm.sourceWarehouseId)
    }
  },
  created() {
    this.fetchWarehouseList()
    this.fetchTransferList()
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
    
    // 获取货品列表 - 根据仓库ID获取
    async fetchGoodsList() {
      try {
        if (!this.transferForm.sourceWarehouseId) {
          this.goodsList = []
          return
        }
        
        // 修改API调用路径以匹配后端接口
        const res = await goodsApi.getGoodsByWarehouse(this.transferForm.sourceWarehouseId)
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
    
    // 获取调货记录列表
    async fetchTransferList() {
      this.loading = true
      
      try {
        const res = await warehouseApi.getTransferLog()
        if (res.data && Array.isArray(res.data)) {
          // 转换后端返回的数据格式
          this.transferList = res.data.map(item => ({
            id: item.transferId,
            goods_id: item.goodsId,
            goods_name: item.goodsName,
            from_warehouse_id: item.sourceWarehouseId,
            from_warehouse_name: item.outboundWarehouseName,
            to_warehouse_id: item.targetWarehouseId,
            to_warehouse_name: item.inboundWarehouseName,
            inquantity: item.inboundNum,
            outquantity: item.outboundNum,
            outboundOperator: item.outboundOperator,
            inboundOperator: item.inboundOperator,
            transfer_time: item.outboundTime,
            remark: item.remark
          }))
          this.total = this.transferList.length
        } else {
          this.$message.error('获取调货记录失败')
        }
      } catch (error) {
        console.error('获取调货记录失败:', error)
        this.$message.error('获取调货记录失败')
      } finally {
        this.loading = false
      }
    },
    
    // 源仓库变化
    handleFromWarehouseChange() {
      this.transferForm.goodsId = null
      this.fromStock = 0
      // 在源仓库变化时重新获取货品列表
      this.fetchGoodsList()
    },
    
    // 目标仓库变化
    handleToWarehouseChange() {
      // 验证不能与源仓库相同
      if (this.transferForm.targetWarehouseId === this.transferForm.sourceWarehouseId) {
        this.$message.warning('目标仓库不能与源仓库相同')
        this.transferForm.targetWarehouseId = null
      }
    },
    
    // 货品选择变化
    handleGoodsChange(goodsId) {
      const goods = this.goodsList.find(g => g.id === goodsId)
      if (goods) {
        this.fromStock = goods.stock || 0
        if (this.transferForm.num > this.fromStock) {
          this.transferForm.num = this.fromStock
        }
      }
    },

    // 提交调货
    async submitTransfer() {
      try {
        await this.$refs.transferForm.validate()
        
        if (this.transferForm.num > this.fromStock) {
          this.$message.error('调货数量不能超过源仓库库存')
          return
        }
        
        if (this.transferForm.sourceWarehouseId === this.transferForm.targetWarehouseId) {
          this.$message.error('源仓库和目标仓库不能相同')
          return
        }
        
        this.submitting = true
        
        // 准备调货数据 (已匹配 DTO)
        const transferData = {
          sourceWarehouseId: this.transferForm.sourceWarehouseId,
          targetWarehouseId: this.transferForm.targetWarehouseId,
          goodsId: this.transferForm.goodsId,
          num: this.transferForm.num,
          operator: this.transferForm.operator,
          remark: this.transferForm.remark
        }
        
        // 发送调货请求
        const res = await stockApi.transferGoods(transferData)
        console.log('调货响应:', res)
        
        if (res && (res.code === 0 || res.code === 200)) {
          this.$message.success('调货成功！')
          this.resetForm()
          // 重新获取调货记录
          this.fetchTransferList()
        } else {
          this.$message.error(res.message || '调货失败')
        }
      } catch (error) {
        console.error('提交调货失败:', error)
        this.$message.error('提交调货失败: ' + (error.message || '未知错误'))
      } finally {
        this.submitting = false
      }
    },
    
    // 重置表单
    resetForm() {
      this.transferForm = {
        sourceWarehouseId: null,
        targetWarehouseId: null,
        goodsId: null,
        num: 1,
        operator: '',
        remark: ''
      }
      this.fromStock = 0
      this.goodsList = []
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