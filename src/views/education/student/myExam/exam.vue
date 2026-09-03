<template>
  <div class="exam">
    <div class="hd">
      <div class="left">
        <a-button @click="back" type="link">退出</a-button>
        <div class="line"></div>
        <span class="examName">{{ paperes.taskName }}</span>
      </div>
      <div class="hint" v-if="!paperes.exercise">温馨提示：<span>切换屏幕系统将自动交卷，请谨慎操作！</span></div>
      <div class="right">
        <template v-if="!paperes.exercise">
          <span>总分：{{ paperes.score }}</span>
          <span>及格分：{{ paperes.passScore }}</span>
          <span v-if="pageState != '1'"
            >考试剩余：{{ remainingTime.hr > 0 ? remainingTime.hr + '时' : '' }} {{ remainingTime.min }}分{{ remainingTime.sec }} 秒</span
          >
          <span v-if="pageState == '1'">考试用时：{{ computeTime(paperes.userUseTime) }}</span>
        </template>

        <span v-if="pageState != '1'"><a-button type="primary" @click="submitExam()">提交试卷</a-button></span>
      </div>
    </div>
    <div class="main">
      <div class="left">
        <div class="result-chart" v-if="pageState == '1'">
          <span>{{ paperes.score }}</span>
          <div>{{ paperes.passStatus == '0' ? '合格' : '不合格' }}</div>
        </div>
        <div class="record" v-if="pageState == '1' && paperes.userUseTime">
          <span>{{ paperes.submitTime }}</span>
          <a-button @click="recordShow">考试记录</a-button>
        </div>
        <div class="title">答题卡</div>
        <div class="list">
          <a v-for="(item, idx) in questionList" :href="'#' + item.questionId">
            <div class="item" :class="{ err: item.userScore + '' === '0', on: item.userAnswer && item.userScore !== '0' }">
              <span class="num">{{ route.query.status === '1' ? item.questionSort : idx + 1 }}</span>
            </div>
          </a>
        </div>
      </div>
      <div class="right">
        <div class="item" v-for="(item, idx) in questionList" :id="item.questionId">
          <Radio :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 1" />
          <Select :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 2" />
          <QInput :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 3" />
          <Judge :currentIdx="idx" :currentQuestion="item" v-if="item.questionType == 4" />
          <Ask :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 5" />
        </div>
      </div>
    </div>
  </div>
  <ExamRecord @register="register" />
</template>
<script name="Exam" lang="ts" setup>
  import { computed, ref, onUnmounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import Radio from '../components/question/radio.vue';
  import Select from '../components/question/select.vue';
  import QInput from '../components/question/input.vue';
  import Judge from '../components/question/judge.vue';
  import Ask from '../components/question/ask.vue';
  import { examSubmit, exerciseSubmit } from '/@/views/app/educationTraining/index.api';
  import ExamRecord from '../components/examRecord.vue';
  import { useModal } from '/@/components/Modal';
  import { Modal } from 'ant-design-vue';
  import { notification } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useEduStore } from '/@/store/modules/education';
  import { h } from 'vue';
  import { getResponseHeader } from '/@/api/common/api';

  const eduStore = useEduStore();
  const openNotification = () => {
    notification.open({
      message: '提示！',
      description: '考试剩余一分钟，到时将自动交卷！',
      duration: 60,
      icon: () => h(ExclamationCircleOutlined, { style: 'color: #faad14' }),
    });
  };
  // 防切屏逻辑
  changeScreen();
  function changeScreen() {
    if (eduStore.getExamConfig?.cutScreen) {
      document.addEventListener('visibilitychange', closeOrRefresh);
    }
    beforeUnload();
  }

  const changeScreenTimer = ref<any>(null);
  function closeOrRefresh() {
    if (document.hidden) {
      changeScreenTimer.value = setTimeout(() => {
        finish();
        clearTimeout(changeScreenTimer.value);
      }, 1000 * 10);
    } else {
      clearTimeout(changeScreenTimer.value);
    }
  }

  let isBeforeUnloadFired = false;
  // 监听页面卸载事件
  function beforeUnload() {
    window.addEventListener('beforeunload', function (e) {
      // 标记事件已触发
      isBeforeUnloadFired = true;

      // 触发确认对话框
      e.preventDefault();
      e.returnValue = '';

      // 启动一个短计时器
      setTimeout(() => {
        // 如果计时器执行了，说明用户选择了"取消"（留在页面）
        if (isBeforeUnloadFired) {
          console.log('用户选择了取消，留在当前页面');
          // 这里可以添加用户选择留下后的处理逻辑
          isBeforeUnloadFired = false; // 重置标记
        }
      }, 100);
    });
    // 监听页面卸载事件（用户选择"确定"离开时触发）
    window.addEventListener('pagehide', function () {
      if (isBeforeUnloadFired) {
        console.log('用户选择了确定，离开页面');
        finish();
      }
    });
  }

  // 1 考试结果页 0 考试中
  const pageState = computed(() => (route && route.query && route.query.status) || 0);

  const [register, { openModal }] = useModal();
  const router = useRouter();
  const route = useRoute();
  const timer = ref<any>(null);
  const remainingTime = ref<any>({
    day: 0,
    hr: 0,
    min: 0,
    sec: 0,
  });

  const paperes = ref<any>({});
  const questionList = ref<any>([]);
  const userUseTime = ref<number>(0);
  // 记录每日一练考试开始时间
  const initStartTime = ref<number>(0);
  pageInit();
  function pageInit() {
    // 1 考试结果页 0 考试中
    if (pageState.value == '1') {
      paperes.value = JSON.parse(sessionStorage.getItem('examResult') as string);
      questionList.value = paperes.value.questionList;
      questionList.value.forEach((item: any) => {
        if (item.userAnswer) {
          item.userAnswer = JSON.parse(item.userAnswer);
          // 单选 判断
          if (['1', '4'].includes(item.questionType)) item.userAnswer = item.userAnswer[0];
          // 填空
          if (['3', '5'].includes(item.questionType)) {
            item.userQuestionInfoList.forEach((subItem: any, idx: number) => {
              subItem.userAnswer = item.userAnswer[idx] || '';
            });
          }
        }
      });
    } else {
      paperes.value = JSON.parse(sessionStorage.getItem('examPaper') as string);
      questionList.value = paperes.value.questionList;
      // 每日一练考试 不自动交卷
      if (!paperes.value.exercise) {
        countdown(new Date(paperes.value.userExamTime).getTime() + paperes.value.examTime * 60 * 1000, 1, 'submit');
      } else {
        initStartTime.value = new Date().getTime();
      }
    }
  }

  async function countdown(timestamp: number, recordId: number, method: string) {
    let res = await getResponseHeader();
    const today: any = new Date(res.headers.date);
    let now = Date.parse(today);
    let remaining: number = Math.ceil((timestamp - now) / 1000);
    if (remaining < 0) {
      finish();
      return;
    }
    timer.value = setInterval(() => {
      //防止出现负数
      if (remaining > 0) {
        remaining--;
        let day = Math.floor(remaining / 3600 / 24);
        let hour = Math.floor((remaining / 3600) % 24);
        let minute = Math.floor((remaining / 60) % 60);
        let second = Math.floor(remaining % 60);
        remainingTime.value = {
          day: day,
          hr: hour,
          min: minute,
          sec: second,
        };
        if (remaining == 60) openNotification();
      } else {
        finish();
      }
      userUseTime.value = remaining;
    }, 1000);
  }

  // 计算每日一练考试用时
  const computeDailyExamTime = () => {
    return (new Date().getTime() - initStartTime.value) / 1000;
  };

  // 计算考试用时
  const computeTime = (time: number) => {
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };

  const back = async () => {
    if (pageState.value != 1) {
      let result = setResult();
      Modal.confirm({
        title: '提示',
        content: `退出后将自动提交试卷，确认要退出吗？`,
        okText: '确认退出',
        cancelText: '继续答题',
        onOk() {
          next(result, false);
        },
        onCancel() {
          console.log('取消交卷');
        },
      });
    } else {
      // router.replace('/student/myExam');
      if (route.query.source == '0') {
        router.replace('/student/myTrining');
      } else {
        router.replace('/student/myExam');
      }
    }
  };

  const finish = () => {
    clearTimeEvent();
    let result = setResult();
    next(result, true);
  };

  // 展示考试结果
  const recordShow = () => {
    openModal(true, { taskId: route.query.taskId });
  };

  // 处理作答结果
  const setResult = () => {
    let result: Array<{ questionId: number; userAnswer: string | number | Array<string> }> = [];
    questionList.value.forEach((item: any) => {
      let obj = { questionId: item.questionId, userAnswer: item.userAnswer };
      // 填空题结果组装
      if (['3'].includes(item.questionType)) {
        let strs: string[] = [];
        item.userQuestionInfoList.forEach((citem: any) => {
          if (citem.userAnswer) {
            strs.push(citem.userAnswer);
          }
        });
        obj.userAnswer = strs;
      }
      // 所有答案以数组形式提交
      if (!Array.isArray(obj.userAnswer)) obj.userAnswer = obj.userAnswer ? [obj.userAnswer] : [];

      result.push(obj);
    });
    return result;
  };

  // 交卷
  const submitExam = async () => {
    let result = setResult();
    let count = 0;
    result.forEach((item: any) => {
      if (item.userAnswer.length == 0) count++;
      if (item.userAnswer.length > 0) {
        item.userAnswer.map((val, i) => (item.userAnswer[i] = val.trim()));
      }
    });
    if (count > 0) {
      Modal.confirm({
        title: '提交试卷',
        content: `剩余${count}道题目未完成，是否确认提交试卷？`,
        okText: '确认交卷',
        cancelText: '继续答题',
        onOk() {
          next(result, true);
        },
        onCancel() {
          console.log('取消交卷');
        },
      });
    } else {
      Modal.confirm({
        title: '提交试卷',
        content: `是否确认提交试卷？`,
        okText: '确认交卷',
        cancelText: '继续答题',
        onOk() {
          next(result, true);
        },
        onCancel() {
          console.log('取消交卷');
        },
      });
    }
  };
  // needResultPage 是否展示考试结果页
  const next = async (result, needResultPage?) => {
    // 每日一练考试交卷
    if (paperes.value.exercise) {
      let questionList1 = JSON.parse(JSON.stringify(questionList.value));
      questionList1.forEach((item: any) => {
        if (item.userAnswer && typeof item.userAnswer == 'string') {
          item.userAnswer = [item.userAnswer.trim()];
        }
        if (!item.userAnswer) {
          item.userAnswer = [];
        }
      });
      let userUseTime = computeDailyExamTime();
      let res = await exerciseSubmit({
        ...paperes.value,
        questionList: questionList1,
        userExamRecordId: paperes.value.userExamRecordId,
        userUseTime: userUseTime,
        userExamTime: paperes.value.userExamTime,
      });
      eduStore.setExamConfig({});
      sessionStorage.setItem('examResult', JSON.stringify(res));
      sessionStorage.removeItem('examPaper');
      router.back();
      return false;
    }
    // 任务考试
    let res = await examSubmit({
      questionList: result,
      userExamRecordId: paperes.value.userExamRecordId,
      userUseTime: paperes.value.examTime * 60 - userUseTime.value,
      userExamTime: paperes.value.userExamTime,
      examType: route.query.examType,
    });
    eduStore.setExamConfig({});
    sessionStorage.setItem('examResult', JSON.stringify(res));
    sessionStorage.removeItem('examPaper');
    clearTimeEvent();
    if (needResultPage) {
      router.replace({
        path: `/examresult`,
        query: {
          taskId: route.query.taskId,
          examed: 'true',
          status: 1,
          contentId: route.query.contentId,
          source: route.query.source,
        },
      });
    } else {
      if (route.query.source == '0') {
        router.replace('/student/myTrining');
      } else {
        router.replace('/student/myExam');
      }
    }
  };

  function clearTimeEvent() {
    document.removeEventListener('visibilitychange', closeOrRefresh);
    window.removeEventListener('beforeunload', beforeUnload);
    window.removeEventListener('pagehide', beforeUnload);
    clearInterval(timer.value);
    timer.value = null;
  }
</script>
<style lang="less" scoped>
  .exam {
    width: 100%;
    height: 100%;
    font-size: 18px;
    .hd {
      height: 55px;
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      align-items: center;
      .left {
        display: flex;
        align-items: center;
        button {
          font-size: 18px;
          padding: 0;
          padding-right: 16px;
        }
      }
      .line {
        width: 1px;
        height: 20px;
        background: #cccccc;
        margin-right: 16px;
      }

      .right {
        display: flex;
        justify-content: flex-end;
        span {
          padding-left: 16px;
        }
      }
    }
    .left {
      width: 290px;
    }
    .right {
      flex: 1;
    }
    .main {
      height: calc(100% - 55px);
      padding: 10px 16px;
      padding-right: 0;
      display: flex;
      .left {
        width: 290px;
        position: relative;
        .result-chart {
          width: 150px;
          height: 150px;
          border: 15px solid #1890ff;
          border-radius: 50%;
          margin: 30px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          span {
            font-size: 24px;
            font-weight: 600;
          }
          div {
            font-size: 24px;
            color: #1890ff;
            font-weight: 600;
          }
        }
        .record {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 16px;
          margin-bottom: 16px;
        }
        .list {
          display: flex;
          flex-wrap: wrap;
          .item {
            width: 43px;
            height: 43px;
            margin: 5px;
            border: 1px solid #bebebe;
            color: #cccccc;
            text-align: center;
            align-items: center;
            display: flex;
            justify-content: center;
            border-radius: 5px;
            .num {
              color: #bebebe;
            }
          }
          .on {
            background-color: #1890ff;
            border: 1px solid #1890ff;
            color: #ffffff;
            .num {
              color: #ffffff;
            }
          }
          .err {
            background-color: #ff4d4f;
            border: 1px solid #ff4d4f;
            color: #ffffff;
            .num {
              color: #ffffff;
            }
          }
        }
      }
      .right {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background-color: #f5f5f5;
        .item {
          background-color: #ffffff;
          padding: 16px;
          margin-bottom: 16px;
          border-radius: 8px;
        }
      }
    }
  }
</style>
<style lang="less">
  .question-option {
    line-height: 38px;
  }
  .analysis {
    width: 100%;
    height: auto;
    background: #f6f6f6;
    border-radius: 8px;
    padding: 16px;
    margin-top: 16px;
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
      margin-top: 10px;
    }
    .exam-diffiCulty {
      color: #00000073;
      font-size: 14px;
    }
  }
  .hint span {
    color: #ee0a24;
  }
</style>
