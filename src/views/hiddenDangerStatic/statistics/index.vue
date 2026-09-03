<template>
  <div>
    <BasicTable @register="registerTable" :searchInfo="queryParams">
      <template #chartContent>
        <div class="chart">
          <div style="padding-right: 4px">
            <a-row :gutter="8">
              <a-col :lg="6">
                <div class="card">
                  <div class="title">巡检计划</div>
                  <div ref="executeChart" :style="{ height: '268px', width: '100%' }"></div>
                </div>
              </a-col>
              <a-col :lg="18">
                <div class="card">
                  <div class="title">各单位完成情况</div>
                  <div ref="completeChart" :style="{ height: '268px', width: '100%' }"></div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </template>
      <template #tableTitle>
        <div class="flex">
          <div class="left">
            <span class="split-line"></span>
            <span>计划完成情况统计</span>
          </div>
          <div class="right">
            <a-form :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-row :gutter="24">
                <a-col :lg="4">
                  <a-button v-auth="'yh:statistics:export'" type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls"
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
        <span>未完成列表</span>
        <a-button v-auth="'yh:statistics:notice'" style="margin-left: 10px" @click="clockTask" type="primary">一键提醒</a-button>
      </div>
      <a-table :bordered="true" :columns="noCompleteColumns" :dataSource="noCompleteDataSource" :pagination="ipagination" @change="tableChange">
        <template #bodyCell="{ column, text, index, record }">
          <template v-if="column.dataIndex === 'checkCycle'">
            {{ replaceDict(text) }}
          </template>
          <template v-if="column.dataIndex === 'index'">
            {{ (ipagination.current - 1) * ipagination.pageSize + Number(index) + 1 }}
          </template>
          <template v-if="column.dataIndex === 'action'">
            <TableAction :actions="getActions(record)" />
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" name="hiddenDanger-statistics" setup>
// 8 9 11 10
  import {
    statistics1,
    statistics2,
    statistics3,
    statistics4,
    statistics5,
    statistics4ExportXls,
    setEmpty,
    statistics11notice,
  } from '../../app/hiddenDanger-ZG/index.api';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { columns, searchFormSchema, noCompleteColumns } from './statistics.data';
  import { onMounted, onUnmounted, reactive, ref, computed, nextTick } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import * as echarts from 'echarts';
  import { Modal } from 'ant-design-vue';
  import { render } from '/@/utils/common/renderUtils';

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
    startDate: string;
    endDate: string;
    org: string | undefined;
    depart: string | undefined;
  }>({
    startDate: '', // dayjs(new Date()).format('YYYY-MM-DD'),
    endDate: '', // dayjs(new Date()).format('YYYY-MM-DD'),
    org:  '', // userinfo.value.orgCode.slice('0', '6'),
    depart: '',
  });

  // if (userinfo.value.orgCode.length > 6) {
  //   queryParams.value.org = userinfo.value.orgCode.slice('0', '6');
  //   queryParams.value.depart = userinfo.value.orgCode.substr(0, 9);
  // } else {
  //   queryParams.value.org = userinfo.value.orgCode.length < 6 ? null : userinfo.value.orgCode;
  //   queryParams.value.depart = undefined;
  // }

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
    statistics1(params).then((res) => {
      renderExecute(res);
    });
  }
  function renderExecute(data: any) {
    if (executeEl.value) executeEl.value.dispose();
    executeEl.value = echarts.init(executeChart.value);
    const params = { 已完成: data['已完成'], 未完成: data['未完成'], 总任务数: data['总任务数'] };
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
          data: [
            { name: '已完成', value: data['已完成'] },
            { name: '未完成', value: data['未完成'] },
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
    const xAxisData = [];
    const data1: number[] = [];
    const data2: number[] = [];
    const data3: number[] = [];

    data.map((v) => {
      xAxisData.push(v.name);
      data1.push(v['已巡检']);
      data2.push(v['未巡检']);
      data3.push(v['巡检完成率']);
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
          axisPointer: {
            type: 'shadow',
          },
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      grid: {
        top: 50,
        left: 55,
        bottom: '0%',
        right: 55,
        containLabel: true,
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
  const abnormalEl = ref();

  const { tableContext } = useListPage({
    designScope: 'statistics',
    tableProps: {
      api: statistics4,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        autoAdvancedCol: 3,
        resetFunc() {
            ipagination.value.current = 1;
            ipagination.value.pageSize = 10;
        },
      },
      handleSearchInfoFn(info) {
        const { time, org } = info;
        const searchForm = getForm();

        if (time) {
          info.startDate = time.split(',')[0];
          info.endDate = time.split(',')[1];
        } else {
          info.startDate = null;
          info.endDate = null;
        }
        if (org) {
          info.org = org;
          searchForm.setFieldsValue({
            org: org,
          });
        }
        if(!org && orgList.value.length == 1){
          info.org = orgList.value[0].orgCode;
        }
        queryParams.value = Object.assign({}, info);
        getStatistics1(queryParams.value);
        getStatistics2(queryParams.value);
        getStatistics5();
        setExportName(info.org);
        return queryParams.value;
      },
      beforeFetch: (params) => {
        const { time, org } = params;
        if(!org && orgList.value.length == 1){
          params.org = orgList.value[0].orgCode;
          queryParams.value.org = orgList.value[0].orgCode;
        }
        if (time) {
          params.startDate = time.split(',')[0];
          params.endDate = time.split(',')[1];
        } else {
          params.startDate = null;
          params.endDate = null;
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
  const orgList = ref([]);
  // 获取二级机构
  async function getOrgList() {
    getOrgCodeList().then(async (res) => {
      const searchForm = await getForm();
      searchForm.updateSchema({
        field: 'org',
        componentProps: {
          options: res,
          fieldNames: {
            label: 'departName',
            value: 'orgCode',
            options: 'children',
            key: 'id',
          },
          placeholder: '请选择',
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
      orgList.value = res;
      if (res.length == 1) {
        searchForm.setFieldsValue({
          org: res[0].orgCode
        });
        queryParams.value.org = res[0].orgCode;
        getDepart(res[0].orgCode);
      }
      reload();
      pageInit();
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
    getDepartmentList({ orgCode: code }).then(async (res) => {
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

  function getActions(record) {
    if (record.canCheck == 1) {
      return [
        {
          label: '空班',
          onClick: emptyClass.bind(null, record),
        },
      ];
    }
  }

  function emptyClass(record) {
    Modal.confirm({
      title: '提示',
      content: '是否确认空班！',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await setEmpty([{ id: record.id }]);
        getStatistics5();
      },
    });
  }

  function clockTask() {
    statistics11notice(queryParams.value).then((res) => {
      if (res) {
        // message.success('任务已执行');
      }
    });
  }
  function pageInit () {
    getStatistics1(queryParams.value);
    getStatistics2(queryParams.value);
    getStatistics5();
    window.addEventListener('resize', onResize);
  };
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
