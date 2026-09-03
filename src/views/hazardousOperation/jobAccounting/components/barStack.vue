<!-- 危险作业完工验收作业票统计 -->
<template>
  <div v-loading="loading" ref="chartRef" class="chart-wrap"></div>
</template>
<script lang="ts" setup>
  import { ref, Ref, reactive, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getFinishData } from '../jobAccounting.api';
  const loading = ref<boolean>(true);

  const getData = async (value) => {
    loading.value = true;
    let data = await getFinishData({ queryDate: value });
    loading.value = false;
    initCharts(data);
  };

  onMounted(() => {
    // 默认查当月
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    getData(year + '-' + month);
  });

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
  const option = reactive({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        label: {
          show: true,
          backgroundColor: '#333',
        },
      },
    },
    legend: {
      top: 0,
    },
    grid: {
      top: 60,
      left: 50,
      bottom: 30,
      right: 20,
    },
    barWidth: 30,
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [],
  });

  function initCharts(data) {
    option.series = data.series.map((val) => {
      val.type = 'bar';
      return val;
    });
    option.xAxis.data = data.xAxis;
    setOptions(option);
  }

  defineExpose({
    getData,
  });
</script>

<style lang="less" scoped>
  .chart-wrap {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
