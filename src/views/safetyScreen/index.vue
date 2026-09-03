<template>
  <div class="control-screen">
    <Header @org-change="orgChange" @time-change="timeChange" @init="init" />
    <section class="main">
      <!-- 左侧 -->
      <aside class="side-box-left">
        <WeatherControl ref="weatherControlRef" />
        <ProjectProgress ref="projectProgressRef" />
        <Alarm ref="alarmRef" />
      </aside>
      <!-- 中间部分 -->
      <article class="center-box">
        <CenterBoard ref="centerBoardRef"/>
      </article>
      <!-- 右侧 -->
      <aside class="side-box-right">
        <Weather />
        <Notice ref="noticeRef" />
        <Statistic ref="statisticRef" />
        <Top ref="topRef" @init="topInit" />
      </aside>
    </section>
    <div class="home-bottom"></div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  // import { useMessage } from '/@/hooks/web/useMessage';
  // const { createConfirm } = useMessage();
  import Header from './components/Header.vue';
  import WeatherControl from './components/WeatherControl.vue';
  import ProjectProgress from './components/ProjectProgress.vue';
  import Alarm from './components/Alarm.vue';
  import CenterBoard from './components/CenterBoard.vue';
  import Notice from './components/Notice.vue';
  import Statistic from './components/Statistic.vue';
  import Top from './components/Top.vue';
  import Weather from './components/Weather.vue';

  const queryParams: any = ref({});
  const noticeRef = ref();
  const weatherControlRef = ref();
  const projectProgressRef = ref();
  const alarmRef = ref();
  const topRef = ref();
  const statisticRef = ref();
  const centerBoardRef = ref();
  function orgChange(val: any) {
    queryParams.value = val;
    nextTick(() => {
      centerBoardRef.value.init(val);
      noticeRef.value.getNoticeList(val);
      weatherControlRef.value.getWeatherList(val);
      projectProgressRef.value.getProgressList(val);
      alarmRef.value.getAlarm(val);
      topRef.value.reloadList(val);
      statisticRef.value.init(val);
    });
  }
  function timeChange(val: any) {
    queryParams.value = val;
    nextTick(() => {
      noticeRef.value.getNoticeList(val);
      statisticRef.value.init(val);
    });
  }
  function init(val: any) {
    queryParams.value = val;
    nextTick(() => {
      centerBoardRef.value.init(val);
      noticeRef.value.getNoticeList(val);
      weatherControlRef.value.getWeatherList(val);
      projectProgressRef.value.getProgressList(val);
      alarmRef.value.getAlarm(val);
      topRef.value.reloadList(val);
      statisticRef.value.init(val);
    });
  }

  function topInit() {
    topRef.value.reloadList(queryParams.value);
  }
</script>
<style scoped lang="less">
  .control-screen {
    height: 1080px;
    overflow-x: auto;
    overflow-y: hidden;
    background-color: #020b21;
    color: #fff;
    .main {
      width: 1896px;
      height: 967px;
      display: flex;
      .side-box-left {
        width: 405px;
        padding-left: 16px;
      }

      .center-box {
        width: 1093px;
      }
      .side-box-right {
        width: 400px;
        margin-right: 6px;
        margin-left: 13px;
      }
    }
    .home-bottom {
      height: 33px;
      width: 100%;
      background: url('/@/assets/images/controlScreen/home_bottom_bg.png') no-repeat;
    }
  }
</style>
