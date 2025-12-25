<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in stats" :key="index">
        <el-card class="stat-card" :class="`stat-card-${index}`">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-desc">
                <span :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
                  <i :class="stat.trend > 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                  {{ stat.trend > 0 ? '增长' : '减少' }}{{ Math.abs(stat.trend) }}{{ stat.unit }}
                </span>
              </div>
            </div>
            <div class="stat-icon">
              <i :class="stat.icon" :style="{ color: stat.color }"></i>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和表格区域 -->
    <el-row :gutter="20" class="content-row">
      <!-- 左侧：最近出入库记录 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="table-card">
          <div slot="header" class="card-header">
            <span>最近出入库记录</span>
            <el-button type="text" @click="$router.push('/stock/log')">查看全部</el-button>
          </div>
          <el-table :data="recentLogs" style="width: 100%" v-loading="loading">
            <el-table-column prop="goods_name" label="货品名称" width="150"></el-table-column>
            <el-table-column prop="warehouse_name" label="仓库" width="100"></el-table-column>
            <el-table-column prop="type" label="类型" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.type === 'inbound' ? 'success' : 'warning'" size="small">
                  {{ scope.row.type === 'inbound' ? '入库' : '出库' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
            <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
            <el-table-column prop="operate_time" label="时间" width="150"></el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="viewDetail(scope.row)">
                  <i class="el-icon-view"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="5"
            layout="prev, pager, next"
            :total="totalLogs"
            small
            style="margin-top: 15px; text-align: right;"
          >
          </el-pagination>
        </el-card>
      </el-col>

      <!-- 右侧：出入库趋势图 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>出入库趋势</span>
            <el-button type="text" icon="el-icon-setting"></el-button>
          </div>
          <div ref="trendChart" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部：通知和快速操作 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="notification-card">
          <div slot="header">
            <span>通知</span>
            <el-badge :value="notifications.length" class="notification-badge"></el-badge>
          </div>
          <div class="notification-list">
            <div 
              v-for="(notification, index) in notifications" 
              :key="index" 
              class="notification-item"
            >
              <div class="notification-icon">
                <i :class="notification.icon" :style="{ color: notification.color }"></i>
              </div>
              <div class="notification-content">
                <div class="notification-text">{{ notification.text }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="quick-actions-card">
          <div slot="header">快速操作</div>
          <div class="quick-actions">
            <el-button 
              v-for="action in quickActions" 
              :key="action.path"
              :type="action.type" 
              :icon="action.icon"
              @click="$router.push(action.path)"
              class="action-btn"
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
// import { stockApi } from '@/api/stock'

export default {
  name: 'DashboardPage',
  data() {
    return {
      loading: false,
      currentPage: 1,
      totalLogs: 0,
      trendChart: null,
      stats: [
        {
          title: '总仓库数',
          value: '12',
          trend: 2,
          unit: '个',
          icon: 'el-icon-warehouse',
          color: '#409EFF'
        },
        {
          title: '总货品数',
          value: '1,234',
          trend: 156,
          unit: '件',
          icon: 'el-icon-goods',
          color: '#67C23A'
        },
        {
          title: '本月入库',
          value: '5,678',
          trend: 234,
          unit: '件',
          icon: 'el-icon-upload2',
          color: '#E6A23C'
        },
        {
          title: '本月出库',
          value: '4,567',
          trend: 189,
          unit: '件',
          icon: 'el-icon-download',
          color: '#F56C6C'
        }
      ],
      recentLogs: [],
      notifications: [
        {
          text: '张三完成了iPhone 15的入库操作，数量：50',
          time: '2分钟前',
          icon: 'el-icon-success',
          color: '#67C23A'
        },
        {
          text: '李四完成了洗发水的出库操作，数量：20',
          time: '15分钟前',
          icon: 'el-icon-warning',
          color: '#E6A23C'
        },
        {
          text: '王五从一号仓库调货到二号仓库，数量：10',
          time: '1小时前',
          icon: 'el-icon-info',
          color: '#409EFF'
        }
      ],
      quickActions: [
        { label: '添加入库', path: '/stock/log', type: 'success', icon: 'el-icon-upload2' },
        { label: '添加出库', path: '/stock/log', type: 'warning', icon: 'el-icon-download' },
        { label: '调货管理', path: '/stock/transfer', type: 'primary', icon: 'el-icon-position' },
        { label: '添加货品', path: '/goods/list', type: 'info', icon: 'el-icon-plus' }
      ]
    }
  },
  mounted() {
    this.initChart()
    this.fetchData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.trendChart) {
      this.trendChart.dispose()
    }
  },
  methods: {
    // 初始化图表
    initChart() {
      this.trendChart = echarts.init(this.$refs.trendChart)
    },
    
    // 获取数据
    async fetchData() {
      this.loading = true
      
      // 模拟数据
      setTimeout(() => {
        this.recentLogs = [
          {
            id: 1,
            goods_name: 'iPhone 15',
            warehouse_name: '一号仓库',
            type: 'inbound',
            quantity: 50,
            operator: '张三',
            operate_time: '2024-01-15 10:30:00'
          },
          {
            id: 2,
            goods_name: '洗发水',
            warehouse_name: '二号仓库',
            type: 'outbound',
            quantity: 20,
            operator: '李四',
            operate_time: '2024-01-15 14:20:00'
          },
          {
            id: 3,
            goods_name: '笔记本电脑',
            warehouse_name: '一号仓库',
            type: 'inbound',
            quantity: 30,
            operator: '王五',
            operate_time: '2024-01-15 16:00:00'
          },
          {
            id: 4,
            goods_name: '纸巾',
            warehouse_name: '二号仓库',
            type: 'outbound',
            quantity: 100,
            operator: '赵六',
            operate_time: '2024-01-15 18:30:00'
          },
          {
            id: 5,
            goods_name: '矿泉水',
            warehouse_name: '三号仓库',
            type: 'inbound',
            quantity: 200,
            operator: '钱七',
            operate_time: '2024-01-16 09:00:00'
          }
        ]
        this.totalLogs = 25
        
        // 更新图表
        this.updateChart()
        this.loading = false
      }, 500)
    },
    
    // 更新图表
    updateChart() {
      const dates = []
      const inboundData = []
      const outboundData = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
        inboundData.push(Math.floor(Math.random() * 100) + 50)
        outboundData.push(Math.floor(Math.random() * 80) + 30)
      }
      
      const option = {
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
          type: 'value'
        },
        series: [
          {
            name: '入库',
            type: 'line',
            smooth: true,
            data: inboundData,
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
            smooth: true,
            data: outboundData,
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
      
      this.trendChart.setOption(option)
    },
    
    // 查看详情
    viewDetail(row) {
      this.$message.info(`查看 ${row.goods_name} 的详情`)
    },
    
    // 分页变化
    handlePageChange(page) {
      this.currentPage = page
      this.fetchData()
    },
    
    // 窗口大小变化
    handleResize() {
      if (this.trendChart) {
        this.trendChart.resize()
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-desc {
  font-size: 12px;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.stat-icon {
  font-size: 48px;
  opacity: 0.8;
}

.content-row {
  margin-bottom: 20px;
}

.table-card,
.chart-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottom-row {
  margin-bottom: 20px;
}

.notification-card,
.quick-actions-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.notification-badge {
  margin-left: 10px;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.notification-content {
  flex: 1;
}

.notification-text {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  flex: 1;
  min-width: 120px;
}
</style>

