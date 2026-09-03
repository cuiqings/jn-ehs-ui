<template>
  <div class="occupational-health-panel">
    <a-row :gutter="24">
      <!-- 左侧：检测录入完成率统计 -->
      <a-col :span="12">
        <div class="panel-section">
          <div class="section-header">
            <div class="title-bar">
              <span class="bar">|</span>
              <span class="title">各事业部检测录入完成率统计</span>
            </div>
            <div class="year-selector">
              <span>选择年份：</span>
              <a-date-picker v-model:value="year1" picker="year" :allowClear="false" @change="handleYear1Change" style="width: 120px" />
            </div>
          </div>

          <div class="table-container">
            <a-table
              :columns="columns"
              :data-source="detectionData"
              :pagination="false"
              bordered
              size="small"
              rowKey="rank"
              :loading="detectionLoading"
            >
              <template #headerCell="{ column }">
                <template v-if="column.key === 'proportion'">
                  <span>
                    {{ column.title }}
                    <a-tooltip title="已录入人数/总接害人数">
                      <info-circle-outlined style="color: rgba(255, 255, 255, 0.6); margin-left: 4px" />
                    </a-tooltip>
                  </span>
                </template>
              </template>

              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'rank'">
                  <div class="rank-badge" :class="getRankClass(index + 1, detectionData.length)">
                    {{ index + 1 }}
                  </div>
                </template>
                <template v-if="column.key === 'proportion'">
                  <span :class="getRateClass(index + 1, detectionData.length)"> {{ record.proportion }}% </span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </a-col>

      <!-- 右侧：体检完成率统计 -->
      <a-col :span="12">
        <div class="panel-section">
          <div class="section-header">
            <div class="title-bar">
              <span class="bar">|</span>
              <span class="title">各事业部体检完成率统计</span>
            </div>
            <div class="year-selector">
              <span>选择年份：</span>
              <a-date-picker v-model:value="year2" picker="year" :allowClear="false" @change="handleYear2Change" style="width: 120px" />
            </div>
          </div>

          <div class="table-container">
            <a-table :columns="examColumns" :data-source="examData" :pagination="false" bordered size="small" rowKey="rank" :loading="examLoading">
              <template #headerCell="{ column }">
                <template v-if="column.key === 'proportion'">
                  <span>
                    {{ column.title }}
                    <a-tooltip title="完成数量/（完成数量+待体检数量）">
                      <info-circle-outlined style="color: rgba(255, 255, 255, 0.6); margin-left: 4px" />
                    </a-tooltip>
                  </span>
                </template>
              </template>

              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'rank'">
                  <div class="rank-badge" :class="getRankClass(index + 1, examData.length)">
                    {{ index + 1 }}
                  </div>
                </template>
                <template v-if="column.key === 'proportion'">
                  <span :class="getRateClass(index + 1, examData.length)"> {{ record.proportion }}% </span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 接害人数及占比统计图表 -->
    <div class="panel-section" style="margin: 50px 0">
      <div class="section-header">
        <div class="title-bar">
          <span class="bar">|</span>
          <span class="title">各事业部接害人数及占比统计</span>
        </div>
      </div>
      <a-spin :spinning="exposureLoading">
        <div ref="exposureChartRef" style="width: 100%; height: 500px"></div>
      </a-spin>
    </div>

    <!-- 接害因素占比统计 -->
    <div class="panel-section" style="margin-top: 24px">
      <div class="section-header">
        <div class="title-bar">
          <span class="bar">|</span>
          <span class="title">接害因素占比统计</span>
        </div>
      </div>
      <a-spin :spinning="factorLoading">
        <div ref="factorChartRef" style="width: 100%; height: 500px"></div>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import type { Ref } from 'vue';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getOccupationalHealth1, getOccupationalHealth2, getOccupationalHealth3, getOccupationalHealth4 } from '../api';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';

  const year1 = ref<Dayjs>(dayjs().subtract(1, 'year'));
  const year2 = ref<Dayjs>(dayjs());
  const detectionData = ref([]);
  const examData = ref([]);
  const selectedOrgCode = ref(undefined);

  // Loading states
  const detectionLoading = ref(false);
  const examLoading = ref(false);
  const exposureLoading = ref(false);
  const factorLoading = ref(false);

  // --- 表格列定义 ---
  const columns = [
    {
      title: '序号',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
    },
    {
      title: '单位',
      dataIndex: 'orgName',
      key: 'orgName',
      align: 'center',
    },
    {
      title: '检测录入完成率',
      dataIndex: 'proportion',
      key: 'proportion',
      align: 'center',
    },
  ];

  const examColumns = [
    {
      title: '序号',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
    },
    {
      title: '单位',
      dataIndex: 'orgName',
      key: 'orgName',
      align: 'center',
    },
    {
      title: '体检完成率',
      dataIndex: 'proportion',
      key: 'proportion',
      align: 'center',
    },
  ];
  // 获取单位列表
  // const fetchFactorOrgCodeList = async () => {
  //   const res = await getFactorOrgCodeList();
  //   factorOrgCodeList.value = res || [];
  // };

  // --- 辅助函数 ---
  const getRankClass = (rank: number, total: number) => {
    if (rank <= 3) return 'rank-top';
    if (rank > total - 3) return 'rank-bottom';
    return 'rank-normal';
  };

  const getRateClass = (rank: number, total: number) => {
    if (rank <= 3) return 'text-success';
    if (rank > total - 3) return 'text-danger';
    return '';
  };
  const handleYear1Change = (date: Date | null) => {
    getFinishRate();
  };

  const handleYear2Change = (date: Date | null) => {
    getExamRate();
  };

  const updateOrgCode = (orgCode: any) => {
    selectedOrgCode.value = orgCode;
    getFinishRate();
    getExamRate();
    getFactorsProportion();
    getFactors();
  };

  // --- 图表相关 ---
  const exposureChartRef = ref<HTMLDivElement | null>(null);
  const { setOptions, resize: resizeExposure } = useECharts(exposureChartRef as Ref<HTMLDivElement>);

  // --- 接害因素占比统计图表 ---
  const factorChartRef = ref<HTMLDivElement | null>(null);
  const { setOptions: setFactorOptions, resize: resizeFactor } = useECharts(factorChartRef as Ref<HTMLDivElement>);

  const resize = () => {
    resizeExposure();
    resizeFactor();
  };

  const exposureData = ref<any>([]);
  const factorData = ref<any>([]);

  /**
   * 获取检测录入完成率
   */
  const getFinishRate = async () => {
    detectionLoading.value = true;
    const res = await getOccupationalHealth1({ year: year1.value.year(), orgCode: selectedOrgCode.value });
    detectionData.value = res || [];
    detectionLoading.value = false;
  };

  /**
   * 获取体检完成率
   */
  const getExamRate = async () => {
    examLoading.value = true;
    const res = await getOccupationalHealth2({ year: year2.value.year(), orgCode: selectedOrgCode.value });
    examData.value = res || [];
    examLoading.value = false;
  };

  /**
   * 获取接害人数及占比
   */
  const getFactorsProportion = async () => {
    exposureLoading.value = true;
    const res = await getOccupationalHealth3({ orgCode: selectedOrgCode.value });
    exposureData.value = res || [];
    initExposureChart();
    exposureLoading.value = false;
  };

  /**
   * 获取接害因素占比
   */
  const getFactors = async () => {
    factorLoading.value = true;
    const res = await getOccupationalHealth4({ orgCode: selectedOrgCode.value });
    factorData.value = res || [];
    initFactorChart();
    factorLoading.value = false;
  };
  const initExposureChart = () => {
    // 获取数据最大值以动态调整坐标轴范围，实现折线图在柱状图上方且不重叠
    const counts = exposureData.value.count || [];
    const rates = exposureData.value.rate || [];
    // 默认值防止数据为空或全为0的情况
    const maxCount = Math.max(...counts, 0) || 500;
    const maxRate = Math.max(...rates, 0) || 50;

    setOptions({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['接害人数', '接害人数占比'],
        bottom: 0,
        icon: 'circle',
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: exposureData.value.xData,
        axisLabel: {
          interval: 0,
          rotate: 30,
          color: '#666',
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          // 设置最大值为实际最大值的2倍，使柱状图只占据下半部分
          max: maxCount * 2,
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
          // 隐藏刻度、标签和名称
          axisLabel: { show: false },
          axisTick: { show: false },
          name: '',
        },
        {
          type: 'value',
          // 设置最小值为负的最大值，使0刻度线位于中间，折线图占据上半部分
          min: -maxRate - 100,
          max: maxRate,
          splitLine: {
            show: false,
          },
          // 隐藏刻度、标签和名称
          axisLabel: { show: false },
          axisTick: { show: false },
          name: '',
        },
      ],
      series: [
        {
          name: '接害人数',
          type: 'bar',
          data: exposureData.value.count,
          barWidth: 20,
          itemStyle: { color: '#6aa1e6' },
          label: {
            show: true,
            position: 'top',
            color: '#000',
            fontWeight: 'bold',
          },
        },
        {
          name: '接害人数占比',
          type: 'line',
          yAxisIndex: 1,
          data: exposureData.value.rate,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#ffaa00' },
          lineStyle: {
            width: 3,
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            color: '#ffaa00',
            fontWeight: 'bold',
          },
        },
      ],
    });
  };

  const initFactorChart = () => {
    // 根据factorData中xData的数组长度定义所有各不相同的颜色
    // 参考图表配色定义一组固定颜色
    const dynamicColors = [
      '#7294d4',
      '#86c28b',
      '#fba85d',
      '#d08a8a',
      '#9466e3',
      '#68d268',
      '#ff8585',
      '#fdd06b',
      '#a3ed6b',
      '#54ded6',
      '#85a5ff',
      '#b9a0ff',
      '#ffa085',
      '#ffe985',
      '#d2ff6b',
      '#54d2d2',
      '#85d2ff',
      '#a0b9ff',
      '#ff9fcf',
      '#ffb9cf',
      '#85dbff',
      '#ffb9b9',
      '#b9ffb9',
      '#ffe04d',
      '#ff7054',
      '#4be6d6',
      '#9e7af0',
      '#ff2d96',
      '#00c7ff',
      '#ff75c3',
      '#3dcf3d',
      '#ff520e',
      '#2499ff',
    ];

    setFactorOptions({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          const rate = factorData.value.rate ? factorData.value.rate[item.dataIndex] : 0;
          return `${item.marker} ${item.name}: ${item.value}人 (${rate}%)`;
        },
      },
      grid: {
        left: '3%',
        right: '2%',
        bottom: '12%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: factorData.value.xData || [],
        axisLabel: {
          interval: 0,
          rotate: 45,
          color: '#666',
          fontSize: 11,
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        name: '接害人数 (人)',
        nameTextStyle: {
          color: '#999',
          padding: [0, 0, 0, 20],
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee',
          },
        },
      },
      series: [
        {
          name: '接害人数',
          type: 'bar',
          data: factorData.value.count || [],
          barWidth: 15,
          itemStyle: {
            color: (params: any) => {
              return dynamicColors[params.dataIndex % dynamicColors.length];
            },
            borderRadius: [2, 2, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              // 这里的 factorData 结构不确定是否是之前的静态数组还是现在的 ref 对象
              // 根据上下文，factorData 现在是 ref，且包含 count, rate 等数组
              // 所以这里应该直接从 params.value 获取或者从 factorData.value.rate 获取
              const rate = factorData.value.rate ? factorData.value.rate[params.dataIndex] : 0;
              return `${rate}%`;
            },
            color: '#333',
            fontSize: 10,
            fontWeight: 'bold',
          },
        },
      ],
    });
  };

  const init = async () => {
    console.log('OccupationalHealthPanel init with range:');
    await Promise.all([getFinishRate(), getExamRate(), getFactorsProportion(), getFactors()]);
  };

  defineExpose({
    resize,
    init,
    updateOrgCode,
  });
  onMounted(() => {
    getFinishRate();
    getExamRate();
    getFactorsProportion();
    getFactors();
  });
</script>

<style lang="less" scoped>
  .occupational-health-panel {
    padding: 16px;
    background: #fff;
    border-radius: 4px;

    .panel-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-bar {
        display: flex;
        align-items: center;
        gap: 8px;

        .bar {
          color: #1890ff;
          font-weight: bold;
          font-size: 16px;
        }

        .title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
      }

      .year-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #666;
      }
    }

    .table-container {
      :deep(.ant-table-thead > tr > th) {
        background: #725eab; // Purple background from image
        color: #fff;
        font-weight: bold;
        border-bottom: none;
      }

      :deep(.ant-table-tbody > tr > td) {
        padding: 12px 16px;
      }
    }

    .rank-badge {
      width: 24px;
      height: 24px;
      line-height: 24px;
      border-radius: 50%;
      text-align: center;
      margin: 0 auto;
      color: #fff;
      font-size: 12px;
      font-weight: bold;

      &.rank-top {
        background-color: #ffc107; // Gold
      }

      &.rank-bottom {
        background-color: #ff4d4f; // Red
      }

      &.rank-normal {
        background-color: #8c8c8c; // Grey
      }
    }

    .text-success {
      color: #52c41a;
      font-weight: bold;
    }

    .text-danger {
      color: #ff4d4f;
      font-weight: bold;
    }
  }
</style>
