<template>
  <div class="warehouse-report">
    <el-card>
      <div slot="header" class="clearfix">
        <span>仓库统计分析</span>
      </div>
      
      <!-- 查询条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouse_id" placeholder="请选择仓库" style="width: 200px;">
            <el-option 
              v-for="item in warehouseList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
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
      
      <!-- 折线图 -->
      <el-card style="margin-top: 20px;">
        <div slot="header">
          <span>{{ selectedWarehouseName }}每日货品进出情况</span>
        </div>
        <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
      </el-card>
      
      <!-- 排行榜 -->
      <el-card style="margin-top: 20px;">
        <div slot="header">
          <span>{{ selectedWarehouseName }}进出货物数量前十排行</span>
        </div>
        <el-table 
          :data="rankingList" 
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column type="index" label="排名" width="80"></el-table-column>
          <el-table-column prop="goods_name" label="货品名称" width="200"></el-table-column>
          <el-table-column prop="inbound_quantity" label="入库数量" width="120"></el-table-column>
          <el-table-column prop="outbound_quantity" label="出库数量" width="120"></el-table-column>
          <el-table-column prop="total_quantity" label="总数量" width="120">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.total_quantity > 0 ? '#67C23A' : '#F56C6C' }">
                {{ scope.row.total_quantity > 0 ? '+' : '' }}{{ scope.row.total_quantity }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { reportApi } from '@/api/report'
import { warehouseApi } from '@/api/warehouse'

export default {
  name: 'WarehouseReportPage',
  data() {
    return {
      warehouseList: [],
      searchForm: {
        warehouse_id: null,
        start_date: '',
        end_date: ''
      },
      dateRange: [],
      loading: false,
      chartInstance: null,
      rankingList: []
    }
  },
  computed: {
    selectedWarehouseName() {
      const warehouse = this.warehouseList.find(w => w.id === this.searchForm.warehouse_id)
      return warehouse ? warehouse.name : '请选择仓库'
    }
  },
  created() {
    this.fetchWarehouseList()
    // 默认查询最近30天
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    this.dateRange = [
      this.formatDate(startDate),
      this.formatDate(endDate)
    ]
    this.handleDateChange(this.dateRange)
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
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
      
      // 默认选择第一个仓库
      if (this.warehouseList.length > 0) {
        this.searchForm.warehouse_id = this.warehouseList[0].id
        this.fetchData()
      }
    },
    
    // 初始化图表
    initChart() {
      this.chartInstance = echarts.init(this.$refs.chartContainer)
      window.addEventListener('resize', () => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      })
    },
    
    // 获取数据
    async fetchData() {
      if (!this.searchForm.warehouse_id) {
        this.$message.warning('请先选择仓库')
        return
      }

      this.loading = true

      try {
        // 获取仓库内货物排行数据
        const rankingRes = await reportApi.getWarehouseGoodsTop10(this.searchForm.warehouse_id)
        if (rankingRes.data && Array.isArray(rankingRes.data)) {
          this.rankingList = rankingRes.data.map(item => ({
            goods_name: item.goodsName,
            stock: item.stock,
            price: item.price,
            inbound_quantity: item.inboundNum,
            outbound_quantity: item.outboundNum,
            total_quantity: item.inboundNum + item.outboundNum,
            categoryName: item.categoryName
          }))
        } else {
          this.$message.error('获取货物排行数据失败')
        }

        // 获取仓库每日进出趋势数据
        const trendParams = {
          warehouseId: this.searchForm.warehouse_id,
          startDate: this.searchForm.start_date,
          endDate: this.searchForm.end_date
        }
        const trendRes = await reportApi.getWarehouseDailyTrend(trendParams)
        if (trendRes.data && Array.isArray(trendRes.data)) {
          const dates = trendRes.data.map(item => item.date)
          const inboundData = trendRes.data.map(item => item.inboundNum)
          const outboundData = trendRes.data.map(item => item.outboundNum)
          this.updateChart(dates, inboundData, outboundData)
        } else {
          this.$message.error('获取趋势数据失败')
        }
      } catch (error) {
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },
    
    // 更新图表
    updateChart(dates, inboundData, outboundData) {
      const option = {
        title: {
          text: `${this.selectedWarehouseName}每日货品进出情况`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['入库', '出库'],
          bottom: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates
        },
        yAxis: {
          type: 'value',
          name: '数量'
        },
        series: [
          {
            name: '入库',
            type: 'line',
            data: inboundData,
            smooth: true,
            itemStyle: { color: '#67C23A' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                  { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
                ]
              }
            }
          },
          {
            name: '出库',
            type: 'line',
            data: outboundData,
            smooth: true,
            itemStyle: { color: '#F56C6C' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
                  { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
                ]
              }
            }
          }
        ]
      }
      
      this.chartInstance.setOption(option)
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
    
    // 查询
    handleSearch() {
      this.fetchData()
    },
    
    // 重置搜索
    resetSearch() {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      this.dateRange = [
        this.formatDate(startDate),
        this.formatDate(endDate)
      ]
      this.handleDateChange(this.dateRange)
      if (this.warehouseList.length > 0) {
        this.searchForm.warehouse_id = this.warehouseList[0].id
      }
      this.handleSearch()
    },
    
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.warehouse-report {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
</style>

