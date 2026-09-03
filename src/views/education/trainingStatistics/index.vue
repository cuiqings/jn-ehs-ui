<template>
  <div class="training-statistics">
    <a-card :bordered="false">
      <!-- 查询表单 -->
      <a-form layout="inline" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" :model="queryParam" @keyup.enter.native="searchQuery">
        <a-row style="width: 100%" :gutter="24">
          <a-col :span="6">
            <a-form-item label="培训时间">
              <a-range-picker format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" v-model:value="queryParam.trainingTime" />
            </a-form-item>
          </a-col>
          <a-col :span="6" :sm="12">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>

      <!-- 统计图表 -->
      <a-row :gutter="24">
        <a-col :span="24">
          <a-card>
            <template #title>
              <div style="display: flex; align-items: center">
                <span>各单位培训统计（人次）</span>
                <SyncOutlined style="font-size: 20px; cursor: pointer; color: #1890ff; margin-left: 10px" @click="chartBack" />
              </div>
            </template>
            <div ref="departmentChart" style="height: 400px"></div>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="24" style="margin-top: 24px">
        <a-col :span="24">
          <a-card title="各项目培训统计（人次）">
            <div ref="projectChart" style="height: 400px"></div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 数据表格 -->
      <a-card style="margin-top: 24px">
        <template #title>
          <div>
            <span>培训报表</span>
            <a-button type="primary" style="margin-left: 10px" @click="exportExcel()">导出</a-button>
          </div>
        </template>
        <a-table ref="table" size="middle" bordered rowKey="id" :loading="loading" :columns="columns" :dataSource="dataSource" :pagination="false">
          <template #bodyCell="{ column, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
          </template>
        </a-table>
      </a-card>
    </a-card>
  </div>
</template>

<script lang="ts" setup name="TrainingStatistics">
  import { getTrainingStatisticsList, getTrainingStatisticsCharts, getProjectTrainData } from '/@/api/education/trainingStatistics';
  import type { TrainingStatisticsItem } from '/@/api/education/trainingStatistics';
  import { SyncOutlined } from '@ant-design/icons-vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';
  import * as echarts from 'echarts';

  const router = useRouter();
  const loading = ref<boolean>(false);
  const departmentChart = ref();
  const projectChart = ref();
  const queryParam = ref({
    trainingName: '',
    trainingTime: [],
    trainingType: undefined,
    startDate: '',
    endDate: '',
  });
  const userStore = useUserStore();
  const trainObject = userStore.getAllDictItems.edu_train_project;
  console.log(trainObject);

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      align: 'center',
      fixed: 'left',
    },
    {
      title: '单位',
      dataIndex: '单位',
      width: 220,
      fixed: 'left',
    },
    {
      title: '合计',
      dataIndex: '合计',
      width: 80,
      fixed: 'left',
    },
    {
      title: '培训项目',
      children: [],
    },
  ];
  if (trainObject.length > 0) {
    trainObject.forEach((item) => {
      columns[3].children.push({
        title: item.text,
        dataIndex: item.text,
        width: 150,
        align: 'center',
      });
    });
  }
  const dataSource = ref<TrainingStatisticsItem[]>([]);
  const ipagination = ref({
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30', '40', '50'],
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0,
  });

  const curLevel = ref(1);
  const initCharts = () => {
    // 各单位培训统计图表
    const departmentChartInstance = echarts.init(departmentChart.value);
    departmentChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        top: 20,
        left: '30',
        right: '10',
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
          interval: 0,
          rotate: 45,
          formatter: (params) => {
            var val = '';
            if (params.length > 4) {
              val = params.substr(0, 4) + '...';
              return val;
            } else {
              return params;
            }
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          interval: 10,
        },
        {
          type: 'value',
          min: 0,
          max: 100,
          interval: 10,
          axisLabel: {
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '人次',
          type: 'bar',
          barWidth: 10,
          data: [],
          itemStyle: {
            color: '#00b050',
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              return !params.data ? '' : params.data;
            },
          },
        },
        {
          name: '完成率',
          type: 'line',
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: [],
        },
      ],
    });
    departmentChartInstance.on('click', (params) => {
      if (curLevel.value == 2) return;
      curLevel.value = 2;
      queryParam.value.orgCode = params.name;
      loadChartData();
    });

    // 各项目培训统计图表
    const projectChartInstance = echarts.init(projectChart.value);
    projectChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        top: 20,
        left: '30',
        right: '10',
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
          interval: 0,
          rotate: 45,
          formatter: (params) => {
            var val = '';
            if (params.length > 4) {
              val = params.substr(0, 4) + '...';
              return val;
            } else {
              return params;
            }
          },
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          type: 'bar',
          data: [],
          barWidth: 20,
          itemStyle: {
            color: '#8faadc',
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              return !params.data ? '' : params.data;
            },
          },
        },
      ],
    });

    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', () => {
      departmentChartInstance.resize();
      projectChartInstance.resize();
    });
  };

  const chartBack = () => {
    curLevel.value = 1;
    queryParam.value.orgCode = '';
    loadChartData();
  };
  // 组件销毁时取消监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', () => {});
  });

  const searchQuery = async () => {
    loading.value = true;
    try {
      const params = {
        ...queryParam.value,
        pageNo: ipagination.value.current,
        pageSize: ipagination.value.pageSize,
      };
      if (queryParam.value.trainingTime && queryParam.value.trainingTime.length > 0) {
        queryParam.value.startDate = queryParam.value.trainingTime[0];
        queryParam.value.endDate = queryParam.value.trainingTime[1];
      }
      const result = await getTrainingStatisticsList(params);
      dataSource.value = result || [];
      loadChartData();
    } catch (error) {
      console.error('获取培训统计数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const loadChartData = async () => {
    try {
      const result: any = await getTrainingStatisticsCharts(queryParam.value);
      if (result) {
        // 更新部门统计图表
        const departmentChartInstance = echarts.init(departmentChart.value);
        let lMax = Number(Math.max(...result.seriesData));
        let lMin = Number(Math.min(...result.seriesData));
        let rMax = 100;
        let rMin = 0;
        lMax = Math.ceil(lMax / 100) * 100;
        lMin = Math.floor(lMin / 100) * 100;
        rMax = Math.ceil(rMax / 10) * 10;
        rMin = Math.floor(rMin / 10) * 10;
        let splitNumber = 10;
        let lInterval = lMax / splitNumber;
        let rInterval = rMax / splitNumber;

        departmentChartInstance.setOption({
          xAxis: {
            data: result.xdata || [],
          },
          yAxis: [
            {
              type: 'value',
              alignTicks: true,
              min: lMin,
              max: lMax,
              interval: lInterval,
            },
            {
              type: 'value',
              min: 0,
              max: 100,
              interval: rInterval,
              axisLabel: {
                formatter: '{value} %',
              },
            },
          ],
          series: [
            {
              data: result.seriesData || [],
            },
            {
              data: result.finishRate || [],
            },
          ],
        });
      }
      const result2: any = await getProjectTrainData(queryParam.value);
      if (result2) {
        // 更新项目统计图表
        const projectChartInstance = echarts.init(projectChart.value);
        projectChartInstance.setOption({
          xAxis: {
            data: result2.xdata || [],
          },
          series: [
            {
              data: result2.seriesData || [],
            },
          ],
        });
      }
    } catch (error) {
      console.error('获取图表数据失败:', error);
    }
  };

  const searchReset = () => {
    queryParam.value = {
      trainingName: '',
      trainingTime: [],
      startDate: '',
      endDate: '',
      trainingType: undefined,
    };
    curLevel.value = 1;
    searchQuery();
  };

  function PageInit() {
    initCharts();
    searchQuery();
    loadChartData();
  }

  const exportExcel = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('培训报表-' + dateFormat(new Date(), 'yyyy-MM-dd'), '/edu/statistics/trainReportDataExport', queryParam.value);
  };

  onMounted(() => {
    PageInit();
  });
</script>

<style lang="less" scoped>
  .training-statistics {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
