<template>
  <div>
    <div class="gas-panel">
      <div class="title">
        <span>各单位报警任务类型数量统计</span>
      </div>
      <div class="table-content">
        <a-table :columns="columns" :data-source="dataSource" :pagination="false" bordered size="middle" rowKey="id">
          <template #bodyCell="{ column, text, record }">
            <template v-if="isHeatmapColumn(column.dataIndex)">
              <div class="heatmap-cell" :style="{ backgroundColor: getHeatmapColor(text), fontWeight: record.company === '总计' ? 'bold' : '500' }">
                {{ text }}
              </div>
            </template>
            <template v-else>
              <span :style="{ fontWeight: record.company === '总计' || column.dataIndex === 'total' ? 'bold' : 'normal' }">
                {{ text }}
              </span>
            </template>
          </template>
        </a-table>
        <div class="legend-section">
          <div class="legend-title">数值大小</div>
          <div class="legend-bar">
            <span>8</span>
            <span>52</span>
            <span>95</span>
          </div>
        </div>
      </div>
    </div>
    <div class="gas-panel" style="margin-top: 30px">
      <div class="title">
        <span>各单位报警任务处理情况统计</span>
      </div>
      <a-spin :spinning="loading">
        <div ref="chartRef" style="width: 100%; height: 500px"></div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch, type PropType } from 'vue';
  import * as echarts from 'echarts';
  import { getGasAlarmStatistics } from '../api';
  import type { Dayjs } from 'dayjs';
  import { initDictOptions } from '/@/utils/dict/JDictSelectUtil';

  interface GasAlarmData {
    id: number;
    company: string;
    warntype1: number;
    warntype2: number;
    warntype3: number;
    warntype4: number;
    warntype5: number;
    alarmTaskCount: number;
    alarmTaskOnTimeCompleteCount: number;
    alarmTaskUnProcessCount: number;
    alarmTaskOnTimeCompleteRate: string | number;
    [key: string]: any;
  }

  const props = defineProps({
    dateRange: {
      type: Array as unknown as PropType<[Dayjs, Dayjs]>,
      default: () => [],
    },
  });

  const chartRef = ref<HTMLElement | null>(null);
  let myChart: echarts.ECharts | null = null;
  const loading = ref(false);

  /**
   * 表格列定义
   * Table column definitions
   */
  const columns = ref<any[]>([
    {
      title: '单位',
      dataIndex: 'company',
      key: 'company',
      align: 'center',
      width: 200,
      customHeaderCell: () => ({
        style: {
          backgroundColor: '#7262fd',
          color: '#fff',
        },
      }),
    },
  ]);

  const headerColors = ['#6b66f6', '#636af0', '#5c6eea', '#5472e4', '#4d76de'];

  /**
   * 初始化动态列
   */
  const initColumns = async () => {
    const res = await initDictOptions('alarm_warnType');
    if (res && res.length > 0) {
      const dynamicColumns = res.map((item: any, index: number) => ({
        title: item.text,
        dataIndex: 'warntype' + item.value,
        key: 'warntype' + item.value,
        align: 'center',
        customHeaderCell: () => ({
          style: {
            backgroundColor: headerColors[index % headerColors.length],
            color: '#fff',
          },
        }),
      }));
      // 增加总计列
      const totalColumn = {
        title: '总计',
        dataIndex: 'total',
        key: 'total',
        align: 'center',
        customHeaderCell: () => ({
          style: {
            backgroundColor: headerColors[dynamicColumns.length % headerColors.length],
            color: '#fff',
          },
        }),
      };
      columns.value = [columns.value[0], ...dynamicColumns, totalColumn];
    }
  };

  /**
   * 数据源
   * Data source for the table
   */
  const dataSource = ref<GasAlarmData[]>([]);

  /**
   * 获取统计数据
   * Fetch statistics data
   */
  const fetchData = async () => {
    if (!props.dateRange || props.dateRange.length < 2) return;

    loading.value = true;
    try {
      const params = {
        startDate: props.dateRange[0].format('YYYY-MM-DD'),
        endDate: props.dateRange[1].format('YYYY-MM-DD'),
      };
      const res = await getGasAlarmStatistics(params);
      console.log('res', res);
      // 更新表格数据
      // 假设接口返回的数据结构与表格列对应，或者需要映射
      // Assuming res is the array of data directly or res.result
      const data = Array.isArray(res) ? res : [];

      // 获取所有warntype字段
      const warnTypeKeys = columns.value.map((col) => col.dataIndex).filter((key) => key && key.startsWith('warntype'));

      // 映射后端数据到前端字段 (需要根据实际接口调整)
      // 这里假设后端返回字段与前端一致，如果不一致需在此处转换
      const mappedData = data.map((item, index) => {
        let rowTotal = 0;
        warnTypeKeys.forEach((key) => {
          rowTotal += Number(item[key]) || 0;
        });

        return {
          ...item, // 动态展开所有字段，包括warntypeX
          id: index,
          company: item.companyName || item.company, // 兼容可能的字段名
          // 图表所需数据
          alarmTaskCount: item.alarmTaskCount || 0,
          alarmTaskUnProcessCount: item.alarmTaskUnProcessCount || 0,
          alarmTaskOnTimeCompleteCount: item.alarmTaskOnTimeCompleteCount || 0,
          alarmTaskOnTimeCompleteRate: item.alarmTaskOnTimeCompleteRate || '0.00',
          total: rowTotal,
        };
      });

      // 计算列总计
      const columnTotals: any = {};
      warnTypeKeys.forEach((key) => {
        columnTotals[key] = mappedData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
      });
      // 计算总计的总计
      const grandTotal = mappedData.reduce((sum, row) => sum + row.total, 0);

      // 添加总计行
      if (mappedData.length > 0) {
        const totalRow = {
          id: 'total_row',
          company: '总计',
          ...columnTotals,
          total: grandTotal,
          alarmTaskCount: 0,
          alarmTaskUnProcessCount: 0,
          alarmTaskOnTimeCompleteCount: 0,
          alarmTaskOnTimeCompleteRate: 0,
        };
        dataSource.value = [...mappedData, totalRow];
      } else {
        dataSource.value = [];
      }

      // 更新图表
      updateChart();
    } catch (error) {
      console.error('获取煤气预警统计数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 监听时间范围变化
   */
  watch(
    () => props.dateRange,
    () => {
      fetchData();
    },
    { deep: true }
  );

  /**
   * 判断列是否需要热力图背景
   * Check if the column needs heatmap background
   * @param dataIndex Column data index
   */
  const isHeatmapColumn = (dataIndex: string) => {
    return dataIndex && dataIndex.startsWith('warntype');
  };

  /**
   * 根据数值获取背景颜色 (白 -> 浅蓝 -> 蓝 -> 紫 -> 红)
   * Get background color based on value (White -> Light Blue -> Blue -> Purple -> Red)
   * @param value Numerical value
   */
  const getHeatmapColor = (value: number) => {
    // 0 values show white
    if (value === 0) {
      return '#ffffff';
    }
    const min = 0;
    const max = 95;
    const range = max - min;

    // 限制范围
    const clampedValue = Math.max(min, Math.min(max, value));

    // Define 5 colors to match the gradient
    // #FFFFFF, #A5D8EB, #6B9FE3, #9668B2, #D93746
    const colors = [
      { r: 255, g: 255, b: 255 }, // 0% White
      { r: 165, g: 216, b: 235 }, // 25%
      { r: 107, g: 159, b: 227 }, // 50%
      { r: 150, g: 104, b: 178 }, // 75%
      { r: 217, g: 55, b: 70 }, // 100%
    ];

    const stop1 = min;
    const stop2 = min + range * 0.25;
    const stop3 = min + range * 0.5;
    const stop4 = min + range * 0.75;
    const stop5 = max;

    let startColor, endColor, startVal, endVal;

    if (clampedValue <= stop2) {
      startColor = colors[0];
      endColor = colors[1];
      startVal = stop1;
      endVal = stop2;
    } else if (clampedValue <= stop3) {
      startColor = colors[1];
      endColor = colors[2];
      startVal = stop2;
      endVal = stop3;
    } else if (clampedValue <= stop4) {
      startColor = colors[2];
      endColor = colors[3];
      startVal = stop3;
      endVal = stop4;
    } else {
      startColor = colors[3];
      endColor = colors[4];
      startVal = stop4;
      endVal = stop5;
    }

    const ratio = (clampedValue - startVal) / (endVal - startVal);
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  };

  /**
   * 初始化图表
   * Initialize chart
   */
  const initChart = () => {
    if (chartRef.value) {
      if (!myChart) {
        myChart = echarts.init(chartRef.value);
      }
      updateChart();
      handleResize();
    }
  };

  /**
   * 更新图表配置
   * Update chart options
   */
  const updateChart = () => {
    if (!myChart) return;

    // 计算最大值以分隔图表区域，防止柱状图与折线图重叠
    const data = (dataSource.value || []).filter((item) => item.company !== '总计');
    const maxVal = Math.max(...data.map((item) => Math.max(item.alarmTaskCount || 0, item.alarmTaskOnTimeCompleteCount || 0, item.alarmTaskUnProcessCount || 0)), 0);
    // 左侧Y轴最大值设为实际最大值的2.2倍，确保柱状图只占据下方不到一半的区域
    const leftAxisMax = maxVal > 0 ? Math.ceil(maxVal * 2.2) : 10;

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        formatter: function (params: any) {
          let result = params[0].name + '<br/>';
          params.forEach((item: any) => {
            let value = item.value;
            if (item.seriesName === '报警任务及时处理率') {
              value = value + '%';
            }
            result += item.marker + item.seriesName + ' ' + (value || 0) + '<br/>';
          });
          return result;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        top: '20%',
        bottom: '15%', // 增加底部空间以显示旋转的标签
        containLabel: true,
      },
      legend: {
        data: ['报警任务数量', '及时处理数量', '未处理数量','报警任务及时处理率'],
        bottom: 0,
      },
      xAxis: [
        {
          type: 'category',
          data: data.map((item) => item.company) || [],
          axisPointer: {
            type: 'shadow',
          },
          axisLabel: {
            interval: 0,
            rotate: 45, // 标签旋转以避免重叠
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: leftAxisMax,
          axisLabel: {
            show: false, // 隐藏刻度标签
          },
          axisTick: {
            show: false, // 隐藏刻度
          },
          splitLine: {
            show: false, // 隐藏网格线，保持界面整洁
          },
        },
        {
          type: 'value',
          min: -(maxVal * 2 + 130), // 设置最小值为-100，最大值为100，使得0值位于中间
          max: maxVal * 2 + 100,
          axisLabel: {
            show: false, // 隐藏刻度标签
          },
          axisTick: {
            show: false, // 隐藏刻度
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '报警任务数量',
          type: 'bar',
          barGap: '20%',
          itemStyle: {
            color: '#7ca8e6',
          },
          label: {
            show: true,
            position: 'top',
          },
          data: data.map((item) => item.alarmTaskCount) || [],
        },
        {
          name: '及时处理数量',
          type: 'bar',
          itemStyle: {
            color: '#7cc07e',
          },
          label: {
            show: true,
            position: 'top',
          },
          data: data.map((item) => item.alarmTaskOnTimeCompleteCount) || [],
        },
        {
          name: '未处理数量',
          type: 'bar',
          itemStyle: {
            color: '#ff0404',
          },
          label: {
            show: true,
            position: 'top',
          },
          data: data.map((item) => item.alarmTaskUnProcessCount) || [],
        },
        {
          name: '报警任务及时处理率',
          type: 'line',
          yAxisIndex: 1,
          itemStyle: {
            color: '#ffaa33',
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
          },
          symbol: 'circle',
          symbolSize: 8,
          smooth: true,
          data: data.map((item) => item.alarmTaskOnTimeCompleteRate) || [],
        },
      ],
    };
    myChart.setOption(option);
  };

  const handleResize = () => {
    myChart?.resize();
  };

  const init = async () => {
    await fetchData();
  };

  defineExpose({
    initChart,
    resize: handleResize,
    init,
  });

  onMounted(async () => {
    await initColumns();
    initChart();
    fetchData(); // 初始加载
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    myChart?.dispose();
  });
</script>

<style scoped lang="less">
  .gas-panel {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    border: 1px solid #ebebeb;

    .title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      margin-top: 30px;
      padding-left: 10px;
      border-left: 4px solid #1890ff;
    }
  }

  .heatmap-cell {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-weight: 500;
  }

  .legend-section {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80px;

    .legend-title {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .legend-bar {
      width: 300px;
      height: 20px;
      background: linear-gradient(to right, #a5d8eb, #6b9fe3, #9668b2, #d93746);
      border-radius: 10px;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 5px;
      color: #333;
      font-size: 12px;

      span {
        position: absolute;
        bottom: -20px;
      }
      span:first-child {
        left: 0;
      }
      span:nth-child(2) {
        left: 50%;
        transform: translateX(-50%);
      }
      span:last-child {
        right: 0;
      }
    }
  }

  :deep(.ant-table-thead > tr > th) {
    border-bottom: none;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 0 !important; // Remove padding to let heatmap cell fill
    height: 40px;
  }

  :deep(.heatmap-cell) {
    height: 40px; // Ensure consistent height
  }
</style>
