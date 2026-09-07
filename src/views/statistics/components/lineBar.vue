<!-- 危险作业完工验收作业票统计 -->
<template>
  <div class="chart-scroll-wrap">
    <div v-loading="loading" ref="chartRef" class="chart-wrap" :style="chartStyle"></div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, Ref, computed } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';

  defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions, getInstance } = useECharts(chartRef as Ref<HTMLDivElement>);

  // 动态宽度：每个分组最少 120px，不够就撑开滚动
  const chartWidth = ref('100%');
  const chartStyle = computed(() => ({ width: chartWidth.value, height: '380px' }));

  function initCharts(data) {
    // 根据 x 轴数据量动态设置宽度，每组至少 120px
    const xData = Array.isArray(data.xAxis) ? data.xAxis[0]?.data : data.xAxis?.data;
    const count = Array.isArray(xData) ? xData.length : 0;
    const minWidth = count > 0 ? Math.max(count * 120, 500) : 500;
    chartWidth.value = `${minWidth}px`;

    const option: any = {
      title: {
        text: data.title || '',
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
      grid: Object.assign(
        { top: 60, left: 50, bottom: 60, right: 30 },
        data.grid || {}
      ),
      barWidth: data.barWidth || 30,
      xAxis: data.xAxis,
      yAxis: data.yAxis,
      series: data.series,
    };
    if (data.barGap !== undefined) option.barGap = data.barGap;
    if (data.barCategoryGap !== undefined) option.barCategoryGap = data.barCategoryGap;
    if (data.color) option.color = data.color;
    // dataZoom 不再需要，不传

    setOptions(option);
  }

  defineExpose({
    initCharts,
    getInstance,
  });
</script>

<style lang="less" scoped>
  .chart-scroll-wrap {
    width: 100%;
    overflow-x: auto;
  }
  .chart-wrap {
    height: 380px;
    position: relative;
    min-width: 500px;
  }
</style>
