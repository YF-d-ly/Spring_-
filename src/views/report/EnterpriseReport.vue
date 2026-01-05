<template>
  <div class="enterprise-report">
    <el-card>
      <div slot="header" class="clearfix">
        <span>企业统计分析</span>
      </div>
      
      <!-- 查询条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
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
          <span>每日货品进出情况</span>
        </div>
        <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
      </el-card>
      
      <!-- 排行榜 -->
      <el-card style="margin-top: 20px;">
        <div slot="header">
          <span>进出货物数量前十排行</span>
        </div>
        <el-table 
          :data="rankingList" 
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column type="index" label="排名" width="80"></el-table-column>
          <el-table-column prop="goodsName" label="货品名称" width="200"></el-table-column>
          <el-table-column prop="warehouse_name" label="仓库" width="150"></el-table-column>
          <el-table-column prop="inboundTotal" label="入库数量" width="120"></el-table-column>
          <el-table-column prop="outboundTotal" label="出库数量" width="120"></el-table-column>
          <el-table-column prop="totalInOut" label="总数量" width="120">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.totalInOut > 0 ? '#67C23A' : '#F56C6C' }">
                {{ scope.row.totalInOut > 0 ? '+' : '' }}{{ scope.row.totalInOut }}
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

export default {
  name: 'EnterpriseReportPage',
  data() {
    return {
      searchForm: {
        startDate: '',
        endDate: ''
      },
      dateRange: [],
      loading: false,
      chartInstance: null,
      rankingList: []
    }
  },
  created() {
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
    this.fetchData()
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  methods: {
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
      this.loading = true
      
      try {
        // 1. 获取排行榜数据
        const rankRes = await reportApi.getGoodsTop10(this.searchForm)
        const rankData = rankRes.data || []
        
        // 更新排行榜数据
        this.rankingList = rankData.map(item => ({
          goodsName: item.goodsName,
          warehouse_name: item.warehouseName || item.warehouse_name || '-',
          inboundTotal: item.inboundTotal,
          outboundTotal: item.outboundTotal,
          totalInOut: (item.inboundTotal || 0) - (item.outboundTotal || 0)
        }))

        // 2. 获取每日趋势数据
        const trendRes = await reportApi.getCompanyDailyTrend(this.searchForm)
        const trendData = trendRes.data || []
        
        // 准备图表数据
        // 后端返回的数据字段为 outboundTotal, inboundTotal, date
        const dates = trendData.map(item => item.date)
        const inboundData = trendData.map(item => item.inboundTotal)
        const outboundData = trendData.map(item => item.outboundTotal)
        
        // 更新图表 (折线图)
        this.updateChart(dates, inboundData, outboundData)
        
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },
    
    // 更新图表 (折线图)
    updateChart(dates, inboundData, outboundData) {
      const option = {
        title: {
          text: '每日货品进出情况',
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
          data: dates,
          axisLabel: {
            interval: 'auto',
            rotate: 30
          }
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
        this.searchForm.startDate = val[0]
        this.searchForm.endDate = val[1]
      } else {
        this.searchForm.startDate = ''
        this.searchForm.endDate = ''
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
.enterprise-report {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
</style>