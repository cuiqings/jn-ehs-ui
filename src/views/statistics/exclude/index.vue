<template>
  <div>
    <BasicTable @register="registerTable">
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
            <span>计划完成情况统计</span>
          </div>
        </div>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" name="statistics-exclude" setup>
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { statistics8, statistics9, statistics10 } from './api';
  import { columns, searchFormSchema } from './statisticsdata';
  import { onMounted, onUnmounted, ref } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import * as echarts from 'echarts';
  // 巡检计划统计
  const executeChart = ref();
  const executeEl = ref();

  // 巡检计划统计请求
  function getStatistics1(val: any) {
    const params = {
      ...val,
    };
    statistics8(params).then((res) => {
      renderExecute(res);
    });
  }
  function renderExecute(data: any) {
    if (executeEl.value) executeEl.value.dispose();
    executeEl.value = echarts.init(executeChart.value);
    const params = { 已检查: data['已完成'], 未检查: data['未完成'], 总任务数: data['总任务数'] };
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
            { name: '已检查', value: params['已检查'] },
            { name: '未检查', value: params['未检查'] },
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
    statistics9(params).then((res) => {
      renderComplete(res);
    });
  }
   function computedMax(...data) {
    let isolationMax = data.flat(Infinity).length > 0 ? Math.max(...data.flat(Infinity)) : 10;
    if (isolationMax === 0) isolationMax = 10;
    isolationMax = Math.ceil(isolationMax / 10) * 10;
    isolationMax = isolationMax + isolationMax / 5;
    return (isolationMax / 5) * 10;
  }
  function renderComplete(data: any) {
    let xAxisData: any = [];
    let data1: number[] = [];
    let data2: number[] = [];
    let data3: number[] = [];
    data.forEach((v) => {
      xAxisData.push(v.name);
      data1.push(v['已巡检']);
      data2.push(v['未巡检']);
      data3.push(v['巡检完成率']);
    });
    let lMax = computedMax(data1, data2);
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
        data: ['已检查', '未检查', '巡检完成率'],
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisTick: {
            alignWithLabel: true,
          },
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
      ],
      grid: {
        top: 45,
        left: 55,
        bottom: 63,
        right: 55,
      },
      yAxis: [
        {
          type: 'value',
          alignTicks: true,
          max: lMax,
          interval: lMax / 10,
          splitNumber: 10,
          axisLabel: {
            show: false,
          },
        },
        {
          type: 'value',
          min: -100,
          max: 100,
          interval: 20,
          axisLabel: {
            show: false,
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '已检查',
          type: 'bar',
          barWidth: '30',
          data: data1,
          label: {
            show: true,
            position: 'top',
          },
        },
        {
          name: '未检查',
          barWidth: '30',
          type: 'bar',
          data: data2,
          label: {
            show: true,
            position: 'top',
          },
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
      api: statistics10,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        autoAdvancedCol: 3,
        resetFunc() {
          if (orgTree.value.length !== 1) {
            getForm().updateSchema({
              field: 'depart',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
          }
        },
      },
      beforeFetch: (params) => {
        if (orgTree.value.length === 1) {
          params.org = orgTree.value[0].value;
          getForm().setFieldsValue({
            org: orgTree.value[0].value,
          });
        }
        const { time } = params;
        if (time) {
          params.startDate = time.split(',')[0];
          params.endDate = time.split(',')[1];
        }
        const obj = {
          org: params.org,
          depart: params.depart,
          startDate: time ? params.startDate : undefined,
          endDate: time ? params.endDate : undefined,
        };
        getStatistics1(obj);
        getStatistics2(obj);
        delete params.time;
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
    await getDepart3ListWithSecurity().then(async (res) => {
      const orgOptions = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      orgTree.value = orgOptions;
      const searchForm = getForm();
      searchForm.updateSchema({
        field: 'org',
        componentProps: {
          options: orgOptions,
          placeholder: '请选择',
          disabled: orgOptions.length === 1,
          showSearch: true,
          allowClear: true,
          filterOption: (input: string, option: any) => option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0,
          onChange: (value: any) => {
            searchForm.setFieldsValue({
              depart: undefined,
            });
            searchForm.updateSchema({
              field: 'depart',
              componentProps: {
                options: [],
                placeholder: '请选择',
                showSearch: true,
                allowClear: true,
                filterOption: (input: string, option: any) => option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0,
              },
            });
            getDepart(value);
          },
        },
      });
      searchForm.setFieldsValue({
        org: orgOptions.length === 1 ? orgOptions[0].value : undefined,
      });
      if (orgOptions.length === 1) {
        getDepart(orgOptions[0].value);
      }
    });
  }
  // 获取三级机构
  function getDepart(orgCode) {
    selectDeptNew({ orgCode }).then((res) => {
      const departOptions = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'depart',
        componentProps: {
          options: departOptions,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
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
  onMounted(async () => {
    await getOrgList();
    reload();
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
