<template>
  <div class="safe-production-invest-panel">
    <!-- 总体统计 -->
    <div class="panel-header">
      <div class="title">
        <span class="blue-line"></span>
        <span class="text">总体统计</span>
      </div>
      <div class="year-selector">
        <span>选择年份: </span>
        <a-date-picker
          v-model:value="selectedYear"
          picker="year"
          style="width: 100px"
          :allowClear="false"
          @change="handleYearChange"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-spin :spinning="loadingTotal">
      <div class="cards-container">
        <div class="card purple">
          <div class="value">{{ totalBudget }}</div>
          <div class="label">总预算 (万元)</div>
        </div>
        <div class="card green">
          <div class="value">{{ totalActual }}</div>
          <div class="label">总实际支出 (万元)</div>
        </div>
        <div class="card orange">
          <div class="value">{{ executionRate }}</div>
          <div class="label">预算执行率</div>
        </div>
        <div class="card blue">
          <div class="value">{{ remainingCost }}</div>
          <div class="label">剩余费用 (万元)</div>
        </div>
      </div>
    </a-spin>

    <!-- 柱状图标题 -->
    <div class="panel-header" style="margin-top: 20px; border-bottom: none;">
      <div class="title">
        <span class="blue-line"></span>
        <span class="text">各事业部年度预算 vs 实际支出对比</span>
      </div>
    </div>
    <div style="border-bottom: 1px solid #f0f0f0; margin-bottom: 10px;"></div>

    <!-- 柱状图 -->
    <a-spin :spinning="loadingChart">
      <div ref="chartRef" style="width: 100%; height: 500px;"></div>
    </a-spin>

    <!-- 表格标题 -->
    <div class="panel-header" style="margin-top: 20px; border-bottom: none;">
      <div class="title">
        <span class="blue-line"></span>
        <span class="text">各事业部投入项目占比情况 (万元)</span>
      </div>
    </div>
    <div style="border-bottom: 1px solid #f0f0f0; margin-bottom: 10px;"></div>

    <!-- 表格 -->
    <a-spin :spinning="loadingTable">
      <div class="table-container" style="height: 950px">
        <iframe :srcdoc="tableData" frameborder="0" width="100%" height="100%"></iframe>
        <!-- <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          :scroll="{ x: 'max-content' }"
          bordered
          size="middle"
          row-key="department"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex && column.dataIndex.endsWith('_ratio')">
              <span :style="{ color: parseFloat(text) > 100 ? '#ff4d4f' : 'inherit', fontWeight: parseFloat(text) > 100 ? 'bold' : 'normal' }">
                {{ text }}
              </span>
            </template>
            <template v-if="record.department === '合计' && column.dataIndex === 'department'">
              <span style="font-weight: bold;">合计</span>
            </template>
          </template>
        </a-table> -->
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, Ref, computed } from 'vue';
  import { Select as ASelect, SelectOption as ASelectOption, Table as ATable, DatePicker as ADatePicker, Spin as ASpin } from 'ant-design-vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import dayjs, { Dayjs } from 'dayjs';
  import { getTotalStatistics, getCompareDeptStatistics, getDeptInvestStatistics } from '../api';

  // 年份选择
  const selectedYear = ref<Dayjs>(dayjs());

  // Loading states
  const loadingTotal = ref(false);
  const loadingChart = ref(false);
  const loadingTable = ref(false);

  // 统计数据状态
  const totalBudget = ref(0);
  const totalActual = ref(0);
  const executionRate = ref('');
  const remainingCost = ref(0);

  // 表格数据
  const tableData = ref<any>([]);

  // 图表 Ref
  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  /**
   * 初始化组件
   * @param dateRange 日期范围
   */
  const init = (dateRange: [Dayjs, Dayjs]) => {
    console.log('SafeProductionInvestPanel init', dateRange);
    fetchData();
  };

  /**
   * 处理 resize 事件
   */
  const resize = () => {
    console.log('SafeProductionInvestPanel resize');
  };

  /**
   * 处理年份变化
   * @param value 选中的年份
   */
  const handleYearChange = (value: Dayjs) => {
    console.log('Year changed:', value ? value.year() : value);
    // 这里可以根据年份重新请求数据
    fetchData();
  };
  /**
   * 模拟获取数据接口
   */
  const fetchData = () => {
    const year = selectedYear.value?.year();

    loadingTotal.value = true;
    getTotalStatistics({ year }).then(res => {
      totalBudget.value = res.total || 0;
      totalActual.value = res.actual || 0;
      executionRate.value = res.proportion || '-';
      remainingCost.value = res.surplus || 0;
    }).finally(() => {
      loadingTotal.value = false;
    });

    loadingChart.value = true;
    getCompareDeptStatistics({ year }).then(res => {
       updateChart(res || []);
    }).finally(() => {
      loadingChart.value = false;
    });

    loadingTable.value = true;
    getDeptInvestStatistics({ year }).then(res => {
       tableData.value = res;
    }).finally(() => {
      loadingTable.value = false;
    });
  };

  /**
   * 更新图表配置
   */
  const updateChart = (chartData) => {
    setOptions({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['年度预算 (万元)', '实际支出 (万元)'],
        top: 0
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.xdata,
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '金额 (万元)'
      },
      series: [
        {
          name: '年度预算 (万元)',
          type: 'bar',
          data: chartData.totalBudget,
          itemStyle: {
            color: '#3aa1ff'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#3aa1ff',
            fontSize: 10
          },
          barMaxWidth: 30
        },
        {
          name: '实际支出 (万元)',
          type: 'bar',
          data: chartData.actual,
          itemStyle: {
            color: '#52c41a'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#52c41a',
            fontSize: 10
          },
          barMaxWidth: 30,
          barGap: '80%' // 增加柱状图之间的间距
        }
      ]
    });
  };

  onMounted(() => {
    fetchData();
  });

  defineExpose({
    init,
    resize,
  });
</script>

<style scoped>
  .safe-production-invest-panel {
    height: 100%;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto; /* 防止内容过多溢出 */
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  .blue-line {
    width: 4px;
    height: 18px;
    background-color: #1890ff;
    margin-right: 8px;
    border-radius: 2px;
  }

  .cards-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
  }

  .card {
    flex: 1;
    border-radius: 6px;
    padding: 15px 20px;
    color: #fff;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .card .value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .card .label {
    font-size: 14px;
    opacity: 0.95;
  }

  .card.purple {
    background-color: #6A5ACD; /* 调整为接近图片的紫色 */
    background: linear-gradient(90deg, #7F7FD5, #86A8E7, #91EAE4); /* 尝试渐变，或者直接用纯色 */
    background: #7367F0;
  }

  .card.green {
    background-color: #28C76F;
  }

  .card.orange {
    background-color: #FF9F43;
  }

  .card.blue {
    background-color: #00CFE8;
  }
  
  /* 重新定义颜色以更匹配截图 */
  .card.purple {
    background: #6f5cd1;
  }
  .card.green {
    background: #64cd26;
  }
  .card.orange {
    background: #ff9800;
  }
  .card.blue {
    background: #36a2eb;
  }

  /* Table Styles */
  :deep(.ant-table-thead > tr > th) {
    background-color: #7367F0 !important;
    color: #fff !important;
    font-weight: bold;
    text-align: center;
    border-right: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
  }
  
  :deep(.ant-table-tbody > tr:last-child > td) {
    background-color: #e6f7ff;
    font-weight: bold;
  }
  
  :deep(.ant-table-wrapper .ant-table-container) {
    border-radius: 6px 6px 0 0;
  }

</style>