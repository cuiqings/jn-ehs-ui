<template>
  <BasicDrawer width="50%" :title="detailInfo.taskName" v-bind="$attrs" @register="register" @close="onClose">
    <div class="trining-detail" v-loading="loading" v-watermark>
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
              <span style="font-size: 14px; color: #ee0a24; font-weight: 400"
                v-if="item.trainType == 2 && !item.trainerSign && item.trainPerson">待教育者签字</span>
            </div>
            <span class="hold" v-if="holdState(item)">待确认</span>
            <a-button v-if="item.trainType == 2 && item.trainerSign && item.userSign" @click="assessClick(item)"
              type="primary">评价</a-button>
          </div>

          <div class="item" v-for="(citem, cidx) in item.courseList" :key="citem.id"
            @click="startStudy(item.id, citem.id, cidx, item)">
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
                  <span v-if="citem.studyDuration && citem.studyDuration > 0">已学习：{{ computeTime(citem.studyDuration)
                    }}</span>
                  <span class="tag n" :class="{ ing: citem.studyStatus === '0' }">{{ citem.studyStatus == '0' ? '已完成' :
                    '未完成'
                    }}</span>
                </div>
              </div>
            </div>
            <div class="title">{{ citem.name }}({{ computeTime(citem.duration) }})</div>
          </div>
          <div class="item" @click="startExamFn(item, 1)" v-if="item.mockExam"
            :style="{ cursor: !lockFnmock(item) ? 'pointer' : 'not-allowed' }">
            <div class="top">
              <div>
                <van-icon size="18px" color="#1890ff" name="description" />
                <span>模拟考试</span>
              </div>
              <div class="right">
                <span v-if="item.mockExamPass" class="y" :class="{ np: !item.mockExamPass }">{{ item.mockExamPass ? '合格'
                  : '不合格'
                  }}</span>
                <img v-if="lockFnmock(item)" src="../../../../assets/images/app/lock.png" alt="" />
              </div>
            </div>
            <div class="title">{{ item.mockExam.examName }}({{ computeTime(item.mockExam.examTime * 60) }})</div>
          </div>
          <div class="item" @click="startExamFn(item)" v-if="item.exam"
            :style="{ cursor: !lockFn(item) ? 'pointer' : 'not-allowed' }">
            <div class="top">
              <div>
                <van-icon size="18px" color="#1890ff" name="description" />
                <span>考试</span>
              </div>
              <div class="right">
                <span v-if="item.passStatus">成绩：{{ item.examScore }}</span>
                <span v-if="item.passStatus" class="y" :class="{ np: item.passStatus === '不合格' }">{{ item.passStatus
                  }}</span>
                <span class="hold" v-if="!item.userSign && item.passStatus == '合格' && item.trainPerson"
                  @click.stop="holdSign(item)">
                  <a-button type="primary">{{ item.examScore == item.exam.score ? '待签字' : '错题订正' }}</a-button>
                </span>
                <span v-if="item.userSign && !item.trainerSign && item.trainPerson" style="color: #ee0a24">待教育者签字</span>
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
        <ArrowLeftOutlined @click="closeStudy(true)" style="font-size: 30px; color: #ffffff" />
        <span class="name">{{ currentClass.name }}</span>
      </div>
      <div v-if="currentClass.type == 2">
        <span class="label">已学习：</span><i>{{ computeTime(alreadyStudyTime) }}</i> <span class="label">应学习：</span>{{
          computeTime(currentClass.duration) }}
      </div>
    </div>
    <div class="study-main">
      <player v-if="['1'].includes(currentClass.type)" height="100%" ref="playerRef"
        :currentTime="currentClass.studyDuration || 0" :url="currentClass.resourceUrl" :id="'player' + 12"
        @start="playStart" @pause="playPause" @ended="playEnd" @timeupdate="timeupdate"
        :draggable="forbidFastForward" />
      <iframe v-if="['2'].includes(currentClass.type)" ref="iframeRef" :src="previewUrl" frameborder="0"
        style="width: 100%; height: 100%"></iframe>
      <div class="audioplay docplay" v-if="['3'].includes(currentClass.type)">
        <span>{{ currentClass.name }}</span>
        <audio ref="radioRef" controls :src="currentClass.downloadPath"></audio>
      </div>
    </div>
  </div>
  <a-modal v-model:visible="goStudyShow" title="提示：" z-index="9999000" ok-text="继续学习" cancel-text="关闭" @ok="goonStudy"
    @cancel="onCancel">
    <div style="font-size: 16px; font-weight: bold;padding: 45px;color: #333;">学习暂停中，是否继续学习？</div>
  </a-modal>
  <StartExam @register="startExamRegister" />
  <SignModal @register="signRegister" @signOk="signOk" />
  <ErrorCheck @register="errorCheckRegister" @confirm="errorConfirm" />
  <a-modal :cancelButtonProps="{ style: { display: 'none' } }" :maskClosable="false" :closable="false"
    :visible="answerModalShow" title="视频练习" @ok="handleOk" zIndex="2000">
    <div class="radio-wrap">
      <Radio :currentIdx="0" :currentQuestion="currentQuestion" />
    </div>
  </a-modal>
  <a-modal :visible="assessShow" title="评分" @cancel="assessHandleCancel" @ok="assessHandleOk" zIndex="2000">
    <a-form style="margin-top: 20px" :model="assessFormData" ref="assessForm" :labelCol="{ span: 4 }"
      :wrapperCol="{ span: 16 }">
      <a-form-item label="评分" name="assess" :rules="[
        { required: true, message: '请输入评分' },
        { validator: validateAssess, trigger: 'blur' },
      ]">
        <a-input placeholder="请输入评分" v-model:value="assessFormData.assess" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" setup>
import { trainTaskInfo, getResourceUrl, addDuration, studentSign } from '/@/views/app/educationTraining/index.api';
import player from '../../../studyTraining/resourceManage/video/playedu-player/index.vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import ErrorCheck from '../components/errorCheck.vue';
import Radio from '../components/question/radio.vue';
import SignModal from '../components/signModel.vue';
import StartExam from '../components/startExam.vue';
import { previewFile } from '/@/api/common/api';
import { useModal } from '/@/components/Modal';
import { userAssess } from './url/index';
import { Modal } from 'ant-design-vue';

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
const answerModalShow = ref<boolean>(false);
const currentQuestion = ref<any>({});

// 能否快进
const forbidFastForward = ref<boolean>(false);
// 随机暂停
const randomStop = ref<boolean>(false);
const timeList = ref<any>({});
const SECTION_NUM = 30 * 60;
// 是否答题
const videoAnswer = ref(false);

function pageInit(id) {
  trainTaskInfo({ id: id }).then((res) => {
    detailInfo.value = res;
    loading.value = false;
  });
}

const studyPageShow = ref(false);

const taskDetailInfo = ref<any>({});
const currentClassCopy = ref<any>({});
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
    addEvent();
    taskDetailInfo.value = res;
    forbidFastForward.value = res.forbidFastForward === '0';
    randomStop.value = res.randomStop === '1';
    videoAnswer.value = res.videoAnswer === '0';
    currentType.value = res.courseList[cidx as string].type;
    currentClass.value = res.courseList[(cidx as string) || 0];

    if (currentType.value == 1) {
      if (currentClass.value.studyDuration >= currentClass.value.duration) {
        currentClass.value.studyDuration = 0;
        forbidFastForward.value = false; // 如果已经学完，则可以快进
      }
      if (currentClass.value.questionList && currentClass.value.questionList.length > 0) {
        // 转换currentClass的questionList的videoTime为妙，并升序排序questionList
        currentClass.value.questionList.forEach((item: any) => {
          item.videoTime = item.videoTime
            .split(':')
            .map(Number)
            .reduce((acc, curr, index) => acc + curr * (index === 0 ? 3600 : index === 1 ? 60 : 1), 0);
        });
        currentClass.value.questionList.sort((a: any, b: any) => a.videoTime - b.videoTime);
      }
      if (randomStop.value) {
        timeList.value = {};
        const times = generateRandomNumbers(currentClass.value.duration);
        // 循环生成暂停列表
        for (let i = 0; i < times.length; i++) {
          timeList.value[times[i]] = true;
        }
        console.log(timeList.value);
      }
    }
    if (currentType.value == 2) {
      previewFile(res.courseList[cidx as string].resourceUrl).then((res) => {
        previewUrl.value = res;
        nextTick(() => {
          if (iframeRef.value) {
            iframeRef.value.onload = function () {
              var doc = iframeRef.value.contentWindow || iframeRef.value.contentDocument;
              sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
            };
          }
        });
      });
    }
    alreadyStudyTime.value = currentClass.value.studyDuration;
    currentClassCopy.value = JSON.parse(JSON.stringify(res.courseList[(cidx as string) || 0]));
    alreadyStudyTimerInterval();
  });
};

onUnmounted(() => {
  removeEvent();
});
// 监听页面关闭
const goStudyShow = ref(false);
// 开始学习添加时间
function addEvent() {
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', visibilitychange);
}
// 关闭学习 移除事件
function removeEvent() {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('visibilitychange', visibilitychange);
}
// 监听页面隐藏 切屏处置
function visibilitychange(event) {
  if (document.visibilityState === 'hidden') {
    if (studyPageShow.value) {
      if (currentClass.value.type == 1) {
        playerRef.value.pause();
        closeStudy(false);
      }
      if (currentClass.value.type == 2) {
        docStop();
      }
    }
  }
}
// 阻止页面关闭
function handleBeforeUnload(event) {
  const confirmationMessage = '你确定要离开吗？';
  event.returnValue = confirmationMessage;
  if (studyPageShow.value) {
    closeStudy(false);
  }
  return confirmationMessage;
}
// 文档暂停
function docStop() {
  goStudyShow.value = true;
  clearInterval(alreadyStudyTimer.value);
  closeStudy(false);
}
// 关闭学习
function onCancel() {
  studyPageShow.value = false;
  alreadyStudyTime.value = 0;
  removeEvent();
}
// 文档继续学习
function goonStudy() {
  sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
  goStudyShow.value = false;
  alreadyStudyTimerInterval();
}

// 生成视屏随机暂停列表
function generateRandomNumbers(duration) {
  const numbers = [];
  const segments = duration <= SECTION_NUM ? 1 : Math.ceil(duration / SECTION_NUM); // 划分区间
  const segmentLength = Math.floor((duration * 0.8) / segments); // 每个区间长度

  const segmentOffsets = Array.from({ length: segments }, () => Math.floor(Math.random() * segmentLength));
  for (let i = 0; i < segments; i++) {
    const start = i * segmentLength;
    const randomNum = start + segmentOffsets[i];
    numbers.push(randomNum);
  }
  return numbers.sort(() => 0.5 - Math.random()).slice(0, segments);
}
// closepage 是否关闭页面
const closeStudy = async (closepage = false) => {
  clearInterval(alreadyStudyTimer.value);
  if (closepage) {
    studyPageShow.value = false;
    removeEvent();
  }
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
    studyTime.value = computedStudyTime();
  }

  if (time == 0 && currentClass.value.type == 1) return;

  if (studyTime.value == 0 && currentClass.value.type == 2) return;

  let errorNetStudyTime: any = sessionStorage.getItem('errorNetStudyTime');
  if (errorNetStudyTime) {
    errorNetStudyTime = JSON.parse(errorNetStudyTime);
    if(
      errorNetStudyTime.resourceId == currentClass.value.id && 
      errorNetStudyTime.contentId == taskDetailInfo.value.id &&
      errorNetStudyTime.userTaskRecordId == taskDetailInfo.value.userTrainRecordId
    ) {
      studyTime.value = studyTime.value + parseInt(errorNetStudyTime.studyTime);
    }
    sessionStorage.removeItem('errorNetStudyTime');
  }
  
  await addDuration({
    userTaskRecordId: taskDetailInfo.value.userTrainRecordId,
    resourceId: currentClass.value.id,
    contentId: taskDetailInfo.value.id,
    duration: time,
    studyTime: parseInt(studyTime.value),
  }).catch(() => {
    pageInit(detailInfo.value.taskId);
    let jsonStr = JSON.stringify({
      userTaskRecordId: taskDetailInfo.value.userTrainRecordId,
      resourceId: currentClass.value.id,
      contentId: taskDetailInfo.value.id,
      duration: time,
      studyTime: parseInt(studyTime.value),
    });
    sessionStorage.setItem('errorNetStudyTime', jsonStr);
    studyTime.value = 0;
    sessionStorage.setItem('startStudyTime', '0');
  });
  if (closepage) {
    alreadyStudyTime.value = 0;
  }
  pageInit(detailInfo.value.taskId);
  sessionStorage.setItem('startStudyTime', '0');
};

const alreadyStudyTimer = ref<any>(null);
function alreadyStudyTimerInterval() {
  if (alreadyStudyTimer.value) clearInterval(alreadyStudyTimer.value);
  alreadyStudyTimer.value = setInterval(() => {
    alreadyStudyTime.value += 1;
  }, 1000);
}

// 学习时长
const studyTime = ref(0);
// 总学习时长
const alreadyStudyTime = ref(0);
const playStart = () => {
  sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
};
const playPause = () => {
  studyTime.value = computedStudyTime();
  sessionStorage.setItem('startStudyTime', '0');
  pushStudyTime();
};
// 视屏暂停时添加学习时长
function pushStudyTime() {
  addDuration({
    userTaskRecordId: taskDetailInfo.value.userTrainRecordId,
    resourceId: currentClass.value.id,
    contentId: taskDetailInfo.value.id,
    duration: parseInt(playerRef.value.currentTime()),
    studyTime: parseInt(studyTime.value),
  }).catch(() => {
    pageInit(detailInfo.value.taskId);
    studyTime.value = 0;
    sessionStorage.setItem('startStudyTime', '0');
  });
};
const playEnd = () => {
  studyTime.value = studyTime.value + computedStudyTime();
  sessionStorage.setItem('startStudyTime', '0');
};
const questionIndex = ref<number>(0);
const timeupdate = (time) => {
  if (currentClass.value.questionList && currentClass.value.questionList.length > 0 && videoAnswer.value) {
    currentClass.value.questionList.forEach((item: any, index: number) => {
      if (item.videoTime == time && !item.studyStatus) {
        playerRef.value.pause();
        questionIndex.value = index;
        item.userQuestionInfoList = item.questionList;
        currentQuestion.value = item;
        answerModalShow.value = true;
        console.log(currentClass.value);
      }
    });
  }
  if (randomStop.value && timeList.value[time]) {
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
    Modal.confirm({
      title: '很遗憾您的回答有误，请重新学习！',
      zIndex: 2000,
      cancelButtonProps: {
        style: {
          display: 'none',
        },
      },
      onOk() {
        if (questionIndex.value == 0) {
          playerRef.value.seek(0);
        } else {
          let videoTime = currentClassCopy.value.questionList[questionIndex.value - 1].videoTime;
          playerRef.value.seek(videoTime);
        }
        answerModalShow.value = false;
        playerRef.value.play();
        currentQuestion.value.userAnswer = null;
      },
      class: 'test',
    });
  }
};

const radioRef = ref<any>(null);

const setTimeStart = () => {
  sessionStorage.setItem('startStudyTime', new Date().getTime().toString());
};
const setPauseTime = () => {
  studyTime.value = studyTime.value + computedStudyTime();
};

const computedStudyTime = () => {
  if (Number(sessionStorage.getItem('startStudyTime')) == 0 || !sessionStorage.getItem('startStudyTime')) {
    if (currentClass.value.type == 1) {
      return 0;
    }
    return !alreadyStudyTime.value || alreadyStudyTime.value <= 0 || alreadyStudyTime.value - currentClass.value.studyDuration < 0 ? 0 : alreadyStudyTime.value - currentClass.value.studyDuration;
  }
  return new Date().getTime() - Number(sessionStorage.getItem('startStudyTime')) < 0 ? 0 : (new Date().getTime() - Number(sessionStorage.getItem('startStudyTime'))) / 1000;
};

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

// 考试类型 0: 正式考试 1: 模拟考试
// source 0: 任务考试 1：考试任务
const startExamFn = (item, examType = 0) => {
  if (lockFn(item) && examType == 0) return true;
  if (lockFnmock(item) && examType == 1) return true;
  openModal(true, { ...item.exam, examType, contentId: item.id, taskId: taskInfo.value.taskId, source: 0, taskStatus: taskInfo.value.status });
};

// 评价
const assessFormData = ref<any>({});
const assessShow = ref(false);
const assessForm = ref<any>(null);
const curAssess = ref<any>({});
const assessHandleOk = async () => {
  await assessForm.value
    .validate()
    .then((res) => {
      userAssess({
        id: detailInfo.value.taskId,
        contentId: curAssess.value.id,
        assess: assessFormData.value.assess,
      }).then(() => {
        assessShow.value = false;
        console.log(res);
      });
    })
    .catch((_) => { });
};

const assessClick = (item) => {
  curAssess.value = item;
  assessShow.value = true;
};

const assessHandleCancel = () => {
  assessShow.value = false;
  assessFormData.value = {};
  assessForm.value.clearValidate();
};

const validateAssess = async (_, value: string) => {
  if (!/^(10|[0-9])$/.test(value)) {
    return Promise.reject('请输入0-10的整数');
  }
  return Promise.resolve();
};

// 随机暂停逻辑
const randomStopFn = () => {
  Modal.confirm({
    title: '当前为随机暂停，确认后点击开始继续学习！',
    zIndex: 2000,
    cancelButtonProps: {
      style: {
        display: 'none',
      },
    },
    onOk() {
      playerRef.value.play();
    },
    class: 'test',
  });
};

const lockFn = (item) => {
  if (item.lock) return true;
  if (!item.courseList || item.courseList.length == 0) return item.lock;
  let h = item.courseList.some((c) => {
    return item.trainType === '1' && c.studyStatus === null;
  });
  if (item.mockExam && !item.mockExamPass) {
    return true;
  }
  return h;
};
const lockFnmock = (item) => {
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
    cursor: pointer;
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

.n {
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
  z-index: 1001;
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

    i {
      font-style: normal;
      font-weight: 600;
    }

    .label {
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

  .level {
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 24px;
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

.radio-wrap {
  padding-bottom: 18px;
}
</style>
