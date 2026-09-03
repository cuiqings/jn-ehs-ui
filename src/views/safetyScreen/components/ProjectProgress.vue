<script lang="ts" setup>
import * as echarts from 'echarts';
import {onMounted, onUnmounted, ref} from "vue";

import { getProgressApi } from '../plan.api';

const progressData:any = ref({})

function getProgressList(val) {
  const params = {
    orgCode: val.orgCode || 'A04'
  }
  getProgressApi(params).then(res => {
    progressData.value = res || {}
    initChart()
  })
}

let myEcharts = echarts;
onUnmounted(() => {
  myEcharts.dispose;
});
onMounted(() => {
  // initChart()
});

function initChart() {
  const dom=document.getElementById("ProjectProgressChart")
  if(dom){
    myEcharts.dispose(dom)
  }
  const xAxisData = Object.keys(progressData.value)
  const seriesData = Object.values(progressData.value)
  let chart = myEcharts.init(document.getElementById("ProjectProgressChart"));
  let option = {
    grid: {
      // 调整 grid 的大小
      left: '3%',
      right: '2%',
      bottom: '5%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      axisTick: {
        alignWithLabel: true
      },
      axisLabel:{
        interval:0,
        fontSize: 11,
        show: true,
        rotate: 30,
        textStyle: {
          color: "#999",
        }
      },
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      name: '单位：个',
      nameTextStyle:{//y轴上方单位的颜色
        color:'#999'  
      },
      type: 'value',
      splitLine:{
        lineStyle:{
            color:'#444' /* 控制刻度线颜色 */
        }
      },
      axisLabel: {//x轴文字的配置
        show: true,
          textStyle: {
            color: "#999",
          }
      },
      minInterval: 2  // 或者通过 interval 来设置间隔
    },
    series: [
      {
        data: seriesData,
        type: 'bar',
        barWidth: '30%',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#09D3DE' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#09D3DE' },
              { offset: 0.5, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        },
      }
    ]
  };
  chart.setOption(option);
}

defineExpose({
  getProgressList,
});
</script>

<template>
  <section class="projectProgress">
    <div class="card-title">
      <div class="title">环评项目进展</div>
    </div>
    <div class="high-risk-data">
      <div id="ProjectProgressChart" style="width: 100%;height: 100%;top:10px;left: 3px"></div>
    </div>
  </section>
</template>

<style scoped>
.projectProgress{
  display: flex;
  flex-direction:column;
  margin-top: 10px;
  width: 380px;
  height: 290px;
  .card-title{
    height:40px;
    padding-bottom: 2px;
    background: url('../../../assets/images/controlScreen/highrisk_als.png') no-repeat;
    position: relative;
    .title{
      font-size: 18px;
      text-align:left;
      font-weight:bold;
      color:#F4FFFE;
      margin-left:58px;
      line-height:38px;
      /* font-family:PangMenZhengDao-Regular; */
    }
  }
  .high-risk-data{
    height: 100%;
    width: 100%;
  }
}
</style>
