<template>
  <div class="detail-list" v-for="item in contentList" :key="item.id">
    <div class="name">
      {{ item.stageName }}
      <div class="type">
        {{ { 1: '线上', 2: '线下' }[item.trainType] }}培训
        <van-button
          @click="assessClick(item)"
          v-if="item.trainType === '2' && item.trainerSign && item.userSign"
          style="margin-left: 10px"
          type="primary"
          >评价</van-button
        >
      </div>
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
              <span style="font-size: 12px" v-if="citem.studyDuration && citem.studyDuration > 0"
                >已学习：{{ computeTime(citem.studyDuration) }}</span
              >
              <span class="n" :class="{ y: citem.studyStatus === '0' }">{{ citem.studyStatus == '0' ? '已完成' : '未完成' }}</span>
              <img v-if="item.lock" src="../../../../../assets/images/app/lock.png" alt="" />
            </div>
          </div>
          <div class="title">{{ citem.name }}({{ computeTime(citem.duration) }})</div>
        </div>
      </template>

      <div class="item" @click="startExam(item, 1)" v-if="item.mockExam">
        <div class="top">
          <div>
            <van-icon size="18px" color="#1890ff" name="todo-list" />
            <span>模拟考试</span>
          </div>
          <div class="right">
            <span v-if="item.mockExamPass" class="y" :class="{ np: !item.mockExamPass }">
              {{ item.mockExamPass ? '合格' : '不合格' }}
            </span>
            <img v-if="canExam1(item)" src="../../../../../assets/images/app/lock.png" alt="" />
          </div>
        </div>
        <div class="title">{{ item.mockExam.examName }}({{ computeTime(item.mockExam.examTime * 60) }})</div>
      </div>

      <div class="item" @click="startExam(item)" v-if="item.exam">
        <div class="top">
          <div>
            <van-icon size="18px" color="#1890ff" name="todo-list" />
            <span>考试</span>
          </div>
          <div class="right">
            <span v-if="item.passStatus" class="y" :class="{ np: item.passStatus === '不合格' }">{{ item.passStatus }}</span>
            <van-button
              style="margin-left: 10px"
              class="animation"
              type="primary"
              v-if="!item.userSign && item.passStatus == '合格' && item.trainPerson"
              @click.stop="holdSign(item.id)"
              >{{ item.examScore != item.exam.score ? '错题订正' : '待签字' }}</van-button
            >
            <span v-if="item.userSign && !item.trainerSign && item.trainPerson" style="color: #ee0a24">待教育者签字</span>
            <img v-if="isLock(item)" src="../../../../../assets/images/app/lock.png" alt="" />
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
          <van-button style="padding: 18px 0" round type="primary" @click="signShow = true" block>确认签字</van-button>
        </div>
      </div>
    </van-popup>
    <van-dialog v-model:show="signShow" title="签名" :before-close="signClose" @confirm="dialogConfirm" show-cancel-button>
      <Sign v-model:value="signature" />
      <div class="hint" v-show="hintShow && !signature">请签字</div>
    </van-dialog>
    <examDescribe :taskItem="curItem" :examConfigInfo="examConfigInfo" v-model:show="showBottom" />
  </div>
  <van-dialog v-model:show="assessShow" title="评价" :before-close="assessClose" show-cancel-button>
    <van-form ref="assessForm">
      <van-field
        v-model="assess"
        name="assess"
        label="评分"
        placeholder="请输入评分"
        :rules="[
          { required: true, message: '请输入评分' },
          { validator: assessValidator, message: '评分为0-10的正整数' },
        ]"
      />
    </van-form>
  </van-dialog>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import Sign from '../../../components/sign.vue';
  import { ref, nextTick } from 'vue';
  import examDescribe from './examDescribe.vue';
  import { useRoute } from 'vue-router';
  import { trainExamConfig, studentSign, correctionMistakes, userAssess } from '../../index.api';
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
  // 考试类型 0: 正式考试 1: 模拟考试
  const startExam = (item, examType = 0) => {
    if ((item.lock || isLock(item)) && examType == 0) return;
    if (canExam1(item) && examType == 1) return;
    if (item.userSign && item.userSign != '1') {
      router.push(`/app/student/examResult?taskId=${props.id}&contentId=${item.id}&signed=1&examType=${examType}`);
      return;
    }
    showBottom.value = true;
    // curItem.value = { ...item, source: 2 };
    trainExamConfig({ id: props.id, contentId: item.id, examType }).then((res) => {
      eduStore.setExamConfig(res);
      curItem.value = { ...item, source: 0, taskId: props.id, taskStatus: props.taskStatus, examType };
      examConfigInfo.value = res;
      nextTick(() => {
        showBottom.value = true;
      });
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
  const isLock = (item) => {
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
  const canExam1 = (item) => {
    if (item.trainType == 2 && item.lock) return true;
    if (!item.courseList || item.courseList.length == 0) return item.lock;
    // 学完所有课程才能考试
    let h = item.courseList.every((c) => c.studyStatus === '0');
    if (item.trainType == 2) return false;
    return !h;
  };

  // 评价
  const assess = ref<string | number>('');
  const curAssess = ref<any>({});
  const assessForm = ref<any>(null);
  // 评分验证 纯数字，0-10正整数
  const assessValidator = (value) => {
    return /^(10|[0-9])$/.test(value);
  };
  const assessShow = ref(false);
  const assessClick = (item) => {
    curAssess.value = item;
    assessShow.value = true;
  };
  const assessClose = (str) => {
    if (str == 'cancel') {
      assessForm.value.resetValidation();
      return Promise.resolve(true);
    }
    return new Promise(async (resolve) => {
      await assessForm.value
        .validate()
        .then((res) => {
          userAssess({
            id: route.query.id,
            contentId: curAssess.value.id,
            assess: assess.value,
          })
            .then(() => {
              resolve(true);
            })
            .catch((_) => resolve(false));
        })
        .catch((_) => resolve(false));
    });
  };

  const computeTime = (time: number) => {
    if (isNaN(time)) return '';
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
    margin-top: 20px;
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
        display: flex;
        align-items: center;
        justify-content: space-between;
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
  .np {
    color: #ee0a24;
    background-color: #fce5e7;
  }
  .animation {
    transition: all 0.3s ease;
    animation: scale 0.3s infinite alternate;
  }
  .animation::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid #3b82f6; /* 边缘初始颜色 */
    border-radius: 8px; /* 比按钮略大一点的圆角 */
    animation: flash 0.6s infinite; /* 闪烁动画 */
    pointer-events: none; /* 不影响按钮点击 */
  }
  /* 边缘闪烁动画 */
  @keyframes flash {
    0%,
    100% {
      opacity: 0.3;
      box-shadow: 0 0 8px rgba(64, 128, 255, 0.3), inset 0 0 8px rgba(64, 128, 255, 0.3);
      transform: scale(1); /* 边缘初始大小 */
    }
    50% {
      opacity: 0.8;
      box-shadow: 0 0 20px rgba(64, 128, 255, 0.6), inset 0 0 20px rgba(64, 128, 255, 0.6);
      transform: scale(1.05); /* 边缘轻微放大 */
    }
  }

  /* 按钮放大缩小动画 */
  @keyframes scale {
    0% {
      transform: scale(1); /* 初始大小 */
    }
    100% {
      transform: scale(1.08); /* 放大到1.08倍 */
    }
  }
</style>
