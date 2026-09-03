<template>
  <div class="safety-standard-panel">
    <a-row :gutter="16" style="height: 100%">
      <!-- Left: Chart -->
      <a-col :span="12" style="height: 100%">
        <div class="panel-box">
          <div class="panel-header" style="padding-bottom: 17px">
            <div class="title-line"></div>
            <span class="panel-title">各事业部标准化评审得分排名</span>
          </div>
          <a-spin :spinning="loading" style="height: 100%">
            <div class="chart-container" ref="chartRef"></div>
          </a-spin>
        </div>
      </a-col>
      <!-- Right: Table -->
      <a-col :span="12" style="height: 100%">
        <div class="panel-box">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center">
            <div style="display: flex; align-items: center">
              <div class="title-line"></div>
              <span class="panel-title">各事业部单元评分表</span>
            </div>
            <div class="year-selector">
              <span>选择年份：</span>
              <a-date-picker
                v-model:value="selectedYear"
                picker="year"
                :allowClear="false"
                @change="handleYearChange"
                style="width: 120px; font-weight: 400"
              />
            </div>
          </div>
          <div class="table-container">
            <a-table
              :dataSource="tableData"
              :columns="columns"
              :pagination="false"
              size="small"
              bordered
              class="custom-table"
              :loading="loadingTable"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <span :style="{ color: getStatusColor(record.status), fontWeight: 'bold' }">{{ record.status }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </a-col>
    </a-row>
    <div class="panel-box" style="margin-top: 60px">
      <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center">
        <div style="display: flex; align-items: center">
          <div class="title-line"></div>
          <span class="panel-title">审查结果</span>
        </div>
        <div class="org-selector">
          <span style="margin-right: 8px">选择事业部:</span>
          <a-select v-model:value="selectedOrg" style="width: 200px" placeholder="请选择事业部" @change="handleOrgChange" :options="orgOptions" />
        </div>
      </div>
      <a-row :gutter="16">
        <a-col :span="12">
          <div class="chart-header" style="padding: 10px 0">
            <span style="font-weight: bold; border-left: 3px solid #1890ff; padding-left: 8px">合格率统计</span>
          </div>
          <a-spin :spinning="loadingPassRate">
            <div ref="passRateChartRef" style="height: 400px; width: 100%"></div>
          </a-spin>
        </a-col>
        <a-col :span="12">
          <div class="chart-header" style="padding: 10px 0">
            <span style="font-weight: bold; border-left: 3px solid #1890ff; padding-left: 8px">问题分布统计</span>
          </div>
          <a-spin :spinning="loadingIssueDist">
            <div ref="issueDistChartRef" style="height: 400px; width: 100%"></div>
          </a-spin>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getSafetyStandardChart, getSafetyStandardTable, getSafetyStandardPassRate, getSafetyStandardIssueDist, getLatestOrg, getSafetyStandardOrgCodeList } from '../api';

  /**
   * 获取默认年份
   * 每年12.01开始进行本年的单元评分，所以当年的12.01-次年的11.30显示的都是12月所在的年份
   */
  const getDefaultYear = () => {
    const now = dayjs();
    // dayjs.month() 返回 0-11，所以 11 代表 12月
    if (now.month() === 11) {
      return now;
    }
    return now.subtract(1, 'year');
  };

  const selectedYear = ref<Dayjs>(getDefaultYear());
  const loading = ref(false);
  const loadingTable = ref(false);
  const loadingPassRate = ref(false);
  const loadingIssueDist = ref(false);

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions, resize: resizeChart } = useECharts(chartRef as any);

  interface ChartItem {
    org: string;
    score: number;
    unqualifiedNum: number;
  }

  interface IssueDistItem {
    name: string;
    value: number;
  }

  const chartData = ref<ChartItem[]>([]);

  const tableData = ref([]);

  const columns = [
    { title: '事业部', dataIndex: 'org', key: 'org', width: 150 },
    { title: '单元', dataIndex: 'unit', key: 'unit', width: 100 },
    { title: '评分状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
    { title: '得分', dataIndex: 'score', key: 'score', width: 80, align: 'center' },
  ];
  // 接口获取图表数据
  const fetchChartData = async () => {
    loading.value = true;
    try {
      const res = await getSafetyStandardChart();
      chartData.value = res || [];
      initChart();
    } catch (error) {
      console.error('获取图表数据失败', error);
    } finally {
      loading.value = false;
    }
  };
  // 接口获取表格数据
  const fetchTableData = async () => {
    loadingTable.value = true;
    try {
      const res = await getSafetyStandardTable({
        year: selectedYear.value.format('YYYY'),
      });
      tableData.value = res || [];
    } catch (error) {
      console.error('获取表格数据失败', error);
    } finally {
      loadingTable.value = false;
    }
  };

  const handleYearChange = (year: Dayjs) => {
    fetchTableData();
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case '评审完成':
        return '#52c41a'; // Green
      case '评审中':
        return '#faad14'; // Orange
      case '未评审':
        return '#f5222d'; // Red
      default:
        return '#333';
    }
  };

  const selectedOrg = ref<string | undefined>(undefined);
  const orgOptions = ref<{ label: string; value: string }[]>([]);

  const passRateChartRef = ref<HTMLDivElement | null>(null);
  const { setOptions: setPassRateOptions, resize: resizePassRateChart } = useECharts(passRateChartRef as any);

  const issueDistChartRef = ref<HTMLDivElement | null>(null);
  const { setOptions: setIssueDistOptions, resize: resizeIssueDistChart } = useECharts(issueDistChartRef as any);

  const passRateData = ref<{ name: string; value: number; average: number }[]>([]);
  const issueDistData = ref<IssueDistItem[]>([]);
  //获取事业部列表
  const fetchOrgOptions = async () => {
    try {
      const res = await getSafetyStandardOrgCodeList();
      orgOptions.value = res?.map((item) => ({ label: item.departName, value: item.orgCode })) || [];
      await fetchOrgDefault();
    } catch (error) {
      console.error('Failed to fetch org options', error);
    }
  };

  /**
   * 获取默认事业部
   */
  const fetchOrgDefault = async () => {
    try {
      const res = await getLatestOrg();
      if (res) {
        selectedOrg.value = res;
      }
    } catch (error) {
      console.error('Failed to fetch org options', error);
    }
  };

  /**
   * 获取合格率统计数据
   */
  const fetchPassRateData = async () => {
    loadingPassRate.value = true;
    try {
      const res = await getSafetyStandardPassRate({ orgCode: selectedOrg.value });
      if (res && res.length > 0) {
        passRateData.value = res;
      } else {
        passRateData.value = [];
      }
      initPassRateChart();
    } catch (error) {
      console.error('Failed to fetch pass rate data', error);
    } finally {
      loadingPassRate.value = false;
    }
  };

  /**
   * 获取问题分布统计数据
   */
  const fetchIssueDistData = async () => {
    loadingIssueDist.value = true;
    try {
      const res = await getSafetyStandardIssueDist({ orgCode: selectedOrg.value });
      if (res && res.length > 0) {
        issueDistData.value = res;
      } else {
        // Mock data
        issueDistData.value = [];
      }
      initIssueDistChart();
    } catch (error) {
      console.error('Failed to fetch issue distribution data', error);
    } finally {
      loadingIssueDist.value = false;
    }
  };

  /**
   * 处理事业部切换
   */
  const handleOrgChange = () => {
    fetchPassRateData();
    fetchIssueDistData();
  };

  /**
   * 初始化合格率统计图表
   */
  const initPassRateChart = () => {
    const data = passRateData.value;
    const xData = data.map((item) => item.name);
    const yData = data.map((item) => item.value);
    // Assuming average is same for all or taking the first one
    const avgData = data.length > 0 ? data[0].average : 0;

    setPassRateOptions({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let res = params[0].name + '<br/>';
          params.forEach((item: any) => {
            if (item.seriesName === '合格率') {
              res += item.marker + item.seriesName + ': ' + item.value + '%<br/>';
            }
          });
          return res;
        },
      },
      legend: {
        data: ['合格率', '平均合格率'],
        bottom: 0,
        left: 'center',
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: '合格率',
          type: 'line',
          data: yData,
          smooth: true,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
          },
          itemStyle: {
            color: '#5b8ff9',
          },
          markLine: {
            data: [{ yAxis: avgData, name: '平均合格率' }],
            label: {
              formatter: '{c}%',
              position: 'end', // or 'start', 'middle'
            },
            lineStyle: {
              type: 'dashed',
              color: '#faad14',
            },
            symbol: 'none',
          },
        },
        // Dummy series for legend
        {
          name: '平均合格率',
          type: 'line',
          data: [],
          itemStyle: {
            color: '#faad14',
          },
          lineStyle: {
            // type: 'dashed'
          },
        },
      ],
    });
  };

  /**
   * 初始化问题分布统计图表
   */
  const initIssueDistChart = () => {
    setIssueDistOptions({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        formatter: (name) => {
          const item = issueDistData.value.find((p) => p.name === name);
          return item ? `${name}: ${item.value}%` : name;
        },
      },
      series: [
        {
          name: '问题分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['30%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: issueDistData.value,
        },
      ],
    });
  };

  const initChart = () => {
    setOptions({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['得分', '不合格项数量'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.value.map((item) => item.org),
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
      },
      series: [
        {
          name: '得分',
          type: 'bar',
          barWidth: 10,
          data: chartData.value.map((item, index) => {
            let color = '#1890ff'; // Default Blue
            if (index < 3) {
              color = '#52c41a'; // Top 3 Green
            } else if (index >= chartData.value.length - 3) {
              color = '#f5222d'; // Bottom 3 Red
            }
            return {
              value: item.score,
              itemStyle: {
                color,
              },
            };
          }),
          barGap: '100%',
          label: {
            show: true,
            position: 'top',
          },
        },
        {
          name: '不合格项数量',
          type: 'bar',
          barWidth: 10,
          data: chartData.value.map((item) => item.unqualifiedNum),
          itemStyle: {
            color: '#faad14',
          },
          label: {
            show: true,
            position: 'top',
          },
        },
      ],
    });
  };

  onMounted(async () => {
    fetchChartData();
    fetchTableData();
    await fetchOrgOptions();
    fetchPassRateData();
    fetchIssueDistData();
  });

  const init = async (dateRange: [Dayjs, Dayjs]) => {
    fetchChartData();
    fetchTableData();
    await fetchOrgOptions();
    fetchPassRateData();
    fetchIssueDistData();
  };

  const resize = () => {
    resizeChart();
    resizePassRateChart();
    resizeIssueDistChart();
  };

  defineExpose({
    init,
    resize,
  });
</script>

<style scoped lang="less">
  .safety-standard-panel {
    width: 100%;
    height: 100%;
    min-height: 400px;
    padding: 20px 10px;
    background-color: #fff;

    .panel-box {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #1890ff;
      font-size: 16px;
      font-weight: bold;
      color: #333;

      .title-line {
        width: 4px;
        height: 16px;
        background-color: #1890ff;
        margin-right: 8px;
        border-radius: 2px;
      }
    }

    .chart-container {
      flex: 1;
      width: 100%;
      min-height: 620px;
    }

    .table-container {
      flex: 1;
      overflow: hidden;

      :deep(.ant-table-thead > tr > th) {
        background-color: #6d73ca; // Purple-ish header color from image
        color: #fff;
        font-weight: bold;
        text-align: center;
      }

      :deep(.ant-table-tbody > tr > td) {
        text-align: center;
      }
    }
    .year-selector,.org-selector {
      font-weight: 400;
      color: #333;
      font-size: 14px;
    }
  }
</style>
