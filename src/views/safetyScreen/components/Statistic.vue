<script lang="ts" setup>
  import * as echarts from 'echarts';
  import { getStatusStatistics } from '../plan.api';
  import { onUnmounted, ref } from 'vue';
  let myEcharts = echarts;
  const curChartData: any = ref();
  onUnmounted(() => {
    myEcharts.dispose;
  });
  const init = (val) => {
    getStatusStatistics({
      org: val.orgCode ? val.orgCode : 'A04B01',
      startDate: val.startTime,
      endDate: val.endTime,
    }).then((res) => {
      if (res) {
        const keys = Object.keys(res);
        const data = keys.map((item) => {
          return {
            name: item,
            value: res[item],
          };
        });
        curChartData.value = data[0];
        initChart(data);
      } else {
        initChart([]);
      }
    });
  };
  function initChart(data) {
    const dom = document.getElementById('statisticChart');
    if (dom) {
      myEcharts.dispose(dom);
    }
    let chart = myEcharts.init(dom);
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
          name: '',
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
          data: data,
        },
      ],
    };
    chart.setOption(option);
  }
  defineExpose({
    init,
  });
</script>

<template>
  <section class="hazardAnalyses">
    <div class="card-title">
      <div class="title">检查问题统计</div>
    </div>
    <div class="hazard-data">
      <div id="statisticChart" style="width: 100%; height: 100%; position: absolute; top: 10px; left: 3px"></div>
    </div>
  </section>
</template>

<style scoped>
  .center-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 14px;
    text-align: center;
    font-weight: bold; /* 字体粗细 */
    text-align: center;
  }
  .percentage {
    font-size: 34px; /* 修改数字的大小 */
    /* 还可以添加其他样式，比如字体颜色 color、字体粗细 font-weight 等 */
  }
  .hazardAnalyses {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    width: 380px;
    height: 290px;
    .card-title {
      height: 40px;
      background: url('../../../assets/images/controlScreen/highrisk_als.png') no-repeat;
      position: relative;
      .title {
        font-size: 18px;
        text-align: left;
        font-weight: bold;
        color: #f4fffe;
        margin-left: 58px;
        line-height: 38px;
        /* font-family:PangMenZhengDao-Regular; */
      }
    }
    .hazard-data {
      height: 240px;
      position: relative;
      .bg {
        position: absolute;
        top: 24px;
        left: 90px;
        height: 207px;
        width: 207px;
        background: url('../../../assets/images/controlScreen/staticbg.png') no-repeat left;
        background-size: cover; /* 让背景图片完全覆盖容器 */
      }
    }
  }
</style>
