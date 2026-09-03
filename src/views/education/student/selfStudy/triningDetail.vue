<template>
  <BasicDrawer width="50%" :title="detailInfo.taskName" v-bind="$attrs" @register="register" @close="onClose">
    <div class="trining-detail" v-loading="loading">
      <a-row :span="24" :gutter="[20, 10]" style="background-color: #ffffff; margin: 0px 0; padding: 10px">
        <a-col :span="24">
          <a-card class="fixed-height-card">
            <div class="cardbody">
              <div class="top">
                <div class="name">
                  {{ detailInfo.taskName }}
                  <span class="tag" :class="{ ing: detailInfo.status == '进行中' }">{{ detailInfo.status }}</span>
                </div>
                任务周期：{{ detailInfo.taskStrTime }} ~ {{ detailInfo.taskEndTime }}
              </div>
              <div class="gress">
                <a-progress type="circle" :percent="detailInfo.finishRate">
                  <template #format>
                    <span>{{ detailInfo.finishRate }}%</span>
                    <div style="color: #a5a5a5; font-size: 14px; padding-top: 10px">总进度</div>
                  </template>
                </a-progress>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="24" v-for="item in detailInfo.contentList" :key="item.id">
          <div class="stageName">
            <div>
              {{ item.stageName }}
              <span class="type">{{ { 1: '线上', 2: '线下' }[item.trainType] }}培训</span>
            </div>
            <span class="hold" v-if="holdState(item)">待确认</span>
          </div>

          <div class="item" v-for="(citem, cidx) in item.courseList" :key="citem.id" @click="startStudy(item.id, citem.id, cidx, item)">
            <div class="top">
              <div>
                <van-icon v-if="citem.type == 1" size="18px" color="#1890ff" name="video" />
                <van-icon v-if="citem.type == 2" size="18px" color="#1890ff" name="description" />
                <van-icon v-if="citem.type == 3" size="18px" color="#1890ff" name="audio" />
                <span>{{ { 1: '视频', 2: '文档', 3: '音频' }[citem.type] }}</span>
              </div>
              <div class="right">
                <img v-if="item.lock" src="../../../../assets/images/app/lock.png" alt="" />
                <div>
                  <span v-if="citem.studyDuration && citem.studyDuration > 0">已学习：{{ computeTime(citem.studyDuration) }}</span>
                  <span class="tag n" :class="{ ing: citem.studyStatus === '0' }">{{ citem.studyStatus == '0' ? '已完成' : '未完成' }}</span>
                </div>
              </div>
            </div>
            <div class="title">{{ citem.name }}({{ computeTime(citem.duration) }})</div>
          </div>

          <div class="item" @click="startExamFn(item)" v-if="item.exam">
            <div class="top">
              <div>
                <van-icon size="18px" color="#1890ff" name="description" />
                <span>考试</span>
              </div>
              <div class="right">
                <span v-if="item.passStatus">成绩：{{ item.examScore }}</span>
                <span v-if="item.passStatus" class="y" :class="{ np: item.passStatus === '不合格' }">{{ item.passStatus }}</span>
                <span class="hold" v-if="!item.userSign && item.passStatus == '合格' && item.trainPerson" @click.stop="holdSign(item)">
                  <a-button type="primary">{{item.examScore == item.exam.score ? '待签字' : '错题订正'}}</a-button>
                </span>
                <span v-if="item.userSign && !item.trainerSign && item.trainPerson" style="color: #ee0a24;">待教育者签字</span>
                <img v-if="lockFn(item)" src="../../../../assets/images/app/lock.png" alt="" />
              </div>
            </div>
            <div class="title">{{ item.exam.examName }}({{ computeTime(item.exam.examTime * 60) }})</div>
          </div>
          <div class="owner">
            <span>实施单位：{{ item.enforceCode }}</span>
            <span>教育者：{{ item.trainPerson }}</span>
          </div>
        </a-col>
      </a-row>
    </div>
  </BasicDrawer>
  <div class="study" v-if="studyPageShow">
    <div class="tit">
      <div>
        <ArrowLeftOutlined @click="closeStudy" style="font-size: 30px; color: #ffffff" />
        <span class="name">{{ currentClass.name }}</span>
      </div>
      <div v-if="currentClass.type == 2">
        <span class="label">已学习：</span><i>{{ computeTime(alreadyStudyTime) }}</i> 
        <span class="label">应学习：</span>{{ computeTime(currentClass.duration) }}</div>
    </div>
    <div class="study-main">
      <player
        v-if="['1'].includes(currentClass.type)"
        height="100%"
        ref="playerRef"
        :currentTime="currentClass.studyDuration || 0"
        :url="currentClass.resourceUrl"
        :id="'player' + 12"
        @start="playStart"
        @pause="playPause"
        @ended="playEnd"
        :draggable="forbidFastForward"
      />

      <iframe v-if="['2'].includes(currentClass.type)" ref="iframeRef" :src="previewUrl" frameborder="0" style="width: 100%; height: 100%"></iframe>

      <!-- <div class="docplay" v-if="['2'].includes(currentClass.type)">
        <span>{{ currentClass.name }}</span>
        <PlayCircleOutlined style="font-size: 28px; color: #1890ff; margin-left: 5px; margin-top: 3px" @click="studyDoc" />
      </div> -->

      <div class="audioplay docplay" v-if="['3'].includes(currentClass.type)">
        <span>{{ currentClass.name }}</span>
        <audio ref="radioRef" controls :src="currentClass.downloadPath"></audio>
      </div>
    </div>
  </div>
  <StartExam @register="startExamRegister" />
  <SignModal @register="signRegister" @signOk="signOk" />
  <ErrorCheck @register="errorCheckRegister" @confirm="errorConfirm" />
</template>
<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import ErrorCheck from '../components/errorCheck.vue';
  import SignModal from '../components/signModel.vue';
  import StartExam from '../components/startExam.vue';
  import { useModal } from '/@/components/Modal';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { trainTaskInfo, getResourceUrl, addDuration, correctionMistakes, studentSign } from '/@/views/app/educationTraining/index.api';
  import { ArrowLeftOutlined } from '@ant-design/icons-vue';
  import player from '../../../studyTraining/resourceManage/video/playedu-player/index.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { previewFile } from '/@/api/common/api';

  // 错题订正弹窗
  const [errorCheckRegister, { openModal: openErrorCheckModal, closeModal: closeErrorCheckModal }] = useModal();
  // 签名弹窗
  const [signRegister, { openModal: openSignModal, closeModal }] = useModal();
  // 考试弹窗
  const [startExamRegister, { openModal }] = useModal();
  const loading = ref(false);
  const detailInfo = ref<any>({ contentList: [] });
  const previewUrl = ref<string>('');
  const docShow = ref<boolean>(false);
  const iframeRef = ref<any>(null);
  const currentType = ref<number>(1);
  const currentClass = ref<any>({});
  const playerRef = ref<any>(null);
  const taskInfo = ref<any>({});
  const [register, { closeDrawer }] = useDrawerInner((data) => {
    loading.value = true;
    taskInfo.value = data;
    pageInit(data.taskId);
  });

  // 能否快进
  const forbidFastForward = ref<boolean>(false);

  function pageInit(id) {
    trainTaskInfo({ id: id }).then((res) => {
      detailInfo.value = res;
      loading.value = false;
    });
  }

  const studyPageShow = ref(false);

  const taskDetailInfo = ref<any>({});
  const startStudy = (contentId, resourceId, cidx, item) => {
    if (item.lock || detailInfo.value.status == '未开始') return;
    loading.value = true;
    getResourceUrl({
      taskId: detailInfo.value.taskId,
      contentId: contentId,
      resourceId: resourceId,
    }).then((res) => {
      loading.value = false;
      studyPageShow.value = true;
      taskDetailInfo.value = res;
      forbidFastForward.value = res.forbidFastForward === '0';
      currentType.value = res.courseList[cidx as string].type;
      currentClass.value = res.courseList[(cidx as string) || 0];
      if (currentClass.value.studyDuration >= currentClass.value.duration) {
        currentClass.value.studyDuration = 0;
        forbidFastForward.value = false; // 如果已经学完，则可以快进
      }
      // setAppTitle(res.taskName);
      nextTick(() => {
        if (currentClass.value.type == 3) {
          initAudioEvent();
        }
      });
      if (currentType.value == 2) {
        previewFile(res.courseList[cidx as string].resourceUrl).then((res) => {
          previewUrl.value = res;
          nextTick(() => {
            if (iframeRef.value) {
              iframeRef.value.onload = function () {
                var doc = iframeRef.value.contentWindow || iframeRef.value.contentDocument;
                sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
                console.log(doc.window);
              };
            }
          });
        });
      }
      alreadyStudyTime.value = currentClass.value.studyDuration;
      alreadyStudyTimerInterval();
    });
  };

  const closeStudy = async () => {
    clearInterval(alreadyStudyTimer.value);
    alreadyStudyTime.value = 0;
    studyPageShow.value = false;
    // 观看视频时长
    let time = 0;
    if (currentClass.value.type == 1) {
      time = parseInt(playerRef.value.currentTime());
      // 学习时长
      if (sessionStorage.getItem('startStudyTime') && (Number(sessionStorage.getItem('startStudyTime')) as number) > 0) {
        studyTime.value = studyTime.value + computedStudyTime();
        console.log(studyTime.value);
      }
    } else if (currentClass.value.type == 2) {
      if (sessionStorage.getItem('startStudyTime') && Number(sessionStorage.getItem('startStudyTime')) > 0) {
        studyTime.value = studyTime.value + computedStudyTime();
      }
    } else {
      time = parseInt(radioRef.value.currentTime);
      // 学习时长
      if (sessionStorage.getItem('startStudyTime') && Number(sessionStorage.getItem('startStudyTime')) > 0) {
        studyTime.value = studyTime.value + computedStudyTime();
        console.log(studyTime.value);
      }
    }

    if (time == 0 && currentClass.value.type == 1) return;

    if (studyTime.value == 0 && currentClass.value.type == 2) return;

    if (time == 0 && currentClass.value.type == 3) return;

    await addDuration({
      userTaskRecordId: taskDetailInfo.value.userTrainRecordId,
      resourceId: currentClass.value.id,
      contentId: taskDetailInfo.value.id,
      duration: time,
      studyTime: parseInt(studyTime.value),
    }).catch(() => {
      pageInit(detailInfo.value.taskId);
      studyTime.value = 0;
      sessionStorage.setItem('startStudyTime', '0');
    });
    pageInit(detailInfo.value.taskId);
    sessionStorage.setItem('startStudyTime', '0');
  };

  const alreadyStudyTimer = ref<any>(null)
  function alreadyStudyTimerInterval () {
    if(alreadyStudyTimer.value) clearInterval(alreadyStudyTimer.value)
    alreadyStudyTimer.value = setInterval(() => {
      alreadyStudyTime.value += 1;
    }, 1000)
  }

  // 学习时长
  const studyTime = ref(0);
  // 总学习时长
  const alreadyStudyTime = ref(0);
  const playStart = () => {
    console.log('开始播放');

    sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
  };
  const playPause = () => {
    console.log('播放暂停', studyTime.value);

    studyTime.value = studyTime.value + computedStudyTime();
    sessionStorage.setItem('startStudyTime', '0');
    console.log(studyTime.value);
  };
  const playEnd = () => {
    console.log('播放结束');

    studyTime.value = studyTime.value + computedStudyTime();
    sessionStorage.setItem('startStudyTime', '0');
    console.log(studyTime.value);
  };

  const radioRef = ref<any>(null);

  const setTimeStart = () => {
    sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
  };
  const setPauseTime = () => {
    studyTime.value = studyTime.value + computedStudyTime();
  };

  const computedStudyTime = () => {
    if (Number(sessionStorage.getItem('startStudyTime')) == 0) return 0;
    return (new Date().getTime() - Number(sessionStorage.getItem('startStudyTime'))) / 1000;
  };

  function initAudioEvent() {
    radioRef.value.addEventListener('play', setTimeStart);
    radioRef.value.addEventListener('pause', setPauseTime);
  }

  const emit = defineEmits(['cancel']);
  const onClose = () => {
    emit('cancel');
    if (!radioRef.value) return;
    radioRef.value.removeEventListener('play', setTimeStart);
    radioRef.value.removeEventListener('pause', setPauseTime);
  };

  const currentContentId = ref('');
  const questionList = ref([]);
  const holdSign = (item) => {
    console.log('holdSign', item);
    if (item.examScore == item.exam.score) {
      openSignModal(true, {});
    } else {
      openErrorCheckModal(true, { ...item.exam, contentId: item.id, taskId: taskInfo.value.taskId, source: 0 });
    }

    // openSignModal(true, {})
    currentContentId.value = item.id;
    // correctionMistakes({ taskId: detailInfo.value.taskId, contentId: contentId }).then((res) => {
    //   questionList.value = res;
    // });
  };
  // 错题订正确认
  const errorConfirm = () => {
    closeErrorCheckModal();
    openSignModal(true, {});
  };
  const signOk = async (sign) => {
    console.log(sign);
    await studentSign({
      id: detailInfo.value.taskId,
      contentId: currentContentId.value,
      sign: sign,
    });
    pageInit(detailInfo.value.taskId);
    closeModal();
  };

  const studyDoc = () => {
    docShow.value = true;
    sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
  };

  const computeTime = (time: number) => {
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };

  const startExamFn = (item) => {
    if (lockFn(item)) return true;
    openModal(true, { ...item.exam, contentId: item.id, taskId: taskInfo.value.taskId, source: 0, taskStatus: taskInfo.value.status });
  };

  const lockFn = (item) => {
    if (item.lock) return true;
    if (!item.courseList || item.courseList.length == 0) return item.lock;
    let h = item.courseList.some((c) => {
      return item.trainType === '1' && c.studyStatus === null;
    });
    return h;
  };

  const holdState = (item) => {
    if (item.trainType == 1 && item.confirm && item.confirm === '1' && item.studyStatus === '0' && !item.userSign) return true;
    if (item.trainType == 2 && item.confirm && item.confirm === '1' && !item.userSign) return true;
    return false;
  };
</script>
<style lang="less" scoped>
  .trining-detail {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    .fixed-height-card {
      border-radius: 7px;
      box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
      .cardbody {
        display: flex;
        justify-content: space-between;
      }
      
      .top {
        font-size: 14px;
        color: #666666;
      }
      .name {
        font-size: 20px;
        font-weight: 600;
        margin: 10px 0;
        display: flex;
        align-items: center;
      }
    }
    .stageName {
      width: 100%;
      height: 38px;
      font-size: 18px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.88);
      line-height: 15px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .type {
        font-size: 14px;
        color: #666;
        margin: 0 15px;
      }
    }
    .hold {
      color: #ee0a24;
      cursor: pointer;
      font-size: 14px;
    }
    .owner {
      padding: 10px;
      display: flex;
      span {
        width: 50%;
      }
    }
    .item {
      width: 100%;
      height: auto;
      //   background: #fafafa;
      border-radius: 7px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 10px;
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
        .right {
          display: flex;
          align-items: center;
        }
        div {
          display: flex;
          align-items: center;
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 16px;
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
      }
    }
  }
  .tag {
    padding: 3px 10px;
    font-size: 14px;
    margin-left: 15px !important;
    font-weight: 400;
    border-radius: 4px;
    background-color: #efefef;
  }
  .ing {
    border: 1px solid #b7eb8f;
    background-color: #f6ffed;
    color: #389e0d;
  }
  .n{
    padding: 0 5px;
    font-size: 12px;
  }
  .np {
    color: #ee0a24;
    background-color: rgba(238, 10, 36, 0.1);
  }
  .study {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #0e0e1e;
    .tit {
      height: 65px;
      display: flex;
      align-items: center;
      background-color: #262634;
      color: #ffffff;
      padding: 0 16px;
      justify-content: space-between;
      .name {
        font-size: 18px;
        font-weight: 800;
        padding-left: 16px;
      }
      i{
        font-style: normal;
        font-weight: 600;
      }
      .label{
        padding-left: 16px;
        color: #c9c9c9;
      }
    }
    .study-main {
      flex: 1;
      overflow: hidden;
    }
  }
</style>
