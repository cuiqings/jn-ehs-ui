<!-- 危险作业完工验收作业票统计 -->
<template>
  <div v-loading="loading" ref="chartRef" class="chart-wrap"></div>
</template>
<script lang="ts" setup>
  import { ref, Ref, reactive } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions, getInstance } = useECharts(chartRef as Ref<HTMLDivElement>);
  const option = reactive<any>({
    title: {
      text: '',
      left: 'center',
    },
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
      bottom: 0,
    },
    grid: {
      top: 60,
      left: 50,
      bottom: 60,
      right: 30,
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
    option.series = data.series;
    option.xAxis = data.xAxis;
    option.yAxis = data.yAxis;
    option.title.text = data.title;
    if(data.grid) {
      Object.assign(option.grid, data.grid);
    }
    if(data.barWidth) {
      option.barWidth = data.barWidth;
    }
    if(data.color){
      option.color = data.color;
    }
    if(data.dataZoom) {
      option.dataZoom = data.dataZoom;
    }
    console.log(option.color);
    
    setOptions(option);
  }
 
  defineExpose({
    initCharts,
    getInstance
  });
</script>

<style lang="less" scoped>
  .chart-wrap {
    width: 100%;
    height: 380px;
    position: relative;
  }
</style>
