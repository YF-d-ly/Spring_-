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
            <el-table-column prop="goodsName" label="货品名称" width="150" show-overflow-tooltip></el-table-column>
            <el-table-column prop="warehouseName" label="仓库" width="120" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="类型" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.type === 1 ? 'success' : 'warning'" size="small">
                  {{ scope.row.type === 1 ? '入库' : '出库' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="数量" width="80"></el-table-column>
            <el-table-column prop="operator" label="操作人" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="createTime" label="时间" width="160" show-overflow-tooltip></el-table-column>
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
              :key="action.label"
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
import { stockApi } from '@/api/stock'
import { warehouseApi } from '@/api/warehouse'
import { goodsApi } from '@/api/goods'

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
          value: '0',
          trend: 0,
          unit: '个',
          icon: 'el-icon-s-home',
          color: '#409EFF'
        },
        {
          title: '总货品数',
          value: '0',
          trend: 0,
          unit: '件',
          icon: 'el-icon-goods',
          color: '#67C23A'
        },
        {
          title: '本月入库',
          value: '0',
          trend: 0,
          unit: '件',
          icon: 'el-icon-upload2',
          color: '#E6A23C'
        },
        {
          title: '本月出库',
          value: '0',
          trend: 0,
          unit: '件',
          icon: 'el-icon-download',
          color: '#F56C6C'
        }
      ],
      recentLogs: [],
      notifications: [],
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
      
      // 1. 获取仓库总数
      try {
        const warehouseRes = await warehouseApi.getWarehouseList()
        if (warehouseRes.code === 200) {
          this.stats[0].value = warehouseRes.data.length.toLocaleString()
        }
      } catch (error) {
        console.error('获取仓库列表失败', error)
      }

      // 2. 获取货品总数
      try {
        const goodsRes = await goodsApi.getGoodsList({ pageNum: 1, pageSize: 1 })
        if (goodsRes.code === 200) {
          this.stats[1].value = goodsRes.data.total.toLocaleString()
        }
      } catch (error) {
        console.error('获取货品总数失败', error)
      }

      // 3. 获取最近出入库记录
      try {
        const logRes = await stockApi.getStockLogPage({ 
          pageNum: this.currentPage, 
          pageSize: 5 
        })
        if (logRes.code === 200) {
          this.recentLogs = logRes.data.records
          this.totalLogs = logRes.data.total
          
          // 生成通知 (使用最新的日志)
           this.notifications = this.recentLogs.map(log => {
             const isInbound = log.type === 1
             return {
               text: `${log.operator}完成了${log.goodsName}的${isInbound ? '入库' : '出库'}操作，数量：${log.num}`,
               time: this.formatTime(log.createTime),
               icon: isInbound ? 'el-icon-success' : 'el-icon-warning',
               color: isInbound ? ' #67C23A' : '#E6A23C'
             }
           }).slice(0, 5) // 只显示前5条
         }
      } catch (error) {
        console.error('获取日志失败', error)
      }

      // 4. 获取出入库趋势 (使用日志列表聚合计算)
      try {
         // 计算日期范围 (最近7天)
         const end = new Date();
         const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 6); // 包含今天共7天
          
          // 获取时间段内的所有日志 (限制数量以防太多，这里假设最多1000条用于统计)
         const logListRes = await stockApi.getStockLogPage({
            pageNum: 1,
            pageSize: 1000
            // 注意：这里需要后端支持时间范围查询，如果不支持，只能获取最近的日志进行前端过滤
            // 假设后端支持 start_date 和 end_date 参数，如果不支持，可能需要 fallback
         })
         
         if (logListRes.code === 200) {
            const logs = logListRes.data.records;
            const trendData = this.calculateTrendFromLogs(logs, start, end);
            
            this.updateChart(trendData);
            
            // 计算本月数据
            const currentMonth = new Date().getMonth();
            let monthIn = 0;
            let monthOut = 0;
            
            logs.forEach(log => {
                const logDate = new Date(log.createTime);
                if (logDate.getMonth() === currentMonth) {
                    if (log.type === 1) monthIn += log.num;
                    if (log.type === 2) monthOut += log.num;
                }
            });
            
            this.stats[2].value = monthIn.toLocaleString();
            this.stats[3].value = monthOut.toLocaleString();
         }
      } catch (error) {
         console.error('获取趋势数据失败', error);
         // 初始化空图表以防报错
         this.updateChart([]);
      } finally {
        this.loading = false;
      }
    },
    
    // 从日志计算趋势
    calculateTrendFromLogs(logs, startDate, endDate) {
        const days = [];
        const result = [];
        
        // 生成日期序列
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            days.push(this.formatDate(d));
        }
        
        days.forEach(dateStr => {
            let inboundNum = 0;
            let outboundNum = 0;
            
            logs.forEach(log => {
                if (log.createTime.startsWith(dateStr)) {
                    if (log.type === 1) inboundNum += log.num; // 入库
                    if (log.type === 2) outboundNum += log.num; // 出库
                }
            });
            
            result.push({
                date: dateStr.substring(5), // MM-DD
                inboundNum,
                outboundNum
            });
        });
        
        return result;
    },
    
    // 格式化时间
    formatTime(timeStr) {
        if (!timeStr) return ''
        const date = new Date(timeStr)
        const now = new Date()
        const diff = now - date
        
        if (diff < 60000) return '刚刚'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
        return timeStr.split(' ')[0]
    },

    formatDate(date) {
        const y = date.getFullYear()
        const m = (date.getMonth() + 1).toString().padStart(2, '0')
        const d = date.getDate().toString().padStart(2, '0')
        return `${y}-${m}-${d}`
    },
    
    // 更新图表
    updateChart(data = []) {
      // 如果没有数据，使用空数组
      const dates = data.map(item => item.date)
      const inboundData = data.map(item => item.inbound)
      const outboundData = data.map(item => item.outbound)
      
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
      this.fetchData() // 这里的逻辑需要微调，因为fetchData会刷新所有数据，最好拆分
      // 为了简单起见，这里只更新日志
      this.fetchLogs()
    },
    
    async fetchLogs() {
        this.loading = true
        try {
            const logRes = await stockApi.getStockLogPage({ 
                pageNum: this.currentPage, 
                pageSize: 5 
            })
            if (logRes.code === 200) {
                this.recentLogs = logRes.data.records
                this.totalLogs = logRes.data.total
            }
        } catch(e) {
            console.error(e)
        } finally {
            this.loading = false
        }
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

.trend-flat {
  color: #909399;
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

