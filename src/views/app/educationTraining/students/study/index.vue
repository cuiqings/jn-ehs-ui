<template>
  <div class="study" v-watermark>
    <div class="video-box">
      <player v-if="['1'].includes(currentClass.type)" :height="198" ref="playerRef" @ended="playEnd(1)"
        @start="playStart(1)" @pause="playPause(1)" @timeupdate="timeupdate" :id="'player' + 12" deviceType="h5"
        :draggable="forbidFastForward" :url="currentClass.resourceUrl" :currentTime="studyDuration" />

      <div class="docplay" v-if="['2'].includes(currentClass.type)">
        <span>{{ currentClass.name }}</span>
        <PlayCircleOutlined style="font-size: 28px; color: #1890ff; margin-left: 5px; margin-top: 3px"
          @click="studyDoc" />
      </div>
    </div>
    <div class="item">
      <div class="top">
        <div>
          <van-icon v-if="currentClass.type == 1" size="18px" color="#1890ff" name="video" />
          <van-icon v-if="currentClass.type == 2" size="18px" color="#1890ff" name="description" />
          <van-icon v-if="currentClass.type == 3" size="18px" color="#1890ff" name="audio" />
          <span>{{ { 1: '视频', 2: '文档', 3: '音频' }[currentClass.type] }}</span>
        </div>
        <div class="right">
          <span style="font-size: 12px" v-if="currentClass.studyDuration && currentClass.studyDuration > 0">已学习：{{
            computeTime(currentClass.studyDuration) }}</span>
          <span class="n" :class="{ y: currentClass.studyStatus === '0' }">{{ currentClass.studyStatus == '0' ? '已完成' :
            '未完成' }}</span>
          <img v-if="detailInfo.lock" src="../../../../../assets/images/app/lock.png" alt="" />
        </div>
      </div>
      <div class="title">{{ currentClass.name }}({{ computeTime(currentClass.duration) }})</div>
    </div>
    <div class="preview-box" v-show="docShow">
      <div class="hd">
        <div class="doc-timer" v-if="currentClass.type == 2">
          <div class="name">{{ currentClass.name }}</div>
          <div>
              <span class="label">已学习：</span><i>{{ computeTime(alreadyStudyTime) }}</i> <span
                class="label">应学习：</span>{{ computeTime(currentClass.duration) }}
          </div>
        </div>
        <van-icon @click="afterDocStudy" name="cross" />
      </div>

      <iframe ref="iframeRef" v-show="docShow" :src="previewUrl" frameborder="0" class="iframe-box"></iframe>
    </div>
  </div>
  <div class="keepon" v-show="keeponShow">
    <div class="tit">学习暂停中...</div>
    <van-button type="primary" @click="keeponClick">继续学习</van-button>
  </div>
  <van-dialog v-model:show="answerModalShow" :maskClosable="false" :closable="false" title="视频练习" @confirm="handleOk"
    zIndex="2000">
    <div class="radio-wrap">
      <Radio :currentIdx="0" :currentQuestion="currentQuestion" />
    </div>
  </van-dialog>
</template>
<script lang="ts" setup>
import player from '../../../../studyTraining/resourceManage/video/playedu-player/index.vue';
import { getResourceUrl, addDuration } from '../../index.api';
import { PlayCircleOutlined } from '@ant-design/icons-vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { previewFile } from '/@/api/common/api';
import { ref, onMounted, onUnmounted } from 'vue';
import { showConfirmDialog } from 'vant';
import Radio from '../components/question/radio.vue';

onUnmounted(() => {
  document.removeEventListener('visibilitychange', changeScreen);
});
const keeponShow = ref(false);
const keeponClick = () => {
  keeponShow.value = false;
  studyDoc();
};
function changeScreen(str) {
  if (document.visibilityState === 'hidden') {
    if (docShow.value) {
      keeponShow.value = true;
    }
    if (currentClass.value.type == 1) {
      playerRef.value.pause();
    }
    autoFinish();
  }
}

// route.query.pageType == 9 教材会审不计学时
const route = useRoute();
const playerRef = ref<any>(null);
const detailInfo = ref<any>({ courseList: [] });
const previewUrl = ref<string>('');
const docShow = ref<boolean>(false);
const iframeRef = ref<any>(null);
const currentType = ref<number>(1);
const currentClass = ref<any>({});
// 能否快进
const forbidFastForward = ref<boolean>(false);
// 随机暂停
const randomStop = ref<boolean>(false);
// 视频中答题
const videoAnswer = ref<boolean>(false);
const timeList = ref<any>({});
const SECTION_NUM = 30 * 60;

const answerModalShow = ref<boolean>(false);
const currentQuestion = ref<any>({});

// 文档习时长计时器
const alreadyStudyTime = ref(0);

pageInit();
function pageInit() {
  getDetail();
}
const currentClassCopy = ref<any>({});
const studyDuration = ref<number>(0);
function getDetail() {
  // if (route.query.selfStudy) {
  //   currentClass.value.type = route.query.type;
  //   getVideo(route.query.id).then((res) => {
  //     currentClass.value.resourceUrl = res[0];
  //     if (route.query.type == '3') {
  //       studyTime.value = new Date().getTime();
  //       docStart(res[0]);
  //     }
  //   });
  //   return;
  // }
  let params: any = {
    taskId: route.query.id,
    contentId: route.query.contentId,
    resourceId: route.query.resourceId,
  };
  // 防止评审添加学习记录
  if (route.query.pageType == '9') {
    params.type = '1';
  }
  getResourceUrl(params).then((res) => {
    detailInfo.value = res;
    forbidFastForward.value = res.forbidFastForward === '0';
    randomStop.value = res.randomStop === '1';
    videoAnswer.value = res.videoAnswer === '0'; // 视频中答题
    detailInfo.value.courseList = [res.courseList[route.query.cidx as string]];
    currentType.value = res.courseList[0].type;
    currentClass.value = res.courseList[0];
    if (currentType.value == 1) {
      if (currentClass.value.studyDuration >= currentClass.value.duration) {
        studyDuration.value = 0;
        forbidFastForward.value = false; // 如果已经学完，则可以快进
      } else {
        studyDuration.value = currentClass.value.studyDuration;
      }
      if (currentClass.value.questionList && currentClass.value.questionList.length > 0) {
        currentClass.value.questionList.forEach((item: any) => {
          item.videoTime = item.videoTime
            .split(':')
            .map(Number)
            .reduce((acc, curr, index) => acc + curr * (index === 0 ? 3600 : index === 1 ? 60 : 1), 0);
        });
        currentClass.value.questionList.sort((a: any, b: any) => a.videoTime - b.videoTime);
      }
      if (randomStop.value) {
        const times = generateRandomNumbers(currentClass.value.duration);
        // 循环生成暂停列表
        for (let i = 0; i < times.length; i++) {
          timeList.value[times[i]] = true;
        }
        console.log(timeList.value);
      }
    }
    if (currentType.value == 2) {
      previewFile(currentClass.value.resourceUrl).then((res) => {
        previewUrl.value = res;
      });
      alreadyStudyTime.value = currentClass.value.studyDuration || 0;
    }
    currentClassCopy.value = JSON.parse(JSON.stringify(currentClass.value));
  });
}
// 随机暂停时间
function generateRandomNumbers(duration) {
  const numbers = [];
  const segments = duration <= SECTION_NUM ? 1 : Math.ceil(duration / SECTION_NUM); // 划分区间
  const segmentLength = Math.floor((duration * 0.8) / segments); // 每个区间长度

  // 生成6个区间的随机起始点
  const segmentOffsets = Array.from({ length: segments }, () => Math.floor(Math.random() * segmentLength));
  // 从每个区间中选择一个数
  for (let i = 0; i < segments; i++) {
    // 计算当前区间的起始值
    const start = i * segmentLength;
    // 生成区间内的随机数
    const randomNum = start + segmentOffsets[i];
    numbers.push(randomNum);
  }
  return numbers.sort(() => 0.5 - Math.random()).slice(0, segments);
}
// 文档学习计时器
const alreadyStudyTimer = ref<any>(null);
function alreadyStudyTimerInterval() {
  if (alreadyStudyTimer.value) return;
  alreadyStudyTimer.value = setInterval(() => {
    alreadyStudyTime.value += 1;
    checkStudyTime();
  }, 1000);
}
const clearAlreadyStudyTimer = () => {
  if (alreadyStudyTimer.value) clearInterval(alreadyStudyTimer.value);
  alreadyStudyTimer.value = null;
};

const studyTime = ref(0);
const playStart = (type) => {
  sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
  document.addEventListener('visibilitychange', changeScreen);
};
const playPause = (type) => {
  studyTime.value = computedStudyTime();
  autoFinish();
  sessionStorage.setItem('startStudyTime', '0');
  document.removeEventListener('visibilitychange', changeScreen);
};
const playEnd = async (type) => {
  let time = 0;
  studyTime.value = computedStudyTime();
  if (type == 1) {
    time = playerRef.value.currentTime();
  }
  await setStudyTime(time, studyTime.value);
  getDetail();
  sessionStorage.setItem('startStudyTime', '0');
  document.removeEventListener('visibilitychange', changeScreen);
};

const questionIndex = ref<number>(0);
// 播放进度
const timeupdate = (time) => {
  if (currentClass.value.questionList && currentClass.value.questionList.length > 0 && videoAnswer.value) {
    currentClass.value.questionList.forEach((item: any, index: number) => {
      if (item.videoTime == time && !item.studyStatus) {
        playerRef.value.pause();
        questionIndex.value = index;
        item.userQuestionInfoList = item.questionList;
        currentQuestion.value = item;
        answerModalShow.value = true;
      }
    });
  }
  
  if (randomStop.value && timeList.value[time] && (!route.query.pageType || route.query.pageType != '9')) {
    playerRef.value.pause();
    timeList.value[time] = false;
    randomStopFn();
  }
};
const handleOk = () => {
  if (currentQuestion.value.answer == currentQuestion.value.userAnswer) {
    answerModalShow.value = false;
    currentClass.value.questionList[questionIndex.value].studyStatus = '1';
    playerRef.value.play();
    currentQuestion.value.userAnswer = null;
  } else {
    showConfirmDialog({
      message: '很遗憾您的回答有误，请重新学习！',
      showCancelButton: false,
    }).then(() => {
      if (questionIndex.value == 0) {
        playerRef.value.seek(0);
      } else {
        let videoTime = currentClassCopy.value.questionList[questionIndex.value - 1].videoTime;
        playerRef.value.seek(videoTime);
      }
      answerModalShow.value = false;
      playerRef.value.play();
      currentQuestion.value.userAnswer = null;
    });
  }
};

const studyDoc = () => {
  docShow.value = true;
  sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
  alreadyStudyTimerInterval();
  document.addEventListener('visibilitychange', changeScreen);
};

// 每5分钟检查一次学习时间并提交，以防丢失学习时间
const checkStudyTime = () => {
  const timer = sessionStorage.getItem('startStudyTime');
  // 会审页面不需要检查学习时间
  if (route.query.pageType == '9') return;
  let time = 0;
  if (timer) {
    time = computedStudyTime(); // (new Date().getTime() - Number(sessionStorage.getItem('startStudyTime'))) / 1000;
    if (time >= 300) {
      // 获取累计提交失败的学习时长
      let errornet = sessionStorage.getItem('studyTime-errornet');
      sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
      if (errornet !== 'null') {
        time = time + Number(errornet);
      }
      addDuration({
        userTaskRecordId: detailInfo.value.userTrainRecordId,
        resourceId: currentClass.value.id,
        contentId: route.query.contentId,
        duration: 0,
        studyTime: parseInt(time),
      })
        .then((_) => {
          // 提交成功，清除报错学习时间缓存
          sessionStorage.setItem('studyTime-errornet', 'null');
        })
        .catch(() => {
          // 提交报错，保存学习时间
          sessionStorage.setItem('studyTime-errornet', parseInt(time).toString());
        });
    }
  }
};

const computedStudyTime = () => {
  if (!sessionStorage.getItem('startStudyTime') || Number(sessionStorage.getItem('startStudyTime')) == 0) {
    if (currentClass.value.type == 1) {
      return 0;
    }
    return !alreadyStudyTime.value || alreadyStudyTime.value <= 0 || alreadyStudyTime.value - currentClass.value.studyDuration < 0 ? 0 : alreadyStudyTime.value - currentClass.value.studyDuration;
  }
  return new Date().getTime() - Number(sessionStorage.getItem('startStudyTime')) < 0 ? 0 : (new Date().getTime() - Number(sessionStorage.getItem('startStudyTime'))) / 1000;
};
// 关闭文档学习
const afterDocStudy = async () => {
  docShow.value = false;
  studyTime.value = computedStudyTime();
  await setStudyTime(0, studyTime.value);
  getDetail();
  sessionStorage.setItem('startStudyTime', '0');
  document.removeEventListener('visibilitychange', changeScreen);
};

onBeforeRouteLeave((to, from) => {
  if (from.name == 'AppStudentStudy') {
    autoFinish();
  }
  document.removeEventListener('visibilitychange', changeScreen);
});
// 自动提交学习时长
function autoFinish() {
  if (alreadyStudyTimer.value) clearAlreadyStudyTimer();
  // 观看视频时长
  let time = 0;
  if (currentClass.value.type == 1) {
    if (playerRef.value) {
      time = parseInt(playerRef.value.currentTime());
    }
  }
  studyTime.value = computedStudyTime();

  if (time == 0 && currentClass.value.type == 1) return;

  if (studyTime.value <= 0 && currentClass.value.type == 2) return;

  if (!currentClass.value.id) return;
  if (route.query.pageType == '9') return;
  addDuration({
    userTaskRecordId: detailInfo.value.userTrainRecordId,
    resourceId: currentClass.value.id,
    contentId: route.query.contentId,
    duration: time,
    studyTime: parseInt(studyTime.value),
  })
    .finally(() => {
      studyTime.value = 0;
    })
  sessionStorage.setItem('startStudyTime', '0');
}
// time: 播放时长 studyTime: 学习时长
const setStudyTime = (time, sTime) => {
  if (alreadyStudyTimer.value) clearAlreadyStudyTimer();
  // 教材会审 不用添加学习时长
  if (route.query.pageType == '9') return;
  
  return addDuration({
    userTaskRecordId: detailInfo.value.userTrainRecordId,
    resourceId: currentClass.value.id,
    contentId: route.query.contentId,
    duration: time,
    studyTime: parseInt(sTime),
  }).finally(() => {
    studyTime.value = 0;
    return Promise.resolve(true);
  });
};

// 随机暂停逻辑
const randomStopFn = () => {
  showConfirmDialog({
    message: '当前为随机暂停，确认后点击开始继续学习！',
    showCancelButton: false,
  }).then(() => {
    playerRef.value.play();
  });
};

const computeTime = (time: number) => {
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

    // iframe {
    //   width: 100%;
    //   height: 100%;
    //   body {
    //     width: 100%;
    //     height: 100%;
    //   }
    //   .container {
    //     width: 100%;
    //     height: 100%;
    //   }
    // }
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
<style lang="less">
.question-box {
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding: 0px 0px 79px 0px;
}

.paper-footer {
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 57px;
  background-color: #fff;
  box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.04);
  z-index: 20;
  box-sizing: border-box;
  padding: 0 40px;

  .paper-bar {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-top: 8px;

    span {
      font-size: 10px;
      font-weight: 400;
      color: #4d4d4f;
      line-height: 10px;
      margin-top: 3px;
    }
  }

  .act-paper-bar {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-top: -15px;
    z-index: 25;
    text-align: center;

    .back {
      width: 46px;
      height: 46px;
      background: #1890ff;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    span {
      font-size: 10px;
      font-weight: 400;
      color: #4d4d4f;
      line-height: 10px;
      margin-top: 6px;
    }
  }
}

.paper-footer::before {
  content: '';
  position: absolute;
  top: -22px;
  height: 66px;
  left: calc(50% - 33px);
  right: calc(50% - 33px);
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.04);
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.question-title {
  width: 100%;
  height: auto;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  line-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;

  .level {
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 24px;
  }

  .exam-diffiCulty {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}

.question-option {
  width: 100%;
  height: auto;
  margin-top: 34px;
  box-sizing: border-box;
  padding: 0 20px;

  .question-option-text {
    width: 100%;
    height: auto;
    font-size: 16px;
    font-weight: 400;
    color: #333333;
    line-height: 24px;
    position: relative;

    .adm-checkbox-icon {
      border-radius: 4px;
    }
  }

  .question-option-extra-box {
    width: 100%;
    height: auto;
    display: grid;
    row-gap: 10px;
    column-gap: 20px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 10px;

    .question-option-extra-item {
      display: block;
      width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100px;
        height: 100px;
        border-radius: 8px;
      }
    }
  }
}

.question-text {
  width: 100%;
  height: auto;
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  line-height: 30px;
  box-sizing: border-box;
  padding: 0 20px;
}

.question-extra-box {
  width: 100%;
  height: auto;
  display: grid;
  row-gap: 10px;
  column-gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 10px;
  box-sizing: border-box;
  padding: 0 20px;

  .question-extra-item {
    position: relative;
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 8px;

    img {
      width: 100px;
      height: 100px;
      border-radius: 8px;
    }

    .delIcon {
      position: absolute;
      right: -10px;
      top: -10px;
      border-radius: 50%;
      width: 20px;
      height: 20px;

      img {
        border-radius: 50%;
        width: 20px;
        height: 20px;
      }
    }
  }
}

.question-input {
  width: 100%;
  height: auto;
  margin-top: 30px;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  box-sizing: border-box;
  padding: 0 20px;

  .question-extra-box {
    padding: 0;
  }
}

.question-tabs {
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding-bottom: 10px;
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.05);

  .adm-tabs-tab-wrapper {
    padding: 0px 18px !important;
  }
}

.question-analysis {
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding: 30px 20px 0 20px;

  .analysis-box {
    width: 100%;
    height: auto;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    padding: 30px 0px;

    .result {
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }

    .answer {
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      color: #333333;
      line-height: 24px;
      margin-top: 30px;

      .input-answer {
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 24px;
      }
    }

    .remark-tit {
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      color: #333333;
      line-height: 24px;
      margin-top: 30px;
    }
  }
}

.remark-text {
  width: 100%;
  height: auto;
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.88);
  line-height: 24px;
  margin-top: 10px;
}

.remark-extra-box {
  width: 100%;
  height: auto;
  display: grid;
  row-gap: 10px;
  column-gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 10px;

  .remark-extra-item {
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100px;
      height: 100px;
      border-radius: 8px;
    }
  }
}

.question-box {
  width: 100%;
  height: auto;
  position: relative;
  text-align: left;

  .time-down {
    position: absolute;
    height: 16px;
    font-size: 14px;
    font-weight: 400;
    color: #999999;
    line-height: 16px;
    right: 20px;
    top: 19px;
    display: flex;
    align-items: center;

    img {
      width: 15px;
      height: 16px;
      margin-right: 5px;
    }
  }
}

.analysis {
  width: 100%;
  height: auto;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  padding: 30px 16px;
  margin-top: 26px;

  .result {
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    padding: 0;
  }

  .answer {
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    line-height: 24px;
    margin-top: 30px;
  }

  .remark-tit {
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    line-height: 24px;
    margin-top: 30px;
  }

  .c-red {
    color: #1890ff;
  }
}

.radio-wrap {
  padding-bottom: 18px;
}

.iframe-box {
  width: 100vw;
  height: calc(100% - 60px);
  position: absolute;
  z-index: 999;
}

.keepon {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3000;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .tit {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 30px;
  }
}
</style>
