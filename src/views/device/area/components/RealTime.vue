<template>
  <div class="real-time">
    <div class="r-left">
      <ul>
        <li v-for="(item, index) in pointsData" :key="index" @click="handlePoints(item)" :class="{ on: curPointId === item.pointId }">
          {{ item.pointName }}
          <span v-if="item.pointValue && item.pointId" class="point-link"> ：{{ item.pointValue ? numFilter(item.pointValue) : '暂无' }} </span>
        </li>
        <li v-if="!pointsData.length">
          <span class="point-link">暂无数据</span>
        </li>
      </ul>
    </div>
    <div class="r-right">
      <div class="table-page-search-wrapper search-top">
        <a-form @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :span="3">
              <a-form-item label="">
                <a-select placeholder="请选择" v-model:value="queryParam.type">
                  <a-select-option v-for="(item, index) in dateTypeOpts" :value="item.value" :key="index">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="">
                <span v-if="queryParam.type === 'day'">
                  <a-date-picker
                    v-if="
                      userInfo.username == 'huanbaojv' &&
                      (props.params.name == '二号线DE线RTO' ||
                        props.params.name == '二号线A线RTO' ||
                        props.params.name == '二号线C线RTO' ||
                        props.params.name == 'RTO' ||
                        props.params.name == 'RTO监测')
                    "
                    :disabled-date="disabledDate"
                    v-model:value="queryParam.time"
                  />
                  <a-date-picker v-else v-model:value="queryParam.time" />
                </span>
                <span v-if="queryParam.type === 'month'">
                  <a-date-picker
                    v-if="
                      userInfo.username == 'huanbaojv' &&
                      (props.params.name == '二号线DE线RTO' ||
                        props.params.name == '二号线A线RTO' ||
                        props.params.name == '二号线C线RTO' ||
                        props.params.name == 'RTO' ||
                        props.params.name == 'RTO监测')
                    "
                    v-model:value="queryParam.time"
                    :disabled-date="disabledDateMonth"
                    picker="month"
                  />
                  <a-date-picker v-else v-model:value="queryParam.time" picker="month" />
                </span>

                <span v-if="queryParam.type === 'year'">
                  <a-date-picker
                    v-if="
                      userInfo.username == 'huanbaojv' &&
                      (props.params.name == '二号线DE线RTO' ||
                        props.params.name == '二号线A线RTO' ||
                        props.params.name == '二号线C线RTO' ||
                        props.params.name == 'RTO' ||
                        props.params.name == 'RTO监测')
                    "
                    v-model:value="queryParam.time"
                    :disabled-date="disabledDateYear"
                    picker="year"
                  />
                  <a-date-picker v-else v-model:value="queryParam.time" picker="year" />
                </span>
              </a-form-item>
            </a-col>
            <a-col :span="7">
              <a-button type="primary" @click="searchQuery" style="margin-right: 8px">查询</a-button>
              <a-button type="primary" @click="handleExportExcel" style="margin-right: 8px">导出</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="title-box">
        <div class="title">{{ curPointName }}</div>
        <div class="val-tab" v-if="isAbs && userInfo.username !== 'huanbaojv'">
          <span class="tab" :class="{ on: active === '0' }" @click="handleValTab('0')">实时值</span>
          <span class="tab" :class="{ on: active === '1' }" @click="handleValTab('1')">均值</span>
          <JDictSelectTag
            v-if="active === '1'"
            v-model:value="absVal"
            :allowClear="false"
            :showChooseOption="false"
            placeholder="请选择"
            dictCode="warn_together_time"
            style="width: 84px"
            @change="handleAbs"
          />
        </div>
      </div>
      <div style="padding-right: 24px">
        <div id="point-chart"></div>
      </div>
      <div style="padding: 24px">
        <a-table v-bind="tableProps" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, markRaw, nextTick } from 'vue';
  // import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil';
  import dayjs, { Dayjs } from 'dayjs';
  import { getCollectData, getChartView, getListView, getExportUrl1 } from '../area.api';
  import { propTypes } from '/@/utils/propTypes';
  import * as echarts from 'echarts';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { columns } from '../area.data';
  import { useRoute } from 'vue-router';
  import { downloadFileAll } from '/@/api/common/api';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  // 组件接收参数
  const props = defineProps({
    params: propTypes.object.def({}),
  });
  console.log('props.params', props.params);
  const tableProps = reactive({
    size: 'middle',
    rowKey: 'time',
    bordered: true,
    // pagination: { pageSize:10,current:1 },
    canResize: false,
    columns: columns,
    dataSource: [],
    style: { borderTop: '1px solid #e8e8e8' },
  });
  const queryParam = reactive({
    type: 'day',
    time: dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD'),
  });
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
  const isAbs = ref(true);
  const absVal = ref('1');
  const active = ref('0');
  const myChart = ref();
  const pointsData = ref([]);
  const curPointId = ref('');
  const curPointName = ref('');
  function numFilter(value) {
    let realVal = value.split(' '); // 单位：数据字典替换
    if (value && realVal.length > 1) {
      return realVal[0] + ' ' + filterDictTextByCache('point_unit', realVal[1]);
    } else {
      return getNumTwo(realVal[0]);
    }
  }
  const disabledDate = (current: Dayjs) => {
    // 不能选择5月9号之前的日期
    return current < dayjs('2024-05-09');
  };
  const disabledDateMonth = (current: Dayjs) => {
    // 不能选择5月份之前的数据
    return current < dayjs('2024-05-01');
  };
  const disabledDateYear = (current: Dayjs) => {
    // 不能选择2024年之前的数据
    return current < dayjs('2024-01-01');
  };
  // 保留小数
  function getNumTwo(num_0, n = 2) {
    let num = Number(num_0);
    var f = parseFloat(num);
    if (isNaN(f)) {
      return num_0;
    }
    f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n); // n 幂
    var s = f.toString();
    return s;
  }
  handleCollectData();
  function handleCollectData() {
    const { params } = props;
    console.log('goEdit params', params);
    getCollectData({
      deviceId: params.deviceId,
      // type: params.code,
    }).then((res) => {
      console.log('getCollectData', res);
      const { realTimeDataPoints, warnStatusPoints, workStatusPoints } = res;
      pointsData.value = [...realTimeDataPoints, ...warnStatusPoints, ...workStatusPoints];
      console.log('pointsData', pointsData.value);
      if (pointsData.value.length > 0) {
        curPointId.value = pointsData.value[0].pointId;
        curPointName.value = pointsData.value[0].pointName;
        tableProps.columns[1].title = pointsData.value[0].pointName;
        getChartData();
        // getListData();
      }
    });
  }
  // 折线图
  function getChartData() {
    let dateTime = dayjs(new Date()).format('YYYY-MM-DD');
    if (queryParam.type === 'year') {
      dateTime = dayjs(queryParam.time).format('YYYY') + '-01-01';
    } else {
      dateTime = dayjs(queryParam.time).format('YYYY-MM-DD');
    }
    let params = {
      pointId: curPointId.value,
      dateTime,
      frequency: queryParam.type,
      meanFrequency: queryParam.type === 'day' && active.value === '1' ? Number(absVal.value) : null,
    };
    if (userInfo.value.username === 'huanbaojv') {
      params.meanFrequency = 5;
    }
    getChartView(params).then((res) => {
      console.log('getChartView', res);

      renderCharts(res || {});
      if (res) {
        // 遍历组装表格数据
        let tableData = [];
        for (let key in res) {
          tableData.push({
            time: key,
            value: res[key],
          });
        }
        // 对数组tableData进行倒序
        tableData.reverse();
        tableProps.dataSource = tableData;
      } else {
        tableProps.dataSource = [];
      }
    });
  }
  // 列表
  function getListData() {
    let dateTime = dayjs(new Date()).format('YYYY-MM-DD');
    if (queryParam.type === 'year') {
      dateTime = dayjs(queryParam.time).format('YYYY') + '-01-01';
    } else {
      dateTime = dayjs(queryParam.time).format('YYYY-MM-DD');
    }
    let params = {
      pointId: curPointId.value,
      dateTime,
      frequency: queryParam.type,
    };
    getListView(params).then((res) => {
      console.log('getListView', res);
      tableProps.dataSource = res || [];
    });
  }
  function onResize() {
    if (myChart.value) {
      myChart.value.resize();
    }
  }
  function searchQuery() {
    if (queryParam.type === 'day') {
      isAbs.value = true;
    } else {
      isAbs.value = false;
    }
    if (pointsData.value.length > 0) {
      getChartData();
      // getListData();
    }
  }
  // ======导出xlsx 格式=======
  function handleExportExcel() {
    const fileName = curPointName.value + dayjs(new Date()).format('YYYY年MM月DD日') + '.xls';
    let dateTime = dayjs(new Date()).format('YYYY-MM-DD');
    if (queryParam.type === 'year') {
      dateTime = dayjs(queryParam.time).format('YYYY') + '-01-01';
    } else {
      dateTime = dayjs(queryParam.time).format('YYYY-MM-DD');
    }
    let params = {
      pointId: curPointId.value,
      dateTime,
      frequency: queryParam.type,
    };
    downloadFileAll('/space/energyDeviceListPointDataView/list/export', fileName, params);

    // getExportUrl(params).then((res) => {
    // });
    // downFile('/space/energyDeviceListPointDataView/list/export', params).then((data) => {
    //   if (typeof window.navigator.msSaveBlob !== 'undefined') {
    //     window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName + '.xls');
    //   } else {
    //     let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }));
    //     let link = document.createElement('a');
    //     link.style.display = 'none';
    //     link.href = url;
    //     link.setAttribute('download', fileName + '.xlsx');
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link); // 下载完成移除元素
    //     window.URL.revokeObjectURL(url); // 释放掉blob对象
    //   }
    // });
  }
  function reset() {
    queryParam.type = 'day';
    queryParam.time = dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD');
    active.value = '0';
    absVal.value = '1';
    if (pointsData.value.length > 0) {
      getChartData();
      // getListData();
    }
  }
  function handlePoints(item) {
    curPointId.value = item.pointId;
    curPointName.value = item.pointName;
    columns[1].title = item.pointName;
    reset();
  }
  function handleValTab(val) {
    active.value = val;
    if (pointsData.value.length > 0) {
      getChartData();
    }
  }
  function handleAbs(val) {
    absVal.value = val;
    if (pointsData.value.length > 0) {
      getChartData();
    }
  }
  function renderCharts(val) {
    let xaxisList = Object.keys(val);
    let valueList = Object.values(val);
    myChart.value = markRaw(echarts.init(document.getElementById('point-chart')));
    let option = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        },
      },
      title: {
        left: 'center',
        text: '',
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      grid: {
        top: 40,
        right: 60,
        bottom: 80,
        left: 100,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        // axisTick: {
        //   //去掉坐标轴刻线
        //   show: false,
        // },
        data: xaxisList,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        // axisTick: {
        //   //去掉坐标轴刻线
        //   show: false,
        // },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
        },
      ],
      legend: {
        show: false,
      },
      series: [
        {
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          name: curPointName.value,
          itemStyle: {
            color: 'rgb(255, 215, 2)',
          },
          data: valueList,
        },
      ],
    };
    option && myChart.value.setOption(option, true);
    nextTick(() => {
      window.addEventListener('resize', () => {
        myChart.value?.resize();
      });
    });
    setTimeout(() => {
      myChart.value.resize();
    });
  }
</script>
<style scoped lang="less">
  // @import '~@assets/less/common.less';
  .real-time {
    display: flex;
    .r-left {
      width: 336px;
      padding: 24px;
      border-right: 1px solid #e8e8e8;
      height: 100vh;
      overflow-y: scroll;
      > ul {
        li {
          padding: 10px 16px;
          background: #f7f9fc;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 10px;
          cursor: pointer;
          .point-link {
            color: rgba(0, 0, 0, 0.65);
          }
          &.on {
            background: rgba(52, 126, 242, 0.05);
            border: 1px solid #347ef2;
          }
        }
      }
    }
    .r-right {
      flex: 1;
      .search-top {
        border-bottom: 1px solid #e8e8e8;
        padding: 24px 24px 0px;
      }
      .title-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 24px 0px;
        .title {
          font-size: 16px;
          color: rgba(0, 0, 0, 0.87);
          line-height: 32px;
          flex: 1;
          background-color: #fff;
          text-align: left;
        }
        .tab {
          width: 56px;
          text-align: center;
          display: inline-block;
          height: 32px;
          line-height: 32px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          color: rgba(0, 0, 0, 0.38);
          font-size: 12px;
          margin-right: 5px;
          cursor: pointer;
          &.on {
            background: #3e87f8;
            color: #fff;
          }
        }
      }
    }
    #point-chart {
      width: 100%;
      height: 500px;
    }
    :deep(.ant-table-wrapper) {
      border-top: none !important;
    }
  }
</style>
