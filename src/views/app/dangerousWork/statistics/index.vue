<template>
  <div class="dangerous-statistics">
    <van-popup v-model:show="searchShow">内容</van-popup>
    <van-calendar :min-date="minDate" :max-date="maxDate" allow-same-day type="range" v-model:show="showDatePicker" @confirm="onDateConfirm" />
    <!-- 总体统计 -->
    <div class="overall-statistics">
      <div class="tit">
        总体统计
        <!-- <span>{{ dateRangeText }}</span> -->
      </div>
      <!-- <div ref="barChart" style="height: 220px; margin-bottom: 16px"></div> -->
      <div ref="pieChart" style="height: 220px"></div>
    </div>

    <!-- 公司统计卡片 -->
    <template v-for="(company, idx) in companyList" :key="company.orgName">
      <div v-if="idx > 0" class="company-card" @click="goToDetail(company)">
        <div class="hd">{{ company.orgName }}<van-icon name="arrow" /></div>
        <div class="company-stats">
          <div class="li">
            <div class="stat">
              <div class="tit">审核</div>
              <div class="stat-blue">
                <span class="stat-blue">{{ company.workCount }}</span>
                <span>公司:{{ company.companyCount }} 单位:{{ company.workCount }}</span>
              </div>
            </div>
            <div class="stat">
              <div class="tit">验收</div>
              <div class="stat-blue">
                <span class="stat-blue">{{ company.finishCount }}</span>
                <span>未验收:{{ company.notFinishCount }}</span>
              </div>
            </div>
          </div>
          <div class="li">
            <div class="stat">
              <div class="tit">作业</div>
              <div class="stat-blue">
                <span class="stat-blue">{{ company.recordCount }}</span>
                <span>进行中:{{ company.runCount }}</span>
              </div>
            </div>
            <div class="stat">
              <div class="tit">单位抽查</div>
              <div class="stat-blue">
                <span class="stat-blue">{{ company.unitCheckCount }}</span>
                <span>正常:{{ company.unitCheckCountZc }} 异常:{{ company.unitCheckCountYc }}</span>
              </div>
            </div>
          </div>
          <div class="stat-l">
            <div class="tit">公司抽查</div>
            <div class="stat-blue">
              <span class="stat-blue">{{ company.companyCheckCount }}</span>
              <span>正常:{{ company.companyCheckCountZc }} 异常:{{ company.companyCheckCountYc }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { getWorkReport } from '../../../hazardousOperation/api';
import { useRouter } from 'vue-router';
  const searchShow = ref(true)
  // 日期区间
  const minDate = new Date(2023, 0, 1);
  const maxDate = new Date(2060, 12, 31);
  const now = new Date();
  const dateRangeText = ref(formatDate(now) + ' 至 ' + formatDate(now));
  const showDatePicker = ref(false);
  const router = useRouter();
  // mock 公司数据
  const companyList = ref<any[]>([]);

  const barChart = ref(null);
  const pieChart = ref(null);

  // mock 柱状图数据
  const barOption = ref({
    grid: {
      top: 10,
      left: 10,
      right: 10,
      containLabel: true,
    },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 10, data: ['公司', '单位', '完成', '未完成', '进行中', '正常', '异常'] },
    xAxis: { type: 'category', axisLabel: { interval: 0, rotate: 45 }, data: ['审批', '验收', '作业', '单位抽查', '公司抽查'] },
    yAxis: { type: 'value' },
    series: [
      { name: '公司', barWidth: 3, type: 'bar', data: [200, 120, 150, 80] },
      { name: '单位', barWidth: 3, type: 'bar', data: [100, 60, 90, 40] },
      { name: '完成', barWidth: 3, type: 'bar', data: [180, 100, 120, 70] },
      { name: '未完成', barWidth: 3, type: 'bar', data: [20, 20, 30, 10] },
      { name: '进行中', barWidth: 3, type: 'bar', data: [30, 10, 20, 5] },
      { name: '正常', barWidth: 3, type: 'bar', data: [170, 110, 130, 60] },
      { name: '异常', barWidth: 3, type: 'bar', data: [10, 10, 20, 20] },
    ],
  });

  // mock 饼图数据
  const pieOption = ref({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    series: [
      {
        name: '数据',
        type: 'pie',
        radius: ['0%', '60%'],
        label: {
          position: 'inner',
        },
        data: [],
      },
      {
        name: '数据',
        type: 'pie',
        radius: ['65%', '90%'],
        itemStyle: {
          borderWidth: 1,
          borderColor: '#fff',
        },
        data: [],
      },
    ],
  });

  nextTick(() => {
    initBarChart();
  });

  let mapData: any = {
    审批: 0,
    验收: 0,
    作业: 0,
    单位抽查: 0,
    公司抽查: 0,
  };
  let mapData2: any = {
    公司审批: 0,
    单位审批: 0,
    完成验收: 0,
    未验收: 0,
    完成作业数量: 0,
    在作业数量: 0,
    单位抽查正常: 0,
    单位抽查异常: 0,
    公司抽查正常: 0,
    公司抽查异常: 0,
  };
  async function initBarChart() {
    const res = await getWorkReport({
      startDate: dateRangeText.value.split('至')[0],
      endDate: dateRangeText.value.split('至')[1],
    });
    mapData['审批'] = res[0].workCount;
    mapData['验收'] = res[0].finishCount + res[0].notFinishCount;
    mapData['作业'] = res[0].recordCount + res[0].runCount;
    mapData['单位抽查'] = res[0].unitCheckCount;
    mapData['公司抽查'] = res[0].companyCheckCount;
    mapData2['公司审批'] = res[0].companyCount;
    mapData2['单位审批'] = res[0].unitCount;
    mapData2['完成验收'] = res[0].finishCount;
    mapData2['未验收'] = res[0].notFinishCount;
    mapData2['完成作业数量'] = res[0].recordCount;
    mapData2['在作业数量'] = res[0].runCount;
    mapData2['单位抽查正常'] = res[0].unitCheckCountZc;
    mapData2['单位抽查异常'] = res[0].unitCheckCountYc;
    mapData2['公司抽查正常'] = res[0].companyCheckCountZc;
    mapData2['公司抽查异常'] = res[0].companyCheckCountYc;
    companyList.value = res;
    pieOption.value.series[0].data = Object.keys(mapData).map((key) => ({ value: mapData[key], name: key }));
    pieOption.value.series[1].data = Object.keys(mapData2).map((key) => ({ value: mapData2[key], name: key }));
    console.log(pieOption.value.series[0].data, pieOption.value.series[1].data);

    const pie = echarts.init(pieChart.value);
    pie.setOption(pieOption.value);
  }
  function onDateConfirm(val) {
    showDatePicker.value = false;
    if (val && val.length === 2) {
      const [start, end] = val;
      dateRangeText.value = `${formatDate(start)} 至 ${formatDate(end)}`;
    }
    initBarChart();
  }
  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function goToDetail(company) {
    sessionStorage.setItem(
      'company-D',
      JSON.stringify({
        orgName: company.orgName,
        orgCode: company.orgCode,
        time: dateRangeText.value.split(' 至 ').join(','),
      })
    );
    router.push({
      path: '/app/dangerousWork/statisticsDetail',
    });
  }
</script>

<style lang="less" scoped>
  .title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      font-weight: 400;
      display: flex;
      align-items: center;
    }
    .date-range {
      &::after {
        content: '';
        display: inline-block;
        width: 0px;
        height: 0px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #666;
        margin-left: 4px;
      }
    }
  }
  .dangerous-statistics {
    padding: 12px;
    background: #f7f8fa;
    min-height: 100vh;
  }
  .overall-statistics {
    background: #fff;
    border-radius: 8px;
    margin: 16px 0;
    padding: 12px 0;
    box-shadow: 0 2px 8px #f0f1f2;
    .tit {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      margin-bottom: 12px;
    }
  }
  .company-card {
    margin-bottom: 12px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px #f0f1f2;
    .hd {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
  }
  .company-stats {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    font-size: 14px;
    margin-top: 4px;
    flex-direction: column;
    .li {
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .stat {
        width: calc(50% - 6px);
        height: 100%;
        background-color: #f0f6ff;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 0 10px;
      }
      .stat:nth-child(2) {
        background-color: #f2fdf5;
      }
    }
    .stat-l {
      width: 100%;
      height: 45px;
      border-radius: 4px;
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: #fcf3f2;
    }
  }
  .stat-blue {
    color: #1989fa;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    span:nth-child(2) {
      color: #666;
    }
  }
  .stat-green {
    color: #07c160;
  }
  .stat-orange {
    color: #ff976a;
  }
  .stat-red {
    color: #ee0a24;
  }
</style>
