<template>
  <div class="report-wrapper">
    <div class="report-summary">
      <div class="title">
        <div class="left">安全指数评分</div>
        <div v-if="currentData.explanation" class="right"><info-circle-outlined /> {{ currentData.explanation }}</div>
      </div>
      <div class="chart">
        <div class="level">
          <div class="level-1">
            <a-progress
              :strokeColor="colorList[currentData.riskLevel]"
              :width="150"
              stroke-linecap="circle"
              :percent="currentData.totalScore"
              type="dashboard"
            >
              <template #format="percent">
                <span style="font-family: D-DIN; font-weight: bold; font-size: 60px; color: rgba(0, 0, 0, 0.87)">{{ percent }}</span>
              </template></a-progress
            >
            <div class="score-text">实时评分</div>
          </div>
          <div class="level-2">
            <div class="label" :style="{ background: colorList[currentData.riskLevel], color: level == currentData.riskLevel ? '#000' : 'fff' }">{{
              level[currentData.riskLevel]
            }}</div>
            <div class="desc">
              <a-tooltip>
                <template #title>{{ currentData.riskLevelRemark }}</template>
                {{ currentData.riskLevelRemark }}
              </a-tooltip>
            </div>
            <a-button style="margin-left: -12px" type="link" @click="handleCurrentDetail('')">查看报告</a-button>
          </div>
        </div>
        <div class="line"></div>
        <div class="pic">
          <div ref="chartRef" style="height: 200px; width: 1033px"></div>
        </div>
      </div>
    </div>
    <div class="report-list">
      <div class="header">
        <div class="left">
          <span class="year">年份</span>
          <a-date-picker v-model:value="year" picker="year" style="width: 118px" :allowClear="false" />
          <a-button style="margin-left: 10px" type="primary" @click="handleSearch">查询</a-button>
        </div>
        <div class="right">
          <a-button type="primary" @click="handleAddSelf">添加自评</a-button>
        </div>
      </div>
      <div class="split"></div>
      <div class="list-wrapper" v-if="reportList.length > 0">
        <div class="item" v-for="item in reportList" :key="item.id" :style="{ marginRight: item % 6 === 0 ? '0' : '25px' }">
          <div class="year">{{ item.yearStr }}</div>
          <div class="title">{{ item.dateStr }}{{ reportType[item.reportType] }}</div>
          <div class="score"
            ><div class="score-1">{{ item.totalScore }}</div>
            <div class="score-2">分</div>
          </div>
          <div class="btn">
            <a-button type="link" @click="handleCurrentDetail(item.id)">查看报告</a-button>
          </div>
        </div>
      </div>
      <a-empty style="margin-top: 20px" v-else description="暂无结果" />
    </div>
    <SelfEvaluateModal @register="registerModal" @success="successOk" />
    <DetailModal @register="registerDetailModal" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import * as echarts from 'echarts';
  import dayjs, { Dayjs } from 'dayjs';
  import { getCurrentScore, getReportList, getReportById, getLineData } from '../api';
  import SelfEvaluateModal from './SelfEvaluateModal.vue';
  import DetailModal from './DetailModal.vue';
  const [registerModal, { openModal }] = useModal();
  const [registerDetailModal, { openModal: openDetailModal }] = useModal();
  const chartRef = ref();
  const year = ref<Dayjs>(dayjs(new Date()));
  const currentData = ref({});
  const reportList = ref([]);
  const colorList = {
    '1': '#09C199',
    '2': '#51D8DE',
    '3': '#FFD902',
    '4': '#FF8D04',
    '5': '#F43328',
  };
  const level = {
    '1': '低风险',
    '2': '中低风险',
    '3': '中风险',
    '4': '中高风险',
    '5': '高风险',
  };
  const reportType = {
    '1': '日报告',
    '2': '月报告',
    '3': '季度报告',
    '4': '年报告',
  };
  onMounted(() => {
    initPage();
  });
  async function initPage() {
    await getCurrentScore().then((res) => {
      console.log('getCurrentScore', res);
      currentData.value = res;
    });
    await getLineData().then((res) => {
      console.log('getLineData', res);
      getChartView(res);
    });
    initList();
  }
  function getChartView(res) {
    let myChart = echarts.init(chartRef.value);
    let option = {
      title: {
        left: 'left',
        text: '近一个月安全指数评分趋势',
        textStyle: {
          color: 'rgba(0, 0, 0, 0.87)',
          fontSize: 14,
          fontWeight: 500,
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: res.days || [],
      },
      yAxis: {
        type: 'value',
        minInterval: 50,
        max: 100,
        min: 0,
      },
      grid: {
        left: '3%',
        bottom: '8%',
        top: '20%',
        containLabel: true,
      },
      series: [
        {
          data: res.scores || [],
          type: 'line',
          symbol: 'none',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(62, 135, 248, 1)',
              },
              {
                offset: 1,
                color: 'rgba(62, 135, 248, 0)',
              },
            ]),
          },
        },
      ],
    };

    option && myChart.setOption(option);
  }
  function handleAddSelf() {
    openModal(true, {
      title: '添加自评',
      width: 800,
      footer: false,
    });
  }
  async function handleCurrentDetail(id) {
    if (id) {
      // 获取报告详情
      console.log('id', id);
      await getReportById({ id: id }).then((res) => {
        console.log('getReportById', res);
        openDetailModal(true, {
          title: `${res.dateStr}安全指数报告`,
          record: res,
        });
      });
    } else {
      openDetailModal(true, {
        title: '安全指数报告',
        record: currentData.value,
      });
    }
  }
  function handleSearch() {
    initList();
  }
  async function initList() {
    let params = {
      year: year.value.year(),
      pageNo: 1,
      pageSize: 50,
    };
    await getReportList(params).then((res) => {
      console.log('getReportList', res);
      reportList.value = res.records;
    });
  }
  function successOk() {
    initPage();
  }
</script>

<style lang="less" scoped>
  .report-wrapper {
    margin: 16px;
    background-color: #fff;
    padding: 24px;
  }
  .report-summary {
    height: 295px;
    background: linear-gradient(63deg, #e3f1ff 0%, #f2f7fc 26%, #ebf3fe 53%, #d9e6fe 100%);
    border-radius: 8px 8px 8px 8px;
    .title {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      height: 32px;
      line-height: 32px;
      .left {
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 500;
        font-size: 20px;
        color: #000000;
      }
      .right {
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 400;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
    .chart {
      display: flex;
      background: #fff;
      margin: 34px 16px 0;
      height: 210px;
      background: #ffffff;
      border-radius: 6px 6px 6px 6px;
      .level {
        width: 413px;
        display: flex;
        align-items: center;
        margin: 0 20px;
        .level-1 {
          width: 160px;
          position: relative;
          .score-text {
            position: absolute;
            bottom: 16px;
            left: 52px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
          }
        }
        .level-2 {
          margin-left: 20px;
          .label {
            width: 63px;
            height: 27px;
            background: #09c199;
            border-radius: 4px 4px 4px 4px;
            font-size: 14px;
            color: #ffffff;
            text-align: center;
            line-height: 27px;
          }
          .desc {
            width: 188px;
            height: 65px;
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            text-align: left;
            margin-top: 8px;
            overflow: hidden;
          }
        }
      }
      .line {
        width: 1px;
        height: 160px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        margin: 25px 0;
      }
      .pic {
        margin: 20px 0 10px 10px;
      }
    }
  }

  .report-list {
    margin-top: 20px;
    .header {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      .left {
        .year {
          display: inline-block;
          margin-right: 10px;
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 500;
          font-size: 20px;
          color: rgba(0, 0, 0, 0.87);
        }
      }
      .right {
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 400;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
    .split {
      height: 1px;
      background: #f1f1f1;
    }
    .list-wrapper {
      margin: 25px auto;
      .item {
        position: relative;
        display: inline-block;
        width: 210px;
        height: 297px;
        background: url('/@/assets/images/report-bg.png') no-repeat;
        background-size: 100% 100%;
        margin-bottom: 20px;
        .year {
          position: absolute;
          top: 30px;
          left: 20px;
          font-family: Songti SC, Songti SC;
          font-weight: 900;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.87);
        }
        .title {
          position: absolute;
          top: 55px;
          left: 20px;
          font-family: Songti SC, Songti SC;
          font-weight: 900;
          font-size: 23px;
          color: rgba(0, 0, 0, 0.87);
        }
        .score {
          position: absolute;
          top: 100px;
          left: 56px;
          .score-1 {
            display: inline-block;
            font-family: D-DIN;
            font-weight: bold;
            font-size: 60px;
            color: rgba(0, 0, 0, 0.87);
          }
          .score-2 {
            display: inline-block;
            font-family: Songti SC, Songti SC;
            font-weight: 900;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
          }
        }
        .btn {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
</style>
