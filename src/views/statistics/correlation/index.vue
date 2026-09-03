<template>
  <div class="sm-dashboard">
    <!-- Filters -->
    <a-card class="filter-card">
      <a-form
        :label-col="{
          xs: { span: 12 },
          sm: { span: 7 },
        }"
        :wrapper-col="{
          xs: { span: 12 },
          sm: { span: 17 },
        }"
      >
        <a-row :gutter="[16, 16]">
          <a-col :span="6">
            <a-form-item label="发包单位">
              <a-select
                v-model:value="orgCode"
                placeholder="请选择"
                allow-clear
                show-search
                style="width: 100%"
                :options="orgOptions"
                :disabled="orgOptions.length === 1"
                :filterOption="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="相关方名称">
              <a-select
                v-model:value="xgfCode"
                placeholder="请选择"
                allow-clear
                show-search
                style="width: 100%"
                :options="partyOptions"
                :filterOption="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <!-- KPIs -->
    <a-row :gutter="[16, 16]">
      <a-col :span="4">
        <a-card title="相关方统计">
          <a-col :span="24" class="kpi-item">
            <div class="kpi-value">{{ xgfTotal }}</div>
            <div class="kpi-label">施工单位</div>
          </a-col>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="项目统计">
          <a-row>
            <a-col :span="6" class="kpi-item" style="color: #1677ff">
              <div class="kpi-value">{{ projectStatistics['审批中'] }}</div>
              <div class="kpi-label" style="color: #1677ff">审批中</div>
            </a-col>
            <a-col :span="6" class="kpi-item" style="color: #f59a23">
              <div class="kpi-value">{{ projectStatistics['待作业'] }}</div>
              <div class="kpi-label" style="color: #f59a23">待作业</div>
            </a-col>
            <a-col :span="6" class="kpi-item" style="color: #43b28f">
              <div class="kpi-value">{{ projectStatistics['施工作业中'] }}</div>
              <div class="kpi-label" style="color: #43b28f">施工作业中</div>
            </a-col>
            <a-col :span="6" class="kpi-item">
              <div class="kpi-value">{{ projectStatistics['已结束'] }}</div>
              <div class="kpi-label">已结束</div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="人员统计">
          <a-row>
            <a-col :span="4" class="kpi-item">
              <div class="kpi-value">{{ personnelStatistics['未进场'] }}</div>
              <div class="kpi-label">未进场</div>
            </a-col>
            <a-col :span="4" class="kpi-item">
              <div class="kpi-value kpi-red">{{ personnelStatistics['离场'] }}</div>
              <div class="kpi-label kpi-red">离场</div>
            </a-col>
            <a-col :span="4" class="kpi-item">
              <div class="kpi-value kpi-green">{{ personnelStatistics['在厂'] }}</div>
              <div class="kpi-label kpi-green">在厂</div>
            </a-col>
            <a-col :span="4" class="kpi-item">
              <div class="kpi-value kpi-green">{{ personnelStatistics['正常'] }}</div>
              <div class="kpi-label kpi-green">正常</div>
            </a-col>
            <a-col :span="4" class="kpi-item">
              <div class="kpi-value kpi-red">{{ personnelStatistics['到期'] }}</div>
              <div class="kpi-label kpi-red">到期</div>
            </a-col>
            <a-col :span="4" class="kpi-item">
              <div class="kpi-value kpi-orange">{{ personnelStatistics['即将到期'] }}</div>
              <div class="kpi-label kpi-orange">即将到期</div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts -->
    <a-row :gutter="[16, 16]" class="chart-row">
      <a-col :span="8">
        <a-card>
          <template #title> 企业扣分top10 </template>
          <a-spin :spinning="projectLoading">
            <div ref="projectChartRef" style="height: 400px"></div>
          </a-spin>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <template #title> 个人扣分top10 </template>
          <a-spin :spinning="personnelLoading">
            <div ref="personnelChartRef" style="height: 400px"></div>
          </a-spin>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <template #title> 资质统计 (在厂人员) </template>
          <a-spin :spinning="qualificationLoading">
            <div ref="qualificationChartRef" style="height: 400px"></div>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="sm-dashboard">
  // @ts-nocheck
  // ^^^ TS Nocheck added for now to allow compilation despite Ant Design Vue's type issues ^^^
  // TODO: Remove ts-nocheck once type issues are resolved or properly handled.

  import { ref, onMounted, onUnmounted, Ref } from 'vue'; // 移除未使用的 nextTick, 引入 Ref
  import {
    Card as ACard,
    Row as ARow,
    Col as ACol,
    Form as AForm,
    FormItem as AFormItem,
    DatePicker as ADatePicker,
    Select as ASelect,
    Button as AButton,
    Spin as ASpin,
  } from 'ant-design-vue';
  import * as echarts from 'echarts/core';
  import { BarChart, PieChart, PictorialBarChart } from 'echarts/charts';
  import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, DatasetComponent } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  import { getOrganizationNew, getDetailList, statistics1, statistics2, statistics3, statistics4, aptitudeStatistics } from './api';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import dayjs from 'dayjs';
  // ECharts modules registration
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DatasetComponent,
    BarChart,
    PieChart,
    PictorialBarChart,
    CanvasRenderer,
  ]);

  const ARangePicker = ADatePicker.RangePicker;

  // Refs for chart elements
  const projectChartRef = ref<HTMLElement | null>(null);
  const personnelChartRef = ref<HTMLElement | null>(null);
  const qualificationChartRef = ref<HTMLElement | null>(null);

  // Filter states
  // 获取当前月份的第一天
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  // 获取当前月份的最后一天
  const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
  const dateRange: Ref<[string, string]> = ref([startOfMonth, endOfMonth]);
  const orgCode = ref(undefined);
  const xgfCode = ref(undefined);
  const xgfTotal = ref(0);
  const projectStatistics = ref({
    审批中: 0,
    施工作业中: 0,
    已结束: 0,
  });
  const personnelStatistics = ref({
    未进场: 0,
    离场: 0,
    在厂: 0,
    正常: 0,
    到期: 0,
    即将到期: 0,
  });
  // Placeholder options for selects
  const orgOptions: any = ref([]);
  const partyOptions: any = ref([]);

  // Chart instances
  let projectChart: echarts.ECharts | null = null;
  let personnelChart: echarts.ECharts | null = null;
  let qualificationChart: echarts.ECharts | null = null;

  // Loading 状态
  const projectLoading = ref(false);
  const personnelLoading = ref(false);
  const qualificationLoading = ref(false);

  // Placeholder chart options
  const projectChartOption = (data: any) => {
    projectChart?.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '40',
        top: 20,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 100,
      },
      yAxis: {
        type: 'category',
        data: data.xData,
      },
      series: [
        {
          type: 'bar',
          barWidth: '20',
          data: data.data,
        },
      ],
    });
  };
  const personnelChartOption = (data: any) => {
    personnelChart?.setOption({
      color: ['#e94141'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        top: 20,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: data.xData,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          max: 100,
        },
      ],
      series: [
        {
          name: 'Direct',
          type: 'bar',
          barWidth: '60%',
          data: data.data,
        },
      ],
    });
  };
  // 小人 SVG 路径（已简化）
  const personSymbol =
    'path://M18.2629891,11.7131596 L6.8091608,11.7131596 C1.6685112,11.7131596 0,13.032145 0,18.6237673 L0,34.9928467 C0,38.1719847 4.28388932,38.1719847 4.28388932,34.9928467 L4.65591984,20.0216948 L5.74941883,20.0216948 L5.74941883,61.000787 C5.74941883,65.2508314 11.5891201,65.1268798 11.5891201,61.000787 L11.9611506,37.2137775 L13.1110872,37.2137775 L13.4831177,61.000787 C13.4831177,65.1268798 19.3114787,65.2508314 19.3114787,61.000787 L19.3114787,20.0216948 L20.4162301,20.0216948 L20.7882606,34.9928467 C20.7882606,38.1719847 25.0721499,38.1719847 25.0721499,34.9928467 L25.0721499,18.6237673 C25.0721499,13.032145 23.4038145,11.7131596 18.2629891,11.7131596 M12.5361629,1.11022302e-13 C15.4784742,1.11022302e-13 17.8684539,2.38997966 17.8684539,5.33237894 C17.8684539,8.27469031 15.4784742,10.66467 12.5361629,10.66467 C9.59376358,10.66467 7.20378392,8.27469031 7.20378392,5.33237894 C7.20378392,2.38997966 9.59376358,1.11022302e-13 12.5361629,1.11022302e-13';
  const qualificationChartOption = (data: any) => {
    qualificationChart?.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c}人',
      },
      grid: {
        left: '20%',
        right: '10%',
        top: '5%',
        bottom: '8%',
      },
      yAxis: {
        type: 'category',
        data: ['正常(含即将到期)', '限制进厂', '即将到期'],
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      xAxis: {
        type: 'value',
        max: Math.ceil(Math.max(...data) * 1.2),
        interval: Math.ceil(Math.ceil(Math.max(...data) * 1.2) / 5), // 可选：明确指定刻度间隔
        axisLine: { show: true },
        axisTick: { show: true },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          type: 'pictorialBar',
          symbol: personSymbol,
          symbolRepeat: true,
          symbolSize: [25, 50],
          symbolMargin: 2,
          symbolBoundingData: 500,
          label: {
            show: true,
            position: 'right',
            formatter: '{@value} 人',
            color: '#666',
          },
          itemStyle: {
            color: ({ dataIndex }) => ['#6cbd7e', '#ff4757', '#ffa940'][dataIndex],
            opacity: 0.8,
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          data,
          animationType: 'scale',
          animationEasing: 'elasticOut',
        },
      ],
      legend: {
        data: ['正常(含即将到期)', '限制进厂', '即将到期'],
        orient: 'vertical',
        right: 10,
        top: 'middle',
        itemStyle: { borderColor: '#666' },
        icon: 'circle',
      },
    });
  };
  // Functions
  const handleSearch = () => {
    initCharts();
    statistics1({publishCode: orgCode.value}).then((res) => {
      xgfTotal.value = res;
    });
    statistics2({publishCode: orgCode.value}).then((res) => {
      projectStatistics.value = res;
    });
  };

  const handleReset = () => {
    dateRange.value = [startOfMonth, endOfMonth];
    orgCode.value = orgOptions.value.length === 1 ? orgOptions.value[0]?.value : undefined;
    xgfCode.value = undefined;
    initCharts();
  };

  const initCharts = async () => {
    loadChartData();
  };

  const loadChartData = async () => {
    // --- 加载项目统计数据 ---
    projectLoading.value = true;
    statistics3({
      publishCode: orgCode.value,
    })
      .then((res) => {
        const colors = {
          审批中: '#5470c6',
          施工作业中: '#91cc75',
          已结束: '#ee6666',
        };
        let data = {
          xData: [],
          data: [],
          itemStyle: [],
        };
        res.map((item) => {
          data.xData.push(item.companyName);
          data.data.push(item.score);
          data.itemStyle.push({ color: colors[item.status] });
        });
        projectChart = echarts.init(projectChartRef.value);
        console.log(data);
        
        projectChartOption(data);
      })
      .catch((error) => {
        console.error('加载项目统计数据失败:', error);
      })
      .finally(() => {
        projectLoading.value = false;
      });

    // --- 加载人员状态统计数据 ---
    personnelLoading.value = true;
    statistics4({
      xgfCode: xgfCode.value,
    })
      .then((res) => {
        let data = {
          xData: [],
          data: [],
          itemStyle: [],
        };
        res.map((item) => {
          data.xData.push(item.name);
          data.data.push(item.score || 0);
        });
        personnelChart = echarts.init(personnelChartRef.value);
        personnelChartOption(data);
      })
      .catch((error) => {
        console.error('加载人员状态统计数据失败:', error);
      })
      .finally(() => {
        personnelLoading.value = false;
      });

    // --- 加载资质统计数据 (在厂人员) ---
    qualificationLoading.value = true;
    aptitudeStatistics({
      xgfCode: xgfCode.value,
    })
      .then((res) => {
        const data = ['正常', '到期', '即将到期'].map((item) => {
          return res[item];
        });
        qualificationChart = echarts.init(qualificationChartRef.value);
        qualificationChartOption(data);
      })
      .catch((error) => {
        console.error('加载资质统计数据失败:', error);
      })
      .finally(() => {
        qualificationLoading.value = false;
      });
  };

  const resizeCharts = () => {
    projectChart?.resize();
    personnelChart?.resize();
    qualificationChart?.resize();
  };
  const initData = async () => {
    try {
      const res = await getDepart3ListWithSecurity();
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      if (orgOptions.value.length === 1) {
        orgCode.value = orgOptions.value[0]?.value;
      }
    } catch (error) {
      console.error(error);
    }
    try {
      const res = await getDetailList();
      partyOptions.value = res.map((item) => {
        return {
          label: item.companyName,
          value: item.orgCode,
        };
      });
    } catch (error) {
      console.error(error);
    }
    statistics1({publishCode: orgCode.value}).then((res) => {
      xgfTotal.value = res;
    });
    statistics2({publishCode: orgCode.value}).then((res) => {
      projectStatistics.value = res;
    });
    aptitudeStatistics({xgfCode: xgfCode.value}).then((res) => {
      personnelStatistics.value = res;
    });
  };
  
  

  onMounted(async () => {
    await initData();
    initCharts();
    window.addEventListener('resize', resizeCharts);
  });

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', resizeCharts);
    projectChart?.dispose();
    personnelChart?.dispose();
    qualificationChart?.dispose();
  });
</script>

<style lang="less" scoped>
  .sm-dashboard {
    padding: 16px;
    background-color: #f0f2f5; // Match background color if needed

    .kpi-item {
      text-align: center;
      padding: 10px 0;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
      text-align: center; // Center KPI values if needed
    }

    .kpi-label {
      font-size: 14px;
      color: #8c8c8c;
      text-align: center;
    }
    .kpi-red {
      color: #ff4d4f;
    }
    .kpi-green {
      color: #52c41a;
    }
    .kpi-orange {
      color: #faad14;
    }
    .filter-card {
      margin-top: 16px;
      .ant-form-item {
        margin-bottom: 8px; // Reduce margin for inline form
      }
      // Specific adjustments if hints overlap
      :deep(.ant-form-item-control) {
        padding-bottom: 0; // Add padding to make space for the hint
      }
    }

    .chart-row {
      margin-top: 16px;
    }
    // Center card titles if needed
    :deep(.ant-card-head-title) {
      text-align: left; // Default, change to center if needed
      font-size: 16px;
      font-weight: bold;
    }

    :deep(.ant-card-body) {
      padding: 16px; // Adjust card body padding if needed
    }
  }
</style>
