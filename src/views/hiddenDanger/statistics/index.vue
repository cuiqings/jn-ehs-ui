<template>
  <div>
    <BasicTable @register="registerTable" :searchInfo="queryParams">
      <template #chartContent>
        <div class="chart">
          <div style="padding-right: 4px">
            <a-row :gutter="8">
              <a-col :lg="6">
                <div class="card">
                  <div class="title">巡检计划统计</div>
                  <div ref="executeChart" :style="{ height: '218px', width: '100%' }"></div>
                </div>
              </a-col>
              <a-col :lg="18">
                <div class="card">
                  <div class="title">各单位完成情况</div>
                  <div ref="completeChart" :style="{ height: '218px', width: '100%' }"></div>
                </div>
              </a-col>
              <!-- <a-col :lg="11">
                <div class="card">
                  <div class="title">各类计划完成率</div>
                  <div ref="planCompleteChart" class="content" :style="{ height: '218px', width: '100%' }">
                    <div class="item" v-for="(item, idx) in circleData" :style="{ width: 100 / circleData.length + '%' }" ref="circleRef" :key="idx">
                    </div>
                  </div>
                </div>
              </a-col> -->
            </a-row>
          </div>
        </div>
      </template>
      <template #tableTitle>
        <div class="flex">
          <div class="left">
            <span class="split-line"></span>
            <span>任务完成情况统计</span>
          </div>
          <div class="right">
            <a-form :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-row :gutter="24">
                <a-col :lg="4">
                  <a-button v-auth="'hiddenDanger:statistics:export'" type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls"
                    >导出</a-button
                  >
                </a-col>
              </a-row>
            </a-form>
          </div>
        </div>
      </template>
    </BasicTable>
    <div class="no-complete-wrapper">
      <div class="nav-title">
        <span class="split-line"></span>
        <span>未完成任务列表</span>
      </div>
      <a-table :bordered="true" :columns="noCompleteColumns" :dataSource="noCompleteDataSource" :pagination="ipagination" @change="tableChange">
        <template #bodyCell="{ column, text, index }">
          <template v-if="column.dataIndex === 'checkCycle'">
            {{ replaceDict(text) }}
          </template>
          <template v-if="column.dataIndex === 'index'">
            {{ (ipagination.current - 1) * ipagination.pageSize + Number(index) + 1 }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" name="hiddenDanger-statistics" setup>
  import {
    getDepart2List,
    getDepart3List,
    statistics1,
    statistics2,
    statistics3,
    statistics4,
    statistics5,
    statistics4ExportXls,
  } from '../../app/hiddenDanger/index.api';
  import { columns, searchFormSchema, noCompleteColumns } from './statistics.data';
  import { onMounted, onUnmounted, reactive, ref, computed, nextTick } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import * as echarts from 'echarts';
  import dayjs from 'dayjs';
  import { render } from '/@/utils/common/renderUtils';

  let org = undefined;
  let queryParam = {};
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 7 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });
  const userStore: any = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const queryParams = ref<{
    beginTime: string;
    endTime: string;
    org: string | undefined;
    depart: string | undefined;
  }>({
    beginTime: dayjs(new Date()).format('YYYY-MM-DD'),
    endTime: dayjs(new Date()).format('YYYY-MM-DD'),
    org: userinfo.value.orgCode.slice('0', '6'),
    depart: '',
  });

  if (userinfo.value.orgCode.length > 6) {
    queryParams.value.org = userinfo.value.orgCode.slice('0', '6');
    queryParams.value.depart = userinfo.value.orgCode.substr(0, 9);
  } else {
    queryParams.value.org = userinfo.value.orgCode.length < 6 ? null : userinfo.value.orgCode;
    queryParams.value.depart = undefined;
  }

  const replaceDict = (text) => {
    return render.renderDict(text, 'yh_inspection_cycle').children;
  };

  // 巡检计划统计
  const executeChart = ref();
  const executeEl = ref();
  const ipagination = ref({
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0,
  });
  const noCompleteDataSource = ref([]);
  // 巡检计划统计请求
  function getStatistics1(val: any) {
    const params = {
      ...val,
    };
    if(!params.org) params.org =  userinfo.value.orgCode.slice('0', '6');
    statistics1(params).then((res) => {
      renderExecute(res);
    });
  }
  function renderExecute(data: any) {
    if (executeEl.value) executeEl.value.dispose();
    executeEl.value = echarts.init(executeChart.value);
    const params = { 已完成: data.completedCount, 未完成: data.uncompleteCount, 总任务数: data.totalCount };
    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        left: 'center',
        bottom: 8,
        formatter: function (name) {
          return `${name} ${params[name]}`;
        },
      },
      color: ['#13a74a', '#e99d43'],
      series: [
        {
          name: '巡检计划统计',
          type: 'pie',
          radius: ['35%', '60%'],
          center: ['50%', '46%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            position: 'center',
            show: true,
            formatter: () => {
              let str = '总任务数' + '\n' + `${params['总任务数']}`;
              return str;
            },
            color: '#1E7CE8',
            lineHeight: 16,
            fontSize: 12,
          },
          // label: {
          //   normal: {
          //     show: true,
          //     textStyle: {
          //       fontWeight: 300,
          //       fontSize: 12,
          //     },
          //     formatter: '{b} {c}',
          //   },
          // },
          data: [
            { name: '已完成', value: data.completedCount },
            { name: '未完成', value: data.uncompleteCount },
          ],
        },
      ],
    };
    executeEl.value.setOption(option);
  }

  // 各部门巡检计划完成情况
  const completeChart = ref();
  let completeEl;
  function getStatistics2(val: any) {
    const params = {
      ...val,
    };
    statistics2(params).then((res) => {
      renderComplete(res);
    });
  }
  function renderComplete(data: any) {
    const xAxisData = Object.keys(data);
    const data1: number[] = [];
    const data2: number[] = [];
    const data3: number[] = [];

    xAxisData.map((v) => {
      data1.push(data[v][1]);
      data2.push(data[v][2]);
      data3.push((data[v][3] * 100).toFixed(0));
    });

    const min1 = _getMinValue([...data1, ...data2]);
    const max1 = _getMaxValue([...data1, ...data2]);
    if (completeEl) completeEl.dispose();
    completeEl = echarts.init(completeChart.value);
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none',
          crossStyle: {
            color: '#999',
          },
        },
      },
      legend: {
        top: 3,
        data: ['已巡检', '未巡检', '巡检完成率'],
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      grid: {
        top: 30,
        left: 55,
        bottom: 33,
        right: 55,
      },
      yAxis: [
        {
          type: 'value',
          min: min1,
          max: max1,
          minInterval: 1,
          alignTicks: true,
          axisLabel: {
            formatter: '{value} ',
          },
        },
        {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20,
          minInterval: 1,
          alignTicks: true,
          axisLabel: {
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '已巡检',
          type: 'bar',
          barWidth: '30',
          data: data1,
        },
        {
          name: '未巡检',
          barWidth: '30',
          type: 'bar',
          data: data2,
        },
        {
          name: '巡检完成率',
          type: 'line',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter: function (val) {
              if (val.value == 0) {
                return '';
              } else {
                return val.value + ' %';
              }
            },
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: data3,
        },
      ],
    };
    completeEl.setOption(option);
  }

  function _getMaxValue(arr) {
    const max = Math.max(...arr);
    // 这样处理是为了不让最大值刚好到坐标轴最顶部
    return Math.ceil(max / 9.5) * 10;
  }
  function _getMinValue(arr) {
    const min = Math.min(...arr);
    // 这样处理是为了不让最大值刚好到坐标轴最底部
    return Math.floor(min / 12) * 10;
  }

  // 各类计划完成率
  const planCompleteChart = ref();
  const abnormalEl = ref();
  function getStatistics3(val: any) {
    const params = {
      ...val,
    };
    if(!params.org) params.org = userinfo.value.orgCode;
    statistics3(params).then((res) => {
      renderAbnormal(res);
    });
  }
  const circleData = ref<any[]>([]);
  const circleRef = ref<any>(null);
  const circleChartCase = ref<any[]>([]);

  function renderAbnormal(data: any) {
    const itemKey = Object.keys(data);
    circleData.value = itemKey;
    if (circleChartCase.value && circleChartCase.value.length > 0) {
      circleChartCase.value.map((val) => {
        val.dispose();
      });
    }
    let option = {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          color: ['#54bcbd', '#b3b3b3'],
          avoidLabelOverlap: false,

          label: {
            show: false,
            position: 'inside',
            formatter: '{b}: {c}',
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 1048, name: '完成' },
            { value: 735, name: '未完成' },
          ],
          title: [],
        },
      ],
    };
    itemKey.map((v, i) => {
      let obj = JSON.parse(JSON.stringify(option));
      obj.title = [
        {
          text: v,
          left: 'center',
          bottom: 0,
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal',
          },
        },
        {
          text: (data[v][3] * 100).toFixed(0) + '%',
          left: 'center',
          top: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
        },
      ];
      obj.series[0].data = [
        { value: data[v][1], name: '完成' },
        { value: data[v][2], name: '未完成' },
      ];
      // obj.series[0].emphasis = {
      //   label: {
      //     show: true,
      //     fontSize: 14,
      //     position: 'outside',
      //     fontWeight: 'bold',
      //     bottom: 20,
      //     // formatter: '完成率: ' + data[v][3] * 100 + '%',
      //     formatter: '{b}: {c}',
      //   },
      // };
      nextTick(() => {
        const circleChart = echarts.init(circleRef.value[i]);

        circleChart.setOption(obj);
        circleChartCase.value.push(circleChart);
      });
    });
  }

  const { tableContext } = useListPage({
    designScope: 'statistics',
    tableProps: {
      api: statistics4,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        autoAdvancedCol: 3,
      },
      handleSearchInfoFn(info) {
        const { time, org } = info;
        const searchForm = getForm();

        if (time) {
          info.beginTime = time.split(',')[0] + ' 00:00:00';
          info.endTime = time.split(',')[1] + ' 23:59:59';
        } else {
          info.beginTime = dayjs(new Date()).format('YYYY-MM-DD') + ' 00:00:00';
          info.endTime = dayjs(new Date()).format('YYYY-MM-DD') + ' 23:59:59';
          searchForm.setFieldsValue({
            time: dayjs(new Date()).format('YYYY-MM-DD') + ',' + dayjs(new Date()).format('YYYY-MM-DD'),
          });
        }
        if (org) {
          info.org = org;
          searchForm.setFieldsValue({
            org: org,
          });
        } else {
          info.org = userinfo.value.orgCode.slice('0', '6');
          // searchForm.setFieldsValue({
          //   org: userinfo.value.orgCode.slice('0', '6'),
          // });
        }
        queryParams.value = Object.assign({}, info);
        getStatistics1(queryParams.value);
        getStatistics2(queryParams.value);
        getStatistics3(queryParams.value);
        getStatistics5();
        // reload();
        setExportName(info.org);
        return queryParams.value;
      },
      beforeFetch: (params) => {
        const { time } = params;
        if (time) {
          params.beginTime = time.split(',')[0] + ' 00:00:00';
          params.endTime = time.split(',')[1] + ' 23:59:59';
        }
        setExportName(params.orgCode);
        return params;
      },
      immediate: false,
      showIndexColumn: true,
      showActionColumn: false,
    },
  });
  const [registerTable, { reload, getForm }] = tableContext;
  const orgTree = ref<{ label: string; value: string }[]>([]);
  // 获取二级机构
  async function getOrgList() {
    getDepart2List({}).then(async (res) => {
      const orgOptions = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      orgTree.value = orgOptions;
      const searchForm = await getForm();
      searchForm.setFieldsValue({
        time: queryParams.value.beginTime + ',' + queryParams.value.endTime,
      });
      searchForm.updateSchema({
        field: 'org',
        componentProps: {
          options: orgOptions,
          placeholder: '请选择',
          // disabled: orgOptions.length === 1,
          onChange: (value: any) => {
            searchForm.setFieldsValue({
              depart: null,
            });
            searchForm.updateSchema({
              field: 'depart',
              componentProps: {
                options: [],
                placeholder: '请选择',
              },
            });
            getDepart(value);
          },
        },
      });
      searchForm.setFieldsValue({
        org: orgOptions.length === 1 ? orgOptions[0].value : queryParams.value.org,
      });
      if (orgOptions.length === 1 || queryParams.value.org) {
        getDepart(queryParams.value.org || orgOptions[0].value);
      }
    });
  }
  getOrgList();
  setExportName(userinfo.value.orgCode);
  function setExportName(code) {
    let str = '';
    orgTree.value.map((val) => {
      if (val.value === code) {
        str = val.label;
      }
    });
    return str;
  }
  // 获取三级机构
  function getDepart(code) {
    if (!code) return;
    getDepart3List({ orgCode: code }).then(async (res) => {
      const departOptions = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      const searchForm = await getForm();
      searchForm.updateSchema({
        field: 'depart',
        componentProps: {
          options: departOptions,
          placeholder: '请选择',
        },
      });
      // if (queryParams.value.depart) {
      //   searchForm.setFieldsValue({
      //     depart: queryParams.value.depart,
      //   });
      // }
    });
  }
  function tableChange(pagination) {
    ipagination.value.current = pagination.current;
    ipagination.value.pageSize = pagination.pageSize;
    getStatistics5();
  }
  // 获取未完成任务列表
  function getStatistics5() {
    const params = {
      pageNo: ipagination.value.current,
      pageSize: ipagination.value.pageSize,
      ...queryParams.value,
    };
    if(!params.org) params.org = userinfo.value.orgCode;
    statistics5(params).then((res) => {
      noCompleteDataSource.value = res.records;
      ipagination.value.total = res.total;
    });
  }
  function handleExportXls() {
    statistics4ExportXls(queryParams.value).then((res) => {
      let name = setExportName(queryParams.value.org);
      let fileName = name + '巡检完成情况-' + dateFormat(new Date(), 'yyyy-MM-dd');
      let blob = new Blob([res], { type: 'application/vnd.ms-excel;charset=utf-8' });
      // 创建一个a标
      let downloadElement = document.createElement('a');
      // 创建下载的链接
      let href = window.URL.createObjectURL(blob);
      downloadElement.href = href;
      // 下载后文件名
      downloadElement.download = fileName;
      document.body.appendChild(downloadElement);
      // 点击下载
      downloadElement.click();
      // 下载完成移除元素
      document.body.removeChild(downloadElement);
      // 释放掉blob对象
      window.URL.revokeObjectURL(href);
    });
  }

  function onResize() {
    if (executeEl.value) {
      executeEl.value.resize();
    }
    if (abnormalEl.value) {
      abnormalEl.value.resize();
    }
    if (completeEl.value) {
      completeEl.value.resize();
    }
  }
  onMounted(() => {
    getStatistics1(queryParams.value);
    getStatistics2(queryParams.value);
    getStatistics3(queryParams.value);
    getStatistics5();
    window.addEventListener('resize', onResize);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });
</script>

<style lang="less" scoped>
  .chart {
    margin-bottom: 8px;
  }
  .content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;

    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 30%;
      height: 100%;
    }
  }

  .flex {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      font-size: 20px;
    }
  }

  .no-complete-wrapper {
    padding: 12px 10px 6px 10px;
    margin: 10px;
    background-color: #fff;
    border-radius: 2px;
    height: auto;

    .nav-title {
      font-size: 20px;
      margin: 10px 0 15px 0;
    }
  }

  .split-line {
    display: inline-block;
    width: 4px;
    height: 20px;
    background: #3e87f8;
    margin: 1px 8px 0;
    vertical-align: text-top;
  }

  .ant-form-item {
    margin-bottom: 0;
  }

  .card {
    // padding: 10px 20px;
    background: #ffffff;

    .title {
      color: #409ffd;
      line-height: 56px;
      padding: 0px 20px;
      border-bottom: 1px solid #e8e8e8;
      font-weight: 500;
      color: #000000;
      font-size: 16px;
    }
  }
</style>
