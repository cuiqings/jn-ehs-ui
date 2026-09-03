<template>
  <div class="detail-list" v-for="item in contentList" :key="item.id">
    <div class="name">
      {{ item.stageName }}
      <span class="type">{{ { 1: '线上', 2: '线下' }[item.trainType] }}培训</span>
      <span class="hold" v-if="item.confirm && item.confirm === '1' && !item.userSign">待确认</span>
    </div>
    <div class="itemtop">
      <template v-for="(citem, cidx) in item.courseList" :key="citem.id">
        <div class="item" @click="go('video', item.id, citem.id, cidx, item)">
          <div class="top">
            <div>
              <van-icon v-if="citem.type == 1" size="18px" color="#1890ff" name="video" />
              <van-icon v-if="citem.type == 2" size="18px" color="#1890ff" name="description" />
              <van-icon v-if="citem.type == 3" size="18px" color="#1890ff" name="audio" />
              <span>{{ { 1: '视频', 2: '文档', 3: '音频' }[citem.type] }}</span>
            </div>
            <div class="right">
              <span style="font-size: 12px;" v-if="citem.studyDuration && citem.studyDuration > 0">已学习：{{ computeTime(citem.studyDuration) }}</span>
              <span class="n" :class="{ y: citem.studyStatus === '0' }">{{ citem.studyStatus == '0' ? '已完成' : '未完成' }}</span>
              <img v-if="item.lock" src="../../../../../assets/images/app/lock.png" alt="" />
            </div>
          </div>
          <div class="title">{{ citem.name }}({{ computeTime(citem.duration) }})</div>
        </div>
      </template>

      <div class="item" @click="startExam(item)" v-if="item.exam">
        <div class="top">
          <div>
            <van-icon size="18px" color="#1890ff" name="todo-list" />
            <span>考试</span>
          </div>
          <div class="right">
            <span v-if="item.passStatus" class="y" :class="{ np: item.passStatus === '不合格' }">{{ item.passStatus }}</span>
            <van-button style="margin-left: 10px;" type="primary" v-if="!item.userSign && item.passStatus == '合格' && item.trainPerson" @click.stop="holdSign(item.id)">待签字</van-button>
            <span v-if="item.userSign && !item.trainerSign && item.trainPerson" style="color: #ee0a24;">待教育者签字</span>
            <img v-if="canExam(item)" src="../../../../../assets/images/app/lock.png" alt="" />
          </div>
        </div>
        <div class="title">{{ item.exam.examName }}({{ computeTime(item.exam.examTime * 60) }})</div>
      </div>

      <van-field readonly input-align="right" :border="false" v-model="item.enforceCode" label="实施单位：" />
      <van-field readonly input-align="right" :border="false" v-model="item.trainPerson" label="教育者：" />
    </div>

    <van-popup v-model:show="showHold" round position="bottom" :style="{ height: '348px' }">
      <div class="examinfo">
        <div class="title">订正确认</div>
        <div class="number-box">
          <div v-for="(item, i) in questionList" :class="item.userAnswer ? 'act-num-item' : 'num-item'" key="{i}" @click="goQuestion(item, i)">{{
            item.questionSort
          }}</div>
        </div>
        <div class="foot">
          <van-button style="padding: 18px 0;" round type="primary" @click="signShow = true" block>确认签字</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { trainExamConfig, studentSign, correctionMistakes } from '../../index.api';
  import { useEduStore } from '/@/store/modules/education';
  const route = useRoute();

  const eduStore = useEduStore();
  interface Item {
    id: string;
    stageName: string;
    courseList: any[];
    exam: any;
    enforceCode: string;
    trainPerson: string;
    trainType: string;
    userSign: string;
    confirm: string;
    lock: boolean;
    passStatus: string;
  }
  // pageType 1 任务列表页 2 任务详情页
  const props = withDefaults(
    defineProps<{
      contentList: Array<Item>;
      pageType: string;
      id?: string;
      taskStatus?: string;
    }>(),
    {
      pageType: '1',
    }
  );

  const emit = defineEmits(['changeClass', 'signed']);
  const router = useRouter();
  // 签到二维码
  const codeUrl = ref('');
  // 去考试，学习
  const go = (tag, contentId, resourceId, cidx, item) => {
    if (item.lock || props.taskStatus == '未开始') return;
    if (props.pageType == '2') {
      emit('changeClass', { contentId, resourceId, cidx, item });
      return;
    }
    if (tag == 'video') {
      router.push(`/app/student/study?id=${route.query.id}&contentId=${contentId}&resourceId=${resourceId}&cidx=${cidx}`);
    } else {
      // router.push('/app/student/exam');
      router.push('/app/student/identify');
    }
  };

  // 订正
  const goQuestion = (item, idx) => {
    sessionStorage.setItem('identify', 'true');
    sessionStorage.setItem(
      'examResult',
      JSON.stringify({
        taskName: '',
        questionList: questionList.value,
      })
    );
    let query = {
      status: 1,
      index: idx,
    };
    router.push({
      path: '/app/student/exam?status=1',
      query: query,
    });
  };

  const showBottom = ref(false);
  const examConfigInfo = ref({});
  const curItem = ref({});
  const startExam = (item) => {
    if (item.lock || canExam(item)) return;
    if (item.userSign && item.userSign != '1') {
      router.push(`/app/student/examResult?taskId=${props.id}&contentId=${item.id}&signed=1`);
      return;
    }
    showBottom.value = true;
    // curItem.value = { ...item, source: 2 };
    trainExamConfig({ id: props.id, contentId: item.id }).then((res) => {
      eduStore.setExamConfig(res);
      showBottom.value = true;
      curItem.value = { ...item, source: 0, taskId: props.id, taskStatus: props.taskStatus };
      examConfigInfo.value = res;
    });
  };

  const signShow = ref(false);
  const showHold = ref(false);
  const signature = ref('');
  const hintShow = ref(false);
  const signClose = (s) => {
    if (s == 'confirm') return !!signature.value;
    hintShow.value = false;
    return true;
  };
  // 签字确认
  const dialogConfirm = async () => {
    if (!signature.value) {
      hintShow.value = true;
      return;
    }
    signShow.value = false;
    showHold.value = false;
    await studentSign({
      id: route.query.id,
      contentId: currentContentId.value,
      sign: signature.value,
    }).catch((_) => {
      emit('signed');
    });
    emit('signed');
  };

  const questionList = ref<any[]>([]);
  const currentContentId = ref('');

  // 签字
  const holdSign = (contentId) => {
    showHold.value = true;
    currentContentId.value = contentId;
    correctionMistakes({ taskId: route.query.id, contentId: contentId }).then((res) => {
      questionList.value = res;
    });
  };

  // 判断是否可以考试
  const canExam = (item) => {
    // if (item.trainType == 2) return false;
    if (!item.courseList || item.courseList.length == 0) return item.lock;
    // 学完所有课程才能考试
    let h = item.courseList.every((c) => c.studyStatus === '0');
    if(item.trainType == 2) return false;
    return !h;
  };

  const computeTime = (time: number) => {
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };
</script>
<style lang="less" scoped>
  .detail-list {
    width: 100%;
    height: auto;
    padding: 0 15px;
    .name {
      width: 100%;
      height: 38px;
      font-size: 15px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 15px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      display: flex;
      justify-content: space-between;
      .type {
        font-size: 12px;
        color: #666;
        margin: 0 15px;
      }
    }
    .itemtop {
      width: 100%;
      height: auto;
      margin-top: 10px;
    }
    .hold {
      color: #ee0a24;
    }
    .item {
      width: 100%;
      height: auto;
      background: #fafafa;
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
  }
  .examinfo {
    width: 100%;
    height: 300px;
    .title {
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 22px;
      margin-top: 20px;
      font-weight: 600;
    }
    .number-box {
      width: 100%;
      max-height: 410px;
      overflow-y: auto;
      overflow-x: hidden;
      display: grid;
      row-gap: 20px;
      column-gap: 19px;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      box-sizing: border-box;
      padding: 0px 20px 30px 20px;
      margin: 10px 0;
      .num-item {
        width: 40px;
        height: 40px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        font-size: 16px;
        line-height: 40px;
        font-weight: 500;
        text-align: center;
        color: rgba(0, 0, 0, 0.45);
      }
      .act-num-item {
        width: 40px;
        height: 40px;
        background: rgba(238, 23, 23, 0.15);
        border-radius: 50%;
        font-size: 16px;
        line-height: 40px;
        font-weight: 500;
        text-align: center;
        color: #f12525;
      }
    }
  }
  .foot {
    position: absolute;
    bottom: 15px;
    width: 100%;
    padding: 0 16px;
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
  .hint {
    font-size: 12px;
    color: #ee0a24;
    padding: 0 16px;
    text-align: center;
  }
  .np{
    color: #ee0a24;
    background-color: #fce5e7;
  }
</style>
