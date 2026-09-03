<!-- 危险作业类型与状态统计 -->
<template>
  <div v-loading="loading" ref="chartRef" style="width: 100%; height: 310px; position: relative; flex: 1"></div>
</template>
<script lang="ts" setup>
  import { ref, Ref, reactive, nextTick } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getOrgStateData } from '../jobAccounting.api';

  const loading = ref<boolean>(true);
  const getData = async (value) => {
    // loading.value = true;
    let data = await getOrgStateData({ applicant: value }).catch((err) => (loading.value = false));
    loading.value = false;
    nextTick(() => {
      initCharts(data);
    });
  };

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
      bottom: 80,
      right: 20,
    },
    xAxis: {
      type: 'category',
      axisTick: { show: false },
      data: [],
      axisLabel: {
        interval: 0,
        rotate: 40,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [],
  });

  function initCharts(data) {
    let odata: any = [];

    data.series[0].data.map((val, idx) => {
      let obj: any = {
        name: val.name,
        data: [],
        type: 'bar',
        barMaxWidth: 20,
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return !params.data ? '' : params.data;
          },
        },
      };
      data.series.map((v) => {
        obj.data.push(v.data[idx].v);
      });
      odata.push(obj);
    });

    option.series = odata;
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
