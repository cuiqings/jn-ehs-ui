<template>
  <a-card :bordered="false">
    <div class="search-wrap">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item required label="频度" name="deviceFrequentness">
              <JDictSelectTag
                v-model:value="queryParam.deviceFrequentness"
                @change="handleChangeDateType"
                :show-choose-option="false"
                placeholder="请选择"
                dictCode="device_frequentness"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item required label="时间" name="pickDateValue">
              <!-- 分钟 -->
              <a-date-picker
                v-if="dateType == 'minute'"
                :format="minuteFormat"
                show-time
                :disabled-date="disabledDate"
                placeholder="请选择分钟"
                @change="onSecondChange"
                v-model:value="queryParam.pickDateValue"
              />
              <!-- 小时 -->
              <a-date-picker
                v-if="dateType == 'hour'"
                :format="hourFormat"
                show-time
                placeholder="请选择小时"
                @change="onHourChange"
                v-model:value="queryParam.pickDateValue"
              />
              <!-- 日 -->
              <a-date-picker v-if="dateType == 'day'" v-model:value="queryParam.pickDateValue" @change="onDayChange" />
              <!-- 周 -->
              <a-date-picker
                v-if="dateType == 'week'"
                picker="week"
                v-model:value="queryParam.pickDateValue"
                placeholder="请选择周"
                @change="onWeekChange"
              />
              <!-- 月 -->
              <a-date-picker
                v-if="dateType == 'month'"
                picker="month"
                v-model:value="queryParam.pickDateValue"
                placeholder="请选择月"
                @change="onMonthChange"
              />
              <!-- 季度 -->
              <a-date-picker
                v-if="dateType == 'quarter'"
                placeholder="请选择季度"
                v-model:value="queryParam.pickDateValue"
                @change="onQuarterChange"
              />
              <!-- 年 -->
              <a-date-picker v-if="dateType == 'year'" placeholder="请选择年" v-model:value="queryParam.pickDateValue" picker="year" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button type="primary" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="device-line-chart" id="device-line-chart"></div>
  </a-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
const { createMessage } = useMessage();
const formRef = ref();
const queryParam = reactive({
  deviceFrequentness: undefined,
  pickDateValue: undefined,
});
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 5 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 19 },
});
const quarterValue = ref('');
const yearValue = ref<Dayjs>();
const queryDateValue = ref(new Date().getTime());
const dateType = ref('week');
const pickDateValue = ref<Dayjs>();
const confirmLoading = ref(false);
const legendFields = ref([]);
const interval = ref(0);
const xaxis = ref([]);
const dataSource3 = ref({});
const seriesData = ref([]);
const minuteFormat = 'YYYY-MM-DD HH:mm';
const hourFormat = 'YYYY-MM-DD HH:00';
const validatorRules = {
  deviceFrequentness: [{ required: true, message: '请选择频度', trigger: 'blur' }],
  pickDateValue: [{ required: true, message: '请选择时间', trigger: 'blur' }],
};
// props
const props = defineProps({
  deviceId: {
    type: String,
    default: '',
  },
});
function handleChangeDateType(value) {
  console.log('value', value);
  if (value == 'quarter') {
    let currentMonth = new Date().getMonth() + 1; // +1
    console.log('currentMonth', currentMonth);
    if (currentMonth == 1 || currentMonth == 2 || currentMonth == 3) {
      quarterValue.value = '第一季度';
    }
    if (currentMonth == 4 || currentMonth == 5 || currentMonth == 6) {
      quarterValue.value = '第二季度';
    }
    if (currentMonth == 7 || currentMonth == 8 || currentMonth == 9) {
      quarterValue.value = '第三季度';
    }
    if (currentMonth == 10 || currentMonth == 11 || currentMonth == 12) {
      quarterValue.value = '第四季度';
    }
    queryDateValue.value = new Date().getTime();
  }
  if (value == 'year') {
    yearValue.value = dayjs();
  }
  dateType.value = value;
  if (value != 'year' && value != 'quarter') {
    pickDateValue.value = dayjs();
  }
}
function disabledDate(current) {
  return current <= dayjs().subtract(30, 'days') || current > dayjs().endOf('day');
}
function onDayChange(date, dateString) {
  //   console.log(date, dateString, new Date(date).getTime())
  console.log(date, dateString, new Date(dateString).getTime());
  queryDateValue.value = new Date(dateString).getTime();
}
// 分钟
function onSecondChange(date, dateString) {
  console.log(date, dateString, new Date(dateString).getTime()); // 分钟
  queryDateValue.value = new Date(dateString).getTime();
}
// 小时
function onHourChange(date, dateString) {
  console.log(date, dateString, new Date(dateString).getTime()); // 小时
  queryDateValue.value = new Date(dateString).getTime();
}
function onWeekChange(date, dateString) {
  if (date) {
    console.log(pickDateValue.value);
    console.log(date, dateString, new Date(date).getTime());
    //console.log(date, dateString, new Date(dateString).getTime())
    queryDateValue.value = new Date(date).getTime();
  }
}
function onMonthChange(date, dateString) {
  // console.log(date, dateString, new Date(date).getTime())
  console.log(date, dateString, new Date(dateString).getTime());
  queryDateValue.value = new Date(dateString).getTime();
}
function onQuarterChange(date, dateString) {
  console.log(date, dateString, new Date(date).getTime());
  console.log(date, dateString, new Date(dateString).getTime());
  let currentMonth = new Date(date).getMonth() + 1; // +1
  console.log('currentMonth', currentMonth);
  if (currentMonth == 1 || currentMonth == 2 || currentMonth == 3) {
    quarterValue.value = '第一季度';
  }
  if (currentMonth == 4 || currentMonth == 5 || currentMonth == 6) {
    quarterValue.value = '第二季度';
  }
  if (currentMonth == 7 || currentMonth == 8 || currentMonth == 9) {
    quarterValue.value = '第三季度';
  }
  if (currentMonth == 10 || currentMonth == 11 || currentMonth == 12) {
    quarterValue.value = '第四季度';
  }
  queryDateValue.value = new Date(date).getTime();
}
function searchQuery() {
  formRef.value.validate().then(async (values) => {
    console.log('values', values);
    // if (dateType.value == 'year') {
    //   if (!yearValue.value) {
    //     createMessage.warning('请选择时间！');
    //   }
    // }
    let params = {};
    params.timestamp = queryDateValue.value;
    params.frequentNess = dateType.value;
    params.deviceId = props.deviceId;
    console.log('form params', params);
    confirmLoading.value = true;
    await defHttp.get({ url: '/device/getDeviceNormalizationData', params }).then((res) => {
      confirmLoading.value = false;
      console.log('getDeviceNormalizationData', res);
      if (res.legend) {
        legendFields.value = res.legend;
      } else {
        legendFields.value = [];
      }
      if (res.xaxis) {
        xaxis.value = res.xaxis;
      } else {
        xaxis.value = [];
      }
      if (dateType.value == 'minute' && xaxis.value.length > 0) {
        let arr = [];
        for (let i = 0; i < xaxis.value.length; i++) {
          //arr.push(this.xaxis[i].substring(16, 18)+'秒')
          arr.push(new Date(xaxis.value[i]).getSeconds() + 1 + '秒');
        }
        console.log('arr', arr);
        interval.value = 2;
        xaxis.value = arr;
      }
      if (dateType.value == 'hour' && xaxis.value.length > 0) {
        let arr = [];
        for (let i = 0; i < xaxis.value.length; i++) {
          arr.push(new Date(xaxis.value[i]).getMinutes() + 1 + '分');
        }
        console.log('arr', arr);
        interval.value = 2;
        xaxis.value = arr;
      }
      if (dateType.value == 'day' && xaxis.value.length > 0) {
        let arr = [];
        for (let i = 0; i < xaxis.value.length; i++) {
          arr.push(new Date(xaxis.value[i]).getHours() + 1 + '时');
        }
        console.log('arr', arr);
        interval.value = 0;
        xaxis.value = arr;
      }
      if (dateType.value == 'week' && xaxis.value.length > 0) {
        let arr = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        console.log('arr', arr);
        interval.value = 0;
        xaxis.value = arr;
      }
      if (dateType.value == 'month' && xaxis.value.length > 0) {
        let arr = [];
        for (let i = 0; i < xaxis.value.length; i++) {
          arr.push(i + 1 + '日');
        }
        console.log('arr', arr);
        interval.value = 0;
        xaxis.value = arr;
      }
      if ((dateType.value == 'quarter' || dateType.value == 'year') && xaxis.value.length > 0) {
        let arr = [];
        for (let i = 0; i < xaxis.value.length; i++) {
          arr.push(xaxis.value[i].substring(0, 7));
        }
        interval.value = 0;
        console.log('arr', arr);
        xaxis.value = arr;
      }
      if (res.data) {
        dataSource3.value = JSON.parse(JSON.stringify(res.data));
        console.log('this.dataSource', dataSource3.value);
        let seriesArr = [];
        let keys = Object.keys(dataSource3.value); //获得对象属性名组成的数组
        //用for进行遍历
        for (let i = 0, len = keys.length; i < len; i++) {
          seriesArr.push({ name: keys[i], type: 'line', data: dataSource3.value[keys[i]] });
        }
        seriesData.value = seriesArr;
        console.log('seriesArr', seriesArr);
      }
      getLineChart();

      // legendFields.value = [];
      // xaxis.value = [];
      // dataSource3.value = {};
      // seriesData.value = [];
      // confirmLoading.value = false;
      // getLineChart();
      // createMessage.warning(res.message);
    });
  });
}
function getLineChart() {
  let myChart = echarts.init(document.getElementById('device-line-chart'));
  let option = {
    title: {
      text: '归一化',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: legendFields.value,
    },
    grid: {
      left: '6%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xaxis.value,
      axisLabel: {
        show: true,
        interval: interval.value,
        rotate: 40,
        margin: 10,
        fontSize: 12,
        textStyle: {
          color: '#333',
        },
      },
    },
    yAxis: {
      type: 'value',
    },
    series: seriesData.value,
  };

  option && myChart.setOption(option, true);
}
function searchReset() {
  queryParam.deviceFrequentness = undefined;
  queryParam.pickDateValue = undefined;
  searchQuery();
}
</script>

<style lang="less" scoped>
.device-line-chart {
  width: 90%;
  height: 400px;
  margin: 130px auto 0;
}
</style>