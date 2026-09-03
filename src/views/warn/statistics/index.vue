<template>
  <div>
    <a-card :bordered="false">
      <!--自定义查询区域-->
      <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
        <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :md="7" :sm="12">
              <a-form-item label="选择时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" :allowClear="false" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="所属机构">
                <j-tree-select1
                  v-model:value="queryParam.orgCode"
                  :tree-data="orgOptions"
                  :field-names="{
                    label: 'departName',
                    value: 'orgCode',
                    options: 'children',
                  }"
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <a-row>
        <a-col :span="8">
          <div class="stats-title">
            <div class="stats-label">&nbsp;</div>
            报警等级统计
          </div>
          <div ref="warnLevelChart" id="warn-level" style="height: 300px; width: auto"></div>
        </a-col>
        <a-col :span="8">
          <div class="stats-title">
            <div class="stats-label">&nbsp;</div>
            报警状态统计
          </div>
          <div ref="warnStatusChart" id="warn-status" style="height: 300px; width: auto"></div>
        </a-col>
        <a-col :span="8">
          <div class="stats-title">
            <div class="stats-label">&nbsp;</div>
            报警类型统计
          </div>
          <div ref="warnTypeChart" id="warn-type" style="height: 300px; width: auto"></div>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="12">
          <div class="stats-title">
            <div class="stats-label">&nbsp;</div>
            报警设备统计
          </div>
          <div>
            <div ref="warnDeviceChart" class="warn-device" style="height: 300px; width: 100%"></div>
          </div>
        </a-col>
        <a-col :span="12">
          <!-- <div class="stats-title">
            <div class="stats-label">&nbsp;</div>
            报警设备统计
          </div> -->
          <div>
            <div ref="warnDeviceChartBar" class="warn-device-bar" style="height: 300px; width: auto"></div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import * as echarts from 'echarts';
import { warnLevel, warnStatus, warnType, warnDevice, warnDeviceBar } from './statistics.api';
import { getDepartTreeFor23 } from '/@/api/common/api';
import dayjs, { Dayjs } from 'dayjs';
import { JTreeSelect1 } from '/@/components/Form';
type RangeValue = [Dayjs, Dayjs];
const rangeValue = ref<RangeValue>([dayjs().subtract(30, 'day'), dayjs()]);
const warnLevelChart = ref();
const warnStatusChart = ref();
const warnTypeChart = ref();
const warnDeviceChart = ref();
const warnDeviceChartBar = ref();
const orgOptions = ref([]);
const queryParam = reactive({
  startTime: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  endTime: dayjs().format('YYYY-MM-DD'),
  orgCode: '',
});
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 16 },
});
async function getOrgList() {
  await getDepartTreeFor23().then((res) => {
    orgOptions.value = res;
  });
  load();
}
function onChangeTime(date: RangeValue) {
  queryParam.startTime = date[0].format('YYYY-MM-DD');
  queryParam.endTime = date[1].format('YYYY-MM-DD');
  // 时间范围不能超过12个月
  if (date[1].diff(date[0], 'month') > 12) {
    rangeValue.value = [date[0], date[0].add(12, 'month')];
  }
}
const disabledDate = (current: Dayjs) => {
  // 时间最长跨度12个月
  return current && current < dayjs().startOf('day');
};
getOrgList();
function load() {
  getWarnLevel();
  getWarnStatus();
  getWarnType();
  getWarnDevice();
  getWarnDeviceBar();
}
function searchQuery() {
  load();
}
function searchReset() {
  queryParam.startTime = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
  queryParam.endTime = dayjs().format('YYYY-MM-DD');
  queryParam.orgCode = '';
  load();
}

// 报警等级统计
function getWarnLevel() {
  const params = {
    ...queryParam,
  };
  warnLevel(params).then((res) => {
    console.log('getWarnLevel res', res);
    if (res) {
      renderWarnLevel(res);
    }
  });
}
function renderWarnLevel(data: any) {
  const myChart = echarts.init(warnLevelChart.value);
  let legend = [];
  data.forEach((item) => {
    legend.push(item.name);
  });
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: '75%',
      top: 'middle',
      align: 'left',
      itemHeight: 8,
      itemWidth: 20,
      itemGap: 15,
      data: legend,
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        center: ['35%', '50%'],
        labelLine: {
          show: true,
        },
        label: {
          // position: 'inner',
          fontSize: 12,
          formatter: '{b} {d}%',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: data,
      },
    ],
  };
  myChart.setOption(option);
}
// 报警状态统计
function getWarnStatus() {
  const params = {
    ...queryParam,
  };
  warnStatus(params).then((res) => {
    console.log('warnStatus res', res);
    if (res) {
      renderWarnStatus(res);
    }
  });
}
function renderWarnStatus(data: any) {
  const myChart = echarts.init(warnStatusChart.value);
  let legend = [];
  data.forEach((item) => {
    legend.push(item.name);
  });
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: '75%',
      top: 'middle',
      align: 'left',
      itemHeight: 8,
      itemWidth: 20,
      itemGap: 15,
      data: legend,
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        center: ['35%', '50%'],
        labelLine: {
          show: true,
        },
        label: {
          // position: 'inner',
          fontSize: 12,
          formatter: '{b} {d}%',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: data,
      },
    ],
  };
  myChart.setOption(option);
}
// 报警类型统计

function getWarnType() {
  const params = {
    ...queryParam,
  };
  warnType(params).then((res) => {
    console.log('warnType res', res);
    if (res) {
      renderWarnType(res);
    }
  });
}
function renderWarnType(data: any) {
  const myChart = echarts.init(warnTypeChart.value);
  let legend = [];
  data.forEach((item) => {
    legend.push(item.name);
  });
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: '75%',
      top: 'middle',
      align: 'left',
      itemHeight: 8,
      itemWidth: 20,
      itemGap: 15,
      data: legend,
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        center: ['35%', '50%'],
        labelLine: {
          show: true,
        },
        label: {
          // position: 'inner',
          fontSize: 12,
          formatter: '{b} {d}%',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: data,
      },
    ],
  };
  myChart.setOption(option);
}

// 报警设备统计
function getWarnDevice() {
  const params = {
    ...queryParam,
  };
  warnDevice(params).then((res) => {
    console.log('warnDevice res', res);
    if (res) {
      renderWarnDevice(res);
    }
  });
}
function renderWarnDevice(data: any) {
  const myChart = echarts.init(warnDeviceChart.value);
  let legend = [];
  data.forEach((item) => {
    legend.push(item.name);
  });
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: '68%',
      top: 'middle',
      align: 'left',
      itemHeight: 8,
      itemWidth: 20,
      itemGap: 15,
      data: legend,
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        center: ['35%', '50%'],
        labelLine: {
          show: true,
        },
        label: {
          // position: 'inner',
          fontSize: 12,
          formatter: '{b} {d}%',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: data,
      },
    ],
  };
  myChart.setOption(option);
}
// 报警设备统计-柱状图
function getWarnDeviceBar() {
  const params = {
    ...queryParam,
  };
  warnDeviceBar(params).then((res) => {
    console.log('getWarnDeviceBar res', res);
    if (res) {
      renderWarnDeviceBar(res);
    }
  });
}
function renderWarnDeviceBar(data: any) {
  const myChart = echarts.init(warnDeviceChartBar.value);
  const rawData = [];
  data.legend.forEach((item) => {
    let arr = Object.values(data.data[item]);
    let arr1 = arr.map((item) => {
      return Number(item);
    });
    rawData.push(arr1);
  });
  console.log('rawData', rawData);
  const totalData = [];
  for (let i = 0; i < rawData[0].length; ++i) {
    let sum = 0;
    for (let j = 0; j < rawData.length; ++j) {
      sum += rawData[j][i];
    }
    totalData.push(sum);
  }
  const grid = {
    left: 100,
    right: 100,
    top: 50,
    bottom: 100,
  };
  const series = data.legend.map((name, sid) => {
    return {
      name,
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
      label: {
        show: false,
        formatter: (params) => Math.round(params.value * 1000) / 10 + '%',
      },
      data: rawData[sid].map((d, did) => (totalData[did] <= 0 ? 0 : d / totalData[did])),
    };
  });
  const option = {
    legend: {
      selectedMode: false,
      // 底部
        bottom: 0,
    },
    grid,
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => value * 100 + '%',
      },
    },
    xAxis: {
      type: 'category',
      data: data.xaxisList,
      axisLabel: {
        interval: 0,
        rotate: 45,
      },
    },
    series,
  };
  myChart.setOption(option);
}
</script>

<style lang="less" scoped>
.stats-title {
  position: relative;
  font-weight: 700;
  font-size: larger;
  padding-left: 30px;
}

.stats-label {
  position: absolute;
  width: 5px;
  height: 20px;
  left: 5px;
  top: 3px;
  border-radius: 2px;
  background: rgb(58, 25, 177);
}
.jeecg-basic-table-form-container {
  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 50px;
    white-space: nowrap;
  }
}
.device-wrap {
  display: flex;
  justify-content: space-between;
  .warn-device {
    width: 50%;
  }
}
</style>