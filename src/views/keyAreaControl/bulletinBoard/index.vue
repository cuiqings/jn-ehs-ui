<template>
  <div>
    <a-card :bordered="false">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol" @keyup.enter="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <a-select
                :allowClear="true"
                placeholder="请选择"
                v-model:value="queryParam.subsidiaryCode"
                :options="orgOptions"
                :disabled="orgOptions.length === 1"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="统计时间">
              <a-range-picker
                :allowClear="false"
                format="YYYY-MM-DD"
                v-model:value="dateRange"
                :disabled-date="disabledDate"
                @change="onChangeTime"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <div class="btn-list">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button @click="searchReset" style="margin-left: 8px">重置</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-row :gutter="[16, 16]" style="margin: 10px">
      <a-col :span="8">
        <a-card style="height: 100%" :bodyStyle="{ padding: '10px' }" :bordered="false" title="动火作业">
          <template #extra>
            <a-tabs v-model:activeKey="activeKey" :tabBarStyle="{}" @change="tabChange">
              <a-tab-pane key="3" tab="进行中" />
              <a-tab-pane key="1" tab="审批中" />
              <a-tab-pane key="5" tab="已完成" />
            </a-tabs>
          </template>
          <div style="height: 288px; overflow-y: auto; position: relative">
            <LoadingOutlined class="loading" v-if="loading" />
            <div v-if="list.length == 0 && !loading" class="nodata">暂无数据</div>
            <template v-for="(item, index) in list" :key="index">
              <div class="flex" v-if="activeKey != 5" :style="{ marginBottom: index == list.length - 1 ? '0' : '15px' }">
                <div class="image">
                  <img src="../../../assets/images/fireFighting/hot.png" width="48" height="64" />
                </div>
                <div class="flexright">
                  <div class="left">
                    <div style="font-weight: 600; white-space: nowrap">{{ item.workTypeName }}-{{ item.workGrade }}</div>
                    <div v-if="activeKey == 3">{{ setEndTime(item.workEndTime) }}</div>
                    <div v-if="activeKey == 1" style="font-size: 13px">
                      申请作业时间：{{ item.applicationTimeStr && item.applicationTimeStr.substring(5, 16) }}至{{
                        item.workEndTime && item.workEndTime.substring(5, 16)
                      }}
                    </div>
                  </div>
                  <div class="right">
                    <div>作业单位：{{ item.applicationUnitName }}</div>
                    <div v-if="activeKey == 1" class="red">待审批</div>
                    <div v-if="activeKey == 3 && !item.timeoutMark && showWithTime(item)" class="red">剩余{{ item.timeRemaining }}</div>
                    <div v-if="activeKey == 3 && item.timeoutMark" class="red">{{ item.timeoutMark }}</div>
                  </div>
                </div>
              </div>
              <div class="flex" :style="{ marginBottom: index == list.length - 1 ? '0' : '15px' }" v-else>
                <div class="left">
                  <div class="image">
                    <img src="../../../assets/images/fireFighting/hot.png" width="48" height="64" />
                  </div>
                  <div class="content">
                    <div class="blue">{{ item.workApplyCode }}</div>
                    <div style="font-weight: 600">{{ item.workTypeName }}-{{ item.workGrade }}</div>
                  </div>
                </div>
                <div class="right">
                  <div>{{ item.applicationUnitName }}</div>
                </div>
              </div>
            </template>
          </div>
        </a-card>
      </a-col>
      <a-col :span="10">
        <a-card style="height: 100%" :bodyStyle="{ padding: '0px' }" :bordered="false" title="消防安全培训">
          <a-row>
            <a-col :span="12">
              <div ref="trainLeftChart" :style="{ height: '288px', width: '100%' }"></div>
            </a-col>
            <a-col :span="12">
              <div ref="trainRightChart" :style="{ height: '288px', width: '100%' }"></div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card style="height: 100%" :bodyStyle="{ padding: '0px' }" :bordered="false" title="消防应急演练">
          <div ref="drillChart" :style="{ height: '288px', width: '100%' }"></div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card :bordered="false" title="消防隐患统计">
          <div ref="statisticsChart" :style="{ height: '288px', width: '100%' }"></div>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card :bordered="false" title="消防巡检完成情况">
          <!-- <a-empty class="chart" v-if="isInspectChart" /> -->
          <div class="chart" ref="inspectChart"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { getDrillLine, getTrainLine, getTypeDetail, getFireSignage, getStatistics7 } from './bulletinBoard.api';
  import { nextTick, onMounted, onUnmounted, reactive, ref, computed } from 'vue';
  import { getOrganizationNew } from '/@/views/keyAreaControl/monitor/monitor.api';
  import { statistics2 } from '/@/views/app/hiddenDanger/index.api';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { setSizeWithRem } from '/@/utils/index'
  import dayjs, { Dayjs } from 'dayjs';
  import * as echarts from 'echarts';

  const queryParam = reactive({
    subsidiaryCode: undefined,
    startTime: '',
    endTime: '',
  });
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 5 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 19 },
  });
  const activeKey: any = ref('3');
  const dateRange: any = ref([]);
  const orgOptions: any = ref([]);
  const list: any = ref([]);
  const loading = ref(false);
  const userStore: any = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);

  if (userinfo.value.orgCode.length > 6) {
    queryParam.subsidiaryCode = userinfo.value.orgCode.slice('0', '6');
  } else {
    queryParam.subsidiaryCode = userinfo.value.orgCode && userinfo.value.orgCode.length > 3 ? userinfo.value.orgCode : null;
  }

  async function getOrgList() {
    getOrganizationNew().then(async (res) => {
      orgOptions.value = res.map((item: any) => {
        originData.value.push({name: item.departName, value: 0, orgCode: item.orgCode});
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      if (orgOptions.value.length === 1) {
        queryParam.subsidiaryCode = orgOptions.value[0].value;
      }
      searchQuery();
    });
  }

  const disabledDate = (current: Dayjs) => {
    if (queryParam.startTime) {
      return !(dayjs(queryParam.startTime).subtract(6, 'month') < current && current < dayjs(queryParam.startTime).add(1, 'year'));
    } else {
      return null;
    }
  };

  function onChangeTime(date, dateString) {
    queryParam['startTime'] = dateString[0];
    queryParam['endTime'] = dateString[1];
  }

  function searchQuery() {
    getworkFire();
    renderTrain();
    renderDrill();
    // renderInspect();
    getStatistics2();
    getStatistics();
  }

  nextTick(() => {
    searchReset();
  });
  function searchReset() {
    if (userinfo.value.orgCode.length > 6) {
      queryParam.subsidiaryCode = userinfo.value.orgCode.slice('0', '6');
    } else {
      queryParam.subsidiaryCode = userinfo.value.orgCode && userinfo.value.orgCode.length > 3 ? userinfo.value.orgCode : null;
    }
    initDate();
    searchQuery();
  }

  const drillChart = ref();
  const drillEl = ref();
  const trainLeftChart = ref();
  const trainLeftEl = ref();
  const trainRightChart = ref();
  const trainRightEl = ref();
  const statisticsChart = ref();
  const statisticsEl = ref();
  const inspectChart = ref();
  const inspectEl = ref();
  const isInspectChart = ref(false);

  const originData = ref<{ name: string; value: number; orgCode: string}[]>([])

  function renderTrain() {
    renderTrainLeft();
    renderTrainRight();
  }

  function renderTrainLeft() {
    getTrainLine(queryParam).then((res) => {
      trainLeftEl.value = echarts.init(trainLeftChart.value);
      if(res.detail.length === 0){
        res.detail = originData.value.filter(val => val.orgCode === queryParam.subsidiaryCode);
      }
      const option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          bottom: '0',
          left: 'center',
          itemWidth: 10,
          icon: 'circle',
        },
        color: ['#3E87F8', '#51D8DE', '#09C199', '#F7BF53', '#FF8D04', '#FC6161'],
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['20%', '40%'],
            label: {
              fontSize: setSizeWithRem(14),
              formatter: function (data) {
                return `${data.name}\n${data.value}`;
              },
            },
            data: res.detail,
            labelLine: {
              length: setSizeWithRem(20),
              length2: setSizeWithRem(10),
            },
          },
        ],
      };
      trainLeftEl.value.setOption(option);
    });
  }

  function renderTrainRight() {
    getTypeDetail(queryParam).then((res) => {
      let result = res.detail.filter((val) => val.value > 0);
      trainRightEl.value = echarts.init(trainRightChart.value);
      if (result.length === 0) {
        result = [
          {
            name: '年度培训',
            value: 0,
          },
          {
            name: '专项培训',
            value: 0,
          },
          {
            name: '其它',
            value: 0,
          },
        ];
      }
      const option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          bottom: '0',
          left: 'center',
          itemWidth: 10,
          icon: 'circle',
        },
        color: ['#FF8D04', '#FC6161', '#09C199'],
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['20%', '40%'],
            // stillShowZeroSum: false,
            label: {
              fontSize: setSizeWithRem(14),
              formatter: function (data) {
                return `${data.name}\n${data.value}`;
              },
            },
            data: result,
            labelLine: {
              length: setSizeWithRem(20),
              length2: setSizeWithRem(10),
            },
          },
        ],
      };
      trainRightEl.value.setOption(option);
    });
  }

  function renderDrill() {
    getDrillLine(queryParam).then((res) => {
      drillEl.value = echarts.init(drillChart.value);
      if(res.detail.length === 0) {
        res.detail = originData.value.filter(val => val.orgCode === queryParam.subsidiaryCode);
      }
      const option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          bottom: '0',
          left: 'center',
          itemWidth: 10,
          icon: 'circle',
        },
        color: ['#3E87F8', '#51D8DE', '#09C199', '#F7BF53', '#FF8D04', '#FC6161'],
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['20%', '40%'],
            label: {
              fontSize: setSizeWithRem(14),
              formatter: function (data) {
                return `${data.name}\n${data.value}`;
              },
            },
            data: res.detail,
            labelLine: {
              length: setSizeWithRem(20),
              length2: setSizeWithRem(10),
            },
          },
        ],
      };
      drillEl.value.setOption(option);
    });
  }

  function renderStatistics(data) {
    statisticsEl.value = echarts.init(statisticsChart.value);
    let pieData = [
      { value: data.wks, name: '未开始' },
      { value: data.zgz, name: '整改中' },
      { value: data.dys, name: '待验收' },
      { value: data.ysz, name: '验收中' },
      { value: data.ystg, name: '验收通过' },
    ];
    pieData = pieData.filter((val) => val.value > 0);
    if (pieData.length === 0) {
      pieData = [
        { value: 0, name: '未开始' },
        { value: 0, name: '整改中' },
        { value: 0, name: '待验收' },
        { value: 0, name: '验收中' },
        { value: 0, name: '验收通过' },
      ];
    }
    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: '0',
        left: 'center',
        itemWidth: 10,
        icon: 'circle',
      },
      color: ['#FFD902', '#FF8D04', '#F43328', '#1F7CF8', '#3F9CF1'],
      series: [
        {
          name: '消防防患统计',
          type: 'pie',
          // avoidLabelOverlap: false,
          radius: ['30%', '50%'],
          label: {
            formatter: function (data) {
              return `${data.name}\n${data.value}`;
            },
          },
          data: pieData,
        },
      ],
    };
    statisticsEl.value.setOption(option);
  }

  let completeEl;
  function getStatistics2() {
    statistics2({
      ...queryParam,
      org: queryParam.subsidiaryCode,
      beginTime: queryParam.startTime ? queryParam.startTime + ' 00:00:00' : '',
      endTime: queryParam.endTime ? queryParam.endTime + ' 23:59:59' : '',
    }).then((res) => {
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
    completeEl = echarts.init(inspectChart.value);
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
        bottom: '0%',
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
        top: 20,
        left: 45,
        bottom: 42,
        right: 45,
      },
      yAxis: [
        {
          type: 'value',
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

  function initDate() {
    const today = dayjs(new Date()).format('YYYY-MM-DD');
    const todayTimes = new Date().getTime();
    const lastMonth = dayjs(new Date(todayTimes - 30 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD');
    dateRange.value = [dayjs(lastMonth, 'YYYY-MM-DD'), dayjs(today, 'YYYY-MM-DD')];
    queryParam['startTime'] = lastMonth;
    queryParam['endTime'] = today;
  }

  function onResize() {
    if (drillEl.value) {
      drillEl.value.resize();
    }
    if (trainLeftEl.value) {
      trainLeftEl.value.resize();
    }
    if (trainRightEl.value) {
      trainRightEl.value.resize();
    }
    if (statisticsEl.value) {
      statisticsEl.value.resize();
    }
    if (inspectEl.value) {
      inspectEl.value.resize();
    }
  }

  function getStatistics() {
    getStatistics7({
      ...queryParam,
      org: queryParam.subsidiaryCode,
      startDate: queryParam.startTime ? queryParam.startTime + ' 00:00:00' : '',
      endDate: queryParam.endTime ? queryParam.endTime + ' 23:59:59' : '',
    }).then((res) => {
      renderStatistics(res);
    });
  }

  // 动火作业
  const tabChange = (e) => {
    list.value = [];
    getworkFire();
  };
  function getworkFire() {
    loading.value = true;
    getFireSignage({
      ...queryParam,
      workType: 4,
      state: activeKey.value,
      pageSize: 1000,
      pageNo: 1,
      applicationUnit: queryParam.subsidiaryCode,
      startTime: queryParam.startTime ? queryParam.startTime + ' 00:00:00' : '',
      endTime: queryParam.endTime ? queryParam.endTime + ' 23:59:59' : '',
    }).then((res) => {
      list.value = res.records;
      loading.value = false;
    });
  }
  function setEndTime(str) {
    if (!str) return '';
    let times = str.split(' ');
    let date = times[0];
    let time = times[1];
    return date.substring(5) + ' ' + time.substr(0, 5) + ' 结束';
  }

  onMounted(() => {
    initDate();
    getOrgList();
    getworkFire();
    getStatistics();
    window.addEventListener('resize', onResize);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });

  const showWithTime = (item) => {
    return (item.workState == 4 && new Date(item.workEndTime).getTime() > new Date().getTime()) || item.workState == 3;
  };
</script>
<style scoped lang="less">
  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(90deg, #f5f8fb 0%, #fcfdfe 100%);
    border-radius: 2px;
    margin-bottom: 16px;
    padding: 10px 12px;
    .image {
      margin-right: 12px;
    }
    .flexright {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .left {
      display: flex;
      align-items: center;
      justify-content: space-between;
      :first-child {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.85);
      }

      :last-child {
        color: rgba(0, 0, 0, 0.87);
      }
      .blue {
        color: #1890ff;
      }
    }

    .right {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: rgba(0, 0, 0, 0.87);
      text-align: right;
    }

    .red {
      color: red;
    }
  }

  :deep(.ant-tabs-top > .ant-tabs-nav::before) {
    border-bottom: none;
  }

  :deep(.ant-tabs-ink-bar) {
    background-color: white;
    display: none;
  }

  :deep(.ant-card-extra) {
    padding: 0;
  }

  .chart {
    height: 288px;
    width: 100%;
  }
  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 32px;
    opacity: 0.6;
    transform: translate3d(-50%, -50%, 0);
  }
  .nodata{
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 18px;
    opacity: 0.6;
    transform: translate3d(-50%, -70%, 0);
  }
</style>
