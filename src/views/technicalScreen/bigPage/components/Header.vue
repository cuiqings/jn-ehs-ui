<template>
  <header class="header">
    <img class="logo" src="/resource/img/logo-screen.png" width="131.78" height="40" />
    <img class="name" src="/resource/img/name.png" width="437.15" height="32.61" />
  <span class="time">{{ timeNow }}</span>
    <img
      v-if="!isFull"
      class="screen"
      src="../../../../assets/images/controlScreen/screen_full.png"
      width="23"
      height="23"
      style="cursor: pointer"
      @click="full()"
    />
    <img
      v-else
      class="screen"
      src="../../../../assets/images/controlScreen/screen_exit.png"
      width="23"
      height="23"
      style="cursor: pointer"
      @click="unFull()"
    />
    <img v-if="!isFull" class="screen1" src="/@/assets/images/back.png" width="23" height="23" style="cursor: pointer" @click="router.go(-1)" />
  </header>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import dayjs from 'dayjs';
  import { useRouter } from 'vue-router';
  const emit = defineEmits(['orgChange', 'timeChange', 'init']);
  const router = useRouter();
  const queryParams: any = ref({});
  let isFull = ref(false);
  const time: any = ref([]);
  const timeNow = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')

  init();

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    emit('orgChange', queryParams.value);
  };
  function onChangeTime(date, dateString) {
    console.log(date, dateString);
    queryParams.value.startTime = dateString[0];
    queryParams.value.endTime = dateString[1];
    emit('timeChange', queryParams.value);
  }
  function init() {
    const endTime = dayjs(new Date()).format('YYYY-MM-DD');
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 6);
    const startTime = dayjs(currentDate).format('YYYY-MM-DD');
    queryParams.value.startTime = startTime;
    queryParams.value.endTime = endTime;
    time.value = [startTime, endTime];
    window.onresize = () => {
      const document: any = window.document;
      if (!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.webkitFullScreen || document.msFullScreen)) {
        // console.log(document.fullscreen);
        isFull.value = false;
      }
    };
  }
  onMounted(() => {
    emit('init', queryParams.value);
  });
  // 全屏
  function full() {
    const element: any = document.body;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    isFull.value = true;
  }
  // 取消全屏
  function unFull() {
    const document: any = window.document;
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    isFull.value = false;
  }
</script>

<style scoped lang="less">
  .header {
    width: 1896px;
    position: relative;
    background: url('../../../../assets/images/controlScreen/headbg.png') no-repeat left;
    height: 80px;
    background-size: 1920px auto;
    display: flex;
    .logo {
      position: absolute;
      top: 13px;
      bottom: 28px;
      left: 20px;
      z-index: 1;
    }
    .name {
      position: absolute;
      top: 14px;
      bottom: 34px;
      left: 741px;
      right: 742px;
    }
    .time{
      position: absolute;
      right: 70px;
      top: 28px;
      line-height: 23px;
    }
    .select-project {
      position: absolute;
      width: 140px;
      right: 260px;
      top: 24px;
      background-color: rgba(101, 100, 100, 0);
      /deep/ .ant-select-selector {
        background-color: rgba(101, 100, 100, 0);
        border: 0;
        border-radius: 0;
        padding-right: 30px;
        box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
      }
      /* 选择其中的字体 */
      /deep/ .ant-select-selection-item {
        color: white;
        padding-right: 0px;
        font-size: 16px;
        margin-right: 31px;
        text-align: center;
      }
      /deep/ .ant-select-selection-item:hover {
        color: RGBA(185, 223, 252, 1);
      }
      /deep/ .ant-select-arrow {
        color: white;
        top: 62%;
        font-size: 10px;
        left: 87px;
      }
    }
    /* 日期选择器及其样式更改 */
    .select-date {
      position: absolute;
      right: 60px;
      top: 28px;
      background-color: rgba(101, 100, 100, 0);
    }
    /* 日期选择器样式 */
    /deep/ .ant-picker {
      background: rgba(100, 100, 100, 0);
      border: 0;
    }
    /deep/.ant-picker-focused {
      box-shadow: 0 0 0 0px rgba(24, 144, 255, 0);
      color: white;
    }

    /deep/.ant-picker-separator {
      color: white;
    }
    /deep/ .ant-picker-input > input {
      color: white;
    }
    /* 选中下划线 */
    /deep/ .ant-picker-active-bar {
      background: rgba(100, 100, 100, 0);
    }
    /deep/ .ant-picker-clear {
      right: -1px;
    }
    /deep/ .ant-picker-suffix {
      width: 0px;
    }

    .screen {
      position: absolute;
      left: 1845px;
      top: 28px;
      vertical-align: sub;
      margin-right: 36px;
      cursor: pointer;
    }
    .screen1 {
      position: absolute;
      left: 1880px;
      top: 28px;
      vertical-align: sub;
      cursor: pointer;
    }
  }
</style>
