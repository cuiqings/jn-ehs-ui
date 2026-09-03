<template>
  <div class="detecriononline-detail">
    <div class="hd">
      <van-form @submit="onSubmit">
        <van-field label-width="0" readonly placeholder="请选择">
          <template #input>
            <a-select placeholder="请选择" @change="pageInit" v-model:value="queryParams.frequency" style="width: 100px">
              <a-select-option v-for="(item, index) in dateTypeOpts" :value="item.value" :key="index">
                {{ item.label }}
              </a-select-option>
            </a-select>
            <a-date-picker
              :inputReadOnly="true"
              :allowClear="false"
              @change="pageInit"
              v-if="queryParams.frequency == 'day'"
              v-model:value="queryParams.dateTime"
              valueFormat="YYYY-MM-DD"
            />
            <a-date-picker
              :inputReadOnly="true"
              :allowClear="false"
              @change="pageInit"
              v-if="queryParams.frequency == 'month'"
              v-model:value="queryParams.dateTime"
              valueFormat="YYYY-MM-DD"
              picker="month"
            />
            <a-date-picker
              :inputReadOnly="true"
              :allowClear="false"
              @change="pageInit"
              v-if="queryParams.frequency == 'year'"
              v-model:value="queryParams.dateTime"
              valueFormat="YYYY-MM-DD"
              picker="year"
            />
          </template>
        </van-field>
        <van-field label-width="0">
          <template #input>
            <div style="display: flex; height: 32px">
              <mySwitch @change="onSubmit" v-model:activeIdx="queryParams.type" :options="options"></mySwitch>
              <!-- <a-select v-if="queryParams.type === '1'" placeholder="请选择" v-model:value="queryParams.meanFrequency" style="width: 100px;margin-left: 15px;" @change="pageInit">
                <a-select-option value="1">1分钟</a-select-option>
                <a-select-option value="10">10分钟</a-select-option>
                <a-select-option value="20">20分钟</a-select-option>
                <a-select-option value="30">30分钟</a-select-option>
                <a-select-option value="40">40分钟</a-select-option>
                <a-select-option value="50">50分钟</a-select-option>
                <a-select-option value="60">60分钟</a-select-option>
              </a-select> -->
              <JDictSelectTag  v-if="queryParams.type === '1'"
                v-model:value="queryParams.meanFrequency"
                :allowClear="true"
                :getPopupContainer="getPopupContainer"
                :showChooseOption="false"
                placeholder="请选择"
                dictCode="warn_together_time"
                style="width: 84px;z-index: 99999;"
                @change="pageInit"
              />
            </div>
          </template>
        </van-field>
      </van-form>
    </div>
    <div class="main">
      <div ref="pointChartRef" class="chart"></div>
      <a-table :pagination="false" :dataSource="dataSource" :columns="columns" />
    </div>
  </div>
  <van-calendar v-model:show="showPicker" @confirm="onConfirm" />
</template>

<script lang="ts" setup name="AppDetecrionOnlineDataDetail">
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import mySwitch from '../components/mySwitch.vue';
  import { pointChart, pointList } from './index.api';
  import * as echarts from 'echarts';
  import { onMounted, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import dayjs from 'dayjs';

  const route = useRoute();
  const options = [
    { label: '实时值', value: '0' },
    { label: '均值', value: '1' },
  ];

  const dateTypeOpts = reactive([
    {
      label: '按日',
      value: 'day',
    },
    {
      label: '按月',
      value: 'month',
    },
    {
      label: '按年',
      value: 'year',
    },
  ]);

  const showPicker = ref<boolean>(false);

  const queryParams = reactive<{
    dateTime: string;
    frequency: string;
    pointId: string;
    meanFrequency: number;
  }>({
    dateTime: dayjs(new Date()).format('YYYY-MM-DD'),
    frequency: 'day',
    pointId: route.query.pointId as string,
    meanFrequency: '1',
  });

  const getPopupContainer = () => document.body;

  const pointChartRef = ref<HTMLElement>();
  let myChart = null;

  const columns = [
    {
      title: '采集时间',
      dataIndex: 'time',
      key: 'time',
      width: '50%',
      align: 'center',
    },
    {
      title: route.query.pointName,
      dataIndex: 'value',
      key: 'value',
      width: '50%',
      align: 'center',
    },
  ];

  const dataSource = ref();

  onMounted(() => {
    pageInit();
  });
  function pageInit() {
    pointChart(queryParams).then((res) => {
      chartChart(res);
    });
    pointList(queryParams).then((res) => {
      dataSource.value = res;
    });
  }

  const onConfirm = (e) => {
    queryParams.dateTime = dayjs(e).format('YYYY-MM-DD');
    showPicker.value = false;
  };

  const clearDate = () => {
    queryParams.dateTime = '';
  };

  const onSubmit = () => {
    console.log('submit', queryParams);
  };

  onMounted(() => {});

  function chartChart(res) {
    let pointName = [];
    let xaxisList = Object.keys(res);
    let valueList = Object.values(res);
    myChart = echarts.init(pointChartRef.value);
    let option = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        },
      },
      title: {
        left: 'center',
        text: route.query.pointName,
        textStyle: {
          fontSize: 14,
        },
      },
      grid: {
        top: 30,
      },
      xAxis: {
        type: 'category',
        boundaryGap: [1, '100%'], // false
        axisTick: {
          //去掉坐标轴刻线
          show: false,
        },
        data: xaxisList,
      },
      yAxis: {
        type: 'value',
        // name: res.result.unit ? '单位（' + res.result.unit + '）' : '',
        boundaryGap: [0, '100%'],
        axisTick: {
          //去掉坐标轴刻线
          show: false,
        },
      },
      legend: {
        show: false,
        data: [],
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'none',
        },
        {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'none',
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'none',
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          filterMode: 'none',
        },
      ],
      series: [
        {
          name: pointName,
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: 'rgb(255, 215, 2)',
          },
          markPoint: {
            label: {
              show: true,
              position: 'top',
              distance: 7,
              offset: [1, 1],
              formatter: '{b}{c}',
            },
            symbol: 'pin',
            symbolSize: 30,
            symbolOffset: [0, '-5%'],
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' },
            ],
          },
          data: valueList,
        },
      ],
    };
    option && myChart.setOption(option, true);
  }
</script>

<style lang="less" scoped>
  .detecriononline-detail {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .hd {
      font-size: 16px;
      box-sizing: border-box;
      border-bottom: 1px solid #eee;
    }
    .main {
      flex: 1;
      overflow: auto;
      padding: 10px;
      .title {
        display: flex;
        justify-content: space-between;
      }
      .chart {
        width: 100%;
        height: 350px;
      }
    }
    .choose-text {
      display: inline-block;
      margin-left: 15px;
      color: #cacaca;
    }
    .istrue {
      color: #333333;
    }
  }
</style>
