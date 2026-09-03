<template>
  <div class="study">
    <div class="video-box" v-show="route.query.type == 2">
      <player
        v-if="['2'].includes(currentClass.type)"
        :height="198"
        ref="playerRef"
        @ended="playEnd(2)"
        :id="'player128'"
        deviceType="h5"
        :draggable="forbidFastForward"
        :url="currentClass.resourceUrl"
        :currentTime="currentClass.studyDuration"
      />

      <div class="docplay" v-if="['3'].includes(currentClass.type)">
        <span>{{ currentClass.name }}</span>
        <PlayCircleOutlined style="font-size: 28px; color: #1890ff; margin-left: 5px; margin-top: 3px" @click="studyDoc" />
      </div>
    </div>
    <div class="item" v-show="route.query.type == 2">
      <div class="top">
        <div>
          <van-icon v-if="currentClass.type == 2" size="18px" color="#1890ff" name="video" />
          <van-icon v-if="currentClass.type == 3" size="18px" color="#1890ff" name="description" />
          <span>{{ { 2: '视频', 3: '文档' }[currentClass.type] }}</span>
        </div>
        <div class="right">
          <span style="font-size: 12px" v-if="currentClass.studyDuration && currentClass.studyDuration > 0">{{ currentClass.name }}</span>
          <img v-if="detailInfo.lock" src="../../../../../../assets/images/app/lock.png" alt="" />
        </div>
      </div>
      <div class="title"
        >{{ currentClass.name }}<template v-if="currentClass.duration">({{ computeTime(currentClass.duration) }})</template></div
      >
    </div>
    <div class="preview-box" v-show="route.query.type == 3">
      <div class="hd">
        <van-icon @click="afterDocStudy" style="font-size: 28px" name="arrow-left" />
        <div class="doc-timer" v-if="currentClass.type == 3">
          <div class="name">{{ currentClass.name }}</div>
        </div>
      </div>

      <iframe
        ref="iframeRef"
        v-show="docShow"
        :src="previewUrl"
        frameborder="0"
        style="width: 100vw; height: 100vh; position: absolute; z-index: 999"
      ></iframe>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import player from '/@/views/studyTraining/resourceManage/video/playedu-player/index.vue';
  import { getVideo, addDuration } from '/@/views/education/student/selfStudy/url/index';
  import { useRoute, onBeforeRouteLeave, useRouter } from 'vue-router';
  import { PlayCircleOutlined } from '@ant-design/icons-vue';
  import { previewFile } from '/@/api/common/api';
  import { ref, nextTick, onMounted, onUnmounted } from 'vue';

  const route = useRoute();
  const router = useRouter();
  const playerRef = ref<any>(null);
  const detailInfo = ref<any>({ courseList: [] });
  const previewUrl = ref<string>('');
  const docShow = ref<boolean>(false);
  const iframeRef = ref<any>(null);
  const currentClass = ref<any>({});
  // 能否快进
  const forbidFastForward = ref<boolean>(false);
  const studyTime = ref<number>(0);
  const timeStep = ref<number>(0);

  pageInit();
  function pageInit() {
    getDetail();
  }
  function getDetail() {
    currentClass.value = route.query;
    getVideo(route.query.id).then((res) => {
      if (route.query.type == '2') {
        if (route.query.st) {
          currentClass.value.studyDuration = Number(route.query?.st || 0) * 1;
          setTimeout(() => {
            forbidFastForward.value = Number(route.query?.st || 0) <= Number(route.query?.s || 0);
          }, 2000);
        }
      }
      currentClass.value.resourceUrl = res[0];
      if (route.query.type == '3') {
        docShow.value = true;
        docStart();
      }
    });
  }
  const timer = ref<any>(null);
  onMounted(() => {
    document.addEventListener('visibilitychange', changeScreen);
  });
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', changeScreen);
  });
  
  function docStart() {
    previewFile(currentClass.value.resourceUrl).then((res) => {
      previewUrl.value = res;
      nextTick(() => {
        studyTime.value = new Date().getTime();
        if (iframeRef.value) {
          iframeRef.value.onload = function () {
            var doc = iframeRef.value.contentWindow || iframeRef.value.contentDocument;
          };
        }
        if (timer.value) {
          clearInterval(timer.value);
        }
        timer.value = setInterval(() => {
          timeStep.value = new Date().getTime();
        }, 1000);
      });
    });
  }

  // 总学习时长
  const playEnd = async (type) => {
    let time = 0;
    time = playerRef.value.currentTime();
    await setStudyTime(time);
    getDetail();
  };

  const studyDoc = () => {
    docShow.value = true;
  };

  async function changeScreen() {
    if (document.visibilityState === 'hidden') {
      let time = computedStudyTime();
      studyTime.value = 0;
      await setStudyTime(time);
      if(currentClass.value.type == 2) {
        playerRef.value.pause();
      }
      // router.back();
    } else {
      studyTime.value = new Date().getTime();
    }
  }

  const computedStudyTime = () => {
    if (currentClass.value.type == 2) {
      return playerRef.value.currentTime();
    } else {
      if (studyTime.value == 0 || !studyTime.value) return 0;
      return (new Date().getTime() - Number(studyTime.value)) / 1000;
    }
  };

  const afterDocStudy = async () => {
    docShow.value = false;
    const time = computedStudyTime();
    studyTime.value = 0;
    await setStudyTime(time);
    router.back();
  };

  onBeforeRouteLeave((to, from) => {
    if (from.name == 'AppStudentsSelfStudying') {
      // 观看视频时长
      let time = computedStudyTime();
      studyTime.value = 0;
      setStudyTime(time);
    }
  });
  // time: 播放时长
  const setStudyTime = (time) => {
    if(time == 0) return;
    const params = {
      type: currentClass.value.type,
      resourceId: currentClass.value.id,
      duration: time,
    };
    const errorSubmit = sessionStorage.getItem('errorSubmit');
    if (errorSubmit) {
      const errorJson = JSON.parse(errorSubmit);
      if (errorJson.resourceId == params.resourceId) {
        params.duration += errorJson.duration;
        sessionStorage.removeItem('errorSubmit');
      }
    }
    return addDuration(params).catch(() => {
      if (time > 0) {
        sessionStorage.setItem('errorSubmit', JSON.stringify(params));
      }
      setTimeout(() => {
        studyTime.value = 0;
      });
      return Promise.resolve(true);
    });
  };

  const computeTime = (time: number) => {
    if (!time) return '';
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };

  defineExpose({
    pageInit,
  });
</script>
<style lang="less" scope>
  .study {
    width: 100%;
    height: 100%;
    .video-box {
      width: 100%;
      height: 198px;
      display: flex;
      align-items: center;
      justify-content: center;
      .audioplay {
        width: 100%;
      }
      .docplay {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        span {
          margin-bottom: 10px;
        }
      }
    }
    .preview-box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
      .hd {
        height: 58px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        justify-content: space-between;
        box-shadow: 0px 0px 5px #999;
        position: relative;
        z-index: 2000;
      }
      .doc-timer {
        width: 90%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .name {
          font-size: 16px;
          font-weight: 600;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 90%;
        }
        i {
          font-style: normal;
          font-weight: 600;
        }
        .label {
          color: #666;
        }
      }
      iframe {
        width: 100%;
        height: 100%;
        body {
          width: 100%;
          height: 100%;
        }
        .container {
          width: 100%;
          height: 100%;
        }
      }
    }
    .item {
      width: 100%;
      height: auto;
      background: #fafafa;
      border-radius: 7px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 16px;
      margin-top: 10px;
      .top {
        width: 100%;
        height: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        span {
          margin-left: 5px;
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 16px;
        }
        .right {
          display: flex;
          align-items: center;
        }
        div {
          display: flex;
          align-items: center;
        }
      }
      .title {
        width: 100%;
        height: auto;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 20px;
        margin-top: 15px;
        text-align: left;
        word-break: break-all;
      }
    }
    .n {
      font-size: 12px;
      color: #ffffff;
      background-color: #b6b6b6;
      padding: 0px 6px;
      border-radius: 4px;
    }
    .y {
      color: #52c41a;
      background-color: rgba(82, 196, 26, 0.1);
      padding: 0px 6px;
      border-radius: 4px;
    }
  }
</style>
