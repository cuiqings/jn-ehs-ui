<template>
  <div class="control-screen">
    <Header @orgChange="orgChange" @timeChange="timeChange" @init="init" />
    <!-- 中间部分 配置页面 -->
    <div class="screen-topo">
      <TechnicalTopo :orgCode="active" />
      <div class="tab" :class="'tab' + active" v-if="unitOpts.length !== 1">
        <span style="width: 123px" @click="topoTab('A04A01')"></span>
        <span style="width: 103px" @click="topoTab('A04A02')"></span>
        <span style="width: 123px" @click="topoTab('A04A06')"></span>
      </div>
    </div>
    <!-- 底部 -->
    <div class="bot-box">
      <div class="left">
        <alarm ref="alarmRef" />
        <!-- <div class="title">报警记录</div>
        <a-spin :spinning="warnLoading">
          <div class="alarm-box">
            <div class="alarm-list" v-for="(item, index) in warnData" :key="index" @click="handleView(item)">
              <img src="../../../assets/images/controlScreen/alarmsg1.png" class="alarm-sign" />
              <div>
                <div class="level-alarm-name">
                  <div :title="item.warnConfigName">{{ item.warnConfigName }}</div>
                  <a-tag v-if="item.warnState == 1" color="green">销警</a-tag>
                  <a-tag v-else color="red">报警</a-tag>
                </div>
                <div class="level-alarm-time"
                  ><span style="width: 150px">{{ item.warnDate }}</span
                  ><span :title="item.sysDepartName">{{ item.sysDepartName }}</span></div
                >
              </div>
            </div>
            <div class="no-data" v-if="!warnData.length">
              <a-empty />
            </div>
          </div>
        </a-spin> -->
      </div>
      <div class="center">
        <div class="title" style="margin-bottom: 10px">
          报警次数统计
          <div class="ct-form">
            <a-select
              class="custom-select"
              v-if="unitOpts.length !== 1"
              v-model:value="countParam.unit"
              size="small"
              placeholder="查询单位"
              style="width: 100px"
              @change="unitChange"
            >
              <a-select-option v-for="(item, index) in unitOpts" :value="item.orgCode" :key="index">
                {{ item.departName }}
              </a-select-option>
            </a-select>
            <a-select
              class="custom-select"
              v-model:value="countParam.type"
              size="small"
              placeholder="请选择"
              style="width: 100px"
              @change="handleTimeType"
            >
              <a-select-option v-for="(item, index) in dateTypeOpts" :value="item.value" :key="index">
                {{ item.label }}
              </a-select-option>
            </a-select>
            <a-date-picker
              v-if="countParam.type === 'day'"
              v-model:value="countParam.time"
              size="small"
              style="width: 120px"
              :allowClear="false"
              @change="countDateChange"
            />
            <a-date-picker
              v-if="countParam.type === 'month'"
              v-model:value="countParam.time"
              picker="month"
              size="small"
              style="width: 100px"
              :allowClear="false"
              @change="countDateChange"
            />

            <a-date-picker
              v-if="countParam.type === 'year'"
              v-model:value="countParam.time"
              picker="year"
              size="small"
              style="width: 80px"
              @change="countDateChange"
            />
          </div>
        </div>
        <div id="countChart" style="height: 220px"></div>
      </div>
      <div class="right">
        <div class="title">
          报警等级统计
          <div class="ct-form">
            <a-range-picker
              v-model:value="levelParam.time"
              format="YYYY-MM-DD"
              :placeholder="['开始时间', '结束时间']"
              :allowClear="false"
              @change="onChange"
              style="width: 236px"
            />
          </div>
        </div>
        <div class="chart-box">
          <div id="levelChart" style="height: 230px"></div>
        </div>
      </div>
    </div>
    <div class="home-bottom"></div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, nextTick, reactive } from 'vue';
  import Header from './components/Header.vue';
  import TechnicalTopo from './components/TechnicalTopo.vue';
  import { getCountStats, getWarnLevelStats } from './page.api';
  import dayjs, { Dayjs } from 'dayjs';
  import * as echarts from 'echarts';
  // 导入获取机构接口
  import { getOrgCodeList } from '/@/api/common/api';
  import Alarm from './components/Alarm.vue';
  const queryParams: any = ref({});
  const alarmRef = ref();
  const active = ref('A04A01');
  const warnData = ref([]);
  const unitOpts = ref([]);
  const countParam = reactive({
    unit: undefined,
    type: 'day',
    time: ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD')),
  });
  const dateTypeOpts = [
    {
      label: '按日查看',
      value: 'day',
    },
    {
      label: '按月查看',
      value: 'month',
    },
    {
      label: '按年查看',
      value: 'year',
    },
  ];
  const levelParam = reactive({
    time: ref<[Dayjs, Dayjs]>([
      dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD'),
      dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD'),
    ]),
    startTime: dayjs(new Date()).format('YYYY-MM-DD'),
    endTime: dayjs(new Date()).format('YYYY-MM-DD'),
  });
  getOrganization();
  // 获取部门list
  function getOrganization() {
    getOrgCodeList().then((res) => {
      unitOpts.value = res || [];
      if (res.length === 1) {
        active.value = res[0].orgCode;
        countParam.unit = res[0].orgCode;
      }
      getCountData();
      getLevelData();
      alarmRef.value.getAlarm(active.value);
      // getWarnData();
    });
  }
  function onChange(value, dateString) {
    levelParam.startTime = dateString[0];
    levelParam.endTime = dateString[1];
    getLevelData();
  }
  // 报警等级图表
  function getLevelData() {
    const params = {
      orgCode: active.value,
      startTime: levelParam.startTime,
      endTime: levelParam.endTime,
    };
    getWarnLevelStats(params).then((res) => {
      const data = res;
      renderLevelCharts(data);
    });
  }
  function orgChange(val: any) {
    queryParams.value = val;
    nextTick(() => {});
  }
  function timeChange(val: any) {
    queryParams.value = val;
    // nextTick(() => noticeRef.value.getNoticeList(val));
  }
  function init(val: any) {
    queryParams.value = val;
    nextTick(() => {
      // noticeRef.value.getNoticeList(val)
    });
  }
  // 产线切换
  function topoTab(val: string) {
    if (unitOpts.value.length === 1) {
      return;
    }
    active.value = val;
    getCountData();
    getLevelData();
    alarmRef.value.getAlarm(active.value);
  }
  function unitChange() {
    getCountData();
  }
  function handleTimeType() {
    getCountData();
  }
  function countDateChange(value, dateString) {
    getCountData();
  }
  // 报警次数图表
  function getCountData() {
    let dateTime = '';
    if (countParam.type === 'day') {
      dateTime = dayjs(countParam.time).format('YYYY-MM-DD');
    }
    if (countParam.type === 'month') {
      dateTime = dayjs(countParam.time).format('YYYY-MM-DD');
    }
    if (countParam.type === 'year') {
      dateTime = dayjs(countParam.time).format('YYYY-MM-DD');
    }
    const params = {
      orgCode: countParam.unit,
      dateTime: dateTime,
      frequency: countParam.type,
    };
    getCountStats(params).then((res) => {
      const countData = res;
      renderCountCharts(countData);
    });
  }

  function renderCountCharts(val) {
    if (!val) {
      return;
    }
    const legendData = val.legend;
    const xAxisData = val.xaxisList;
    const seriesData = legendData.map((v) => {
      const sdata = Object.values(val.data[v]);
      return {
        name: v,
        type: 'line',
        symbol: 'none',
        data: sdata,
      };
    });
    let myChart = echarts.init(document.getElementById('countChart'), 'dark');
    let option = {
      tooltip: {
        trigger: 'axis',
      },
      title: {
        text: '',
      },
      grid: {
        top: 40,
        right: 10,
        bottom: 20,
        left: 60,
      },
      xAxis: {
        type: 'category',
        boundaryGap: [1, '10%'], // false
        axisTick: {
          //去掉坐标轴刻线
          show: false,
        },
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '10%'],
        splitNumber: 3,
        name: '单位：次',
        nameGap: 16,
        axisTick: {
          //去掉坐标轴刻线
          show: false,
        },
      },
      legend: {
        show: false,
        itemWidth: 9,
        itemHeight: 9,
        icon: 'roundRect',
        right: 0,
        data: legendData,
      },
      series: seriesData,
    };
    myChart.setOption(option, true);
  }
  function renderLevelCharts(data) {
    if (!data) {
      return;
    }
    const dom = document.getElementById('levelChart');
    if (dom) {
      echarts.dispose(dom);
    }
    let levelChart = echarts.init(dom);
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}：{c} <br/>占比：{d}%', // 显示名称、数据和占比
      },
      legend: {
        show: false, // 隐藏图例
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '65%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: 'transparent',
            borderWidth: 2,
          },
          label: {
            show: true, // 显示标签
            position: 'outside', // 位置设为外部
            textBorderColor: 'transparent', // 去掉描边
            color: 'auto', // 使用 'auto' 表示与饼图颜色一致
            fontWeight: 'bold',
            fontSize: 12,
            formatter: '{b} {c}',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              textBorderColor: 'transparent', // 去掉描边
            },
          },
          labelLine: {
            show: true,
          },
          selectedMode: 'single',
          data,
        },
      ],
    };
    levelChart.setOption(option);
  }
</script>
<style scoped lang="less">
  .control-screen {
    height: 1080px;
    overflow-x: auto;
    overflow-y: hidden;
    background-color: #020b21;
    color: #fff;

    .home-bottom {
      height: 33px;
      width: 100%;
      background: url('/@/assets/images/controlScreen/home_bottom_bg.png') no-repeat;
    }
    .screen-topo {
      padding-left: 28px;
      height: 674px;
      position: relative;
      .tab {
        width: 350px;
        height: 56px;
        cursor: pointer;
        position: absolute;
        top: 10px;
        right: 30px;
        &.tabA04A01 {
          background: url('../../../assets/technical/tabone.png') no-repeat;
        }
        &.tabA04A02 {
          background: url('../../../assets/technical/tabtwo.png') no-repeat;
        }
        &.tabA04A06 {
          background: url('../../../assets/technical/tabsix.png') no-repeat;
        }
        > span {
          display: inline-block;
          height: 56px;
          vertical-align: middle;
        }
      }
    }
    .bot-box {
      display: flex;
      padding-bottom: 6px;
      padding-left: 20px;
      .left,
      .center,
      .right {
        .title {
          padding-left: 55px;
          height: 40px;
          line-height: 40px;
          font-size: 18px;
          font-family: PangMenZhengDao, PangMenZhengDao;
          color: #f4fffe;
        }
      }
      .left {
        width: 380px;
        // .title {
        //   background: url('/@/assets/technical/recordtitlebg.png') no-repeat;
        // }
      }
      .center {
        width: 1077px;
        margin: 0px 16px;
        .title {
          background: url('/@/assets/technical/counttitlebg.png') no-repeat;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .ct-form {
            padding-right: 4px;
          }
        }
      }
      .right {
        width: 420px;
        .title {
          background: url('/@/assets/technical/statisticstitlebg.png') no-repeat;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chart-box {
          height: 230px;
          background: url('/@/assets/technical/piebg.png') no-repeat center;
          position: relative;
          .chart-detail {
            position: absolute;
            width: 90px;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
            color: rgba(255, 255, 255, 0.8);
            font-size: 13px;
            text-align: center;
            > span {
              font-size: 28px;
              line-height: 28px;
              font-family: D-DIN-DIN;
              font-weight: bold;
              color: #ffffff;
            }
          }
        }
      }
    }
  }
</style>
<style scoped>
  :deep(.ant-picker) {
    background: rgba(100, 100, 100, 0);
    border: 0;
  }
  :deep(.ant-picker-focused) {
    box-shadow: 0 0 0 0px rgba(24, 144, 255, 0);
    color: white;
  }

  :deep(.ant-picker-separator) {
    color: white;
  }
  :deep(.ant-picker-input > input) {
    color: white;
  }
  /* 选中下划线 */
  :deep(.ant-picker-active-bar) {
    background: rgba(100, 100, 100, 0);
  }
  :deep(.ant-picker-clear) {
    right: -1px;
  }
  :deep(.ant-picker-suffix) {
    width: 0px;
  }

  .custom-select >>> .ant-select-selector {
    background-color: rgba(101, 100, 100, 0); /* 背景色设置 */
    border: 0;
    border-radius: 0;
    padding-right: 30px;
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }

  .custom-select >>> .ant-select-selection-item:hover {
    color: RGBA(185, 223, 252, 1);
  }
  .custom-select >>> .ant-select-selection-item {
    color: RGB(180, 180, 180) !important;
    padding-right: 0px;
    font-size: 15px;
    margin-right: 1px;
    text-align: center;
  }
  .custom-select >>> .ant-select-arrow {
    color: white;
    top: 45%;
    font-size: 15px;
    left: 85px;
  }
</style>
