<template>
  <div class="paper-wrapper" v-loading="submitIng">
    <div class="question-box">
      <div class="time-down" v-if="status === '0'">
        <!-- <img src="{clockIcon}" /> -->
        <template v-if="!paperes.exercise">
          {{ remainingTime.hr > 0 ? remainingTime.hr + '时' : '' }}
          {{ remainingTime.min }}分{{ remainingTime.sec }} 秒
        </template>

        <span style="color: #666; padding-left: 10px">{{ currentQuestionIndex + 1 }}/{{ questionList.length }}</span>
      </div>
      <Radio :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 1" />
      <Select :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 2" />
      <QInput :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 3" />
      <Judge :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 4" />
      <Ask :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 5" />
    </div>
    <div class="paper-footer">
      <div class="paper-bar" @click="lastQuestion">
        <LeftCircleOutlined style="font-size: 28px; color: #4d4d4f" />
        <span>上一题</span>
      </div>
      <div class="act-paper-bar" @click="setVisible">
        <div class="back">
          <OrderedListOutlined style="font-size: 28px; color: #ffffff" />
        </div>
        <span>答题卡</span>
      </div>
      <div class="paper-bar" @click="nextQuestion">
        <RightCircleOutlined style="font-size: 28px; color: #4d4d4f" />
        <span>下一题</span>
      </div>
    </div>
  </div>
  <AnswerSheet @submit="submit" :questionList="questionList" @goQuestion="goQuestion" :currentIdx="currentQuestionIndex" ref="answerSheetRef" />
</template>

<script lang="ts" setup>
  import { OrderedListOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
  import AnswerSheet from '../components/AnswerSheet.vue';
  import Select from '../components/question/select.vue';
  import QInput from '../components/question/input.vue';
  import Radio from '../components/question/radio.vue';
  import Judge from '../components/question/judge.vue';
  import Ask from '../components/question/ask.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { onBeforeRouteLeave } from 'vue-router';
  import { examSubmit, exerciseSubmit } from '../../index.api';
  import { showConfirmDialog } from 'vant';
  import { ref, watchEffect, onMounted } from 'vue';
  import { useEduStore } from '/@/store/modules/education';
  import { getResponseHeader } from '/@/api/common/api';

  const router = useRouter();
  const route = useRoute();
  const status = ref(route.query.status || '0');
  const timer = ref<any>(null);
  const eduStore = useEduStore();

  // 记录每日一练考试开始时间
  const initStartTime = ref<number>(0);

  onMounted(() => {
    changeScreen();
  });

  function changeScreen() {
    if (eduStore.getExamConfig?.cutScreen) {
      document.addEventListener('visibilitychange', closeOrRefresh);
    }
  }

  const changeScreenTimer = ref<any>(null);
  function closeOrRefresh() {
    if (document.hidden) {
      changeScreenTimer.value = setTimeout(() => {
        submit(false);
        clearTimeout(changeScreenTimer.value);
      }, 1000 * 10);
    } else {
      clearTimeout(changeScreenTimer.value);
    }
  }

  const answerSheetRef = ref<InstanceType<typeof AnswerSheet> | null>(null);
  const paperes = ref<any>({});
  const questionList = ref<any>([]);
  const currentQuestionIndex = ref<number>(0);
  const currentQuestion = ref<any>();

  pageInit();
  function pageInit() {
    // 1 考试结果页 0 考试中
    if (route.query.status == '1') {
      paperes.value = JSON.parse(sessionStorage.getItem('examResult') as string);
      questionList.value = paperes.value.questionList;
      questionList.value.forEach((item: any) => {
        if (item.userAnswer) {
          item.userAnswer = typeof item.userAnswer === 'string' ? JSON.parse(item.userAnswer) : item.userAnswer;
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
    }
    currentQuestion.value = questionList.value[currentQuestionIndex.value];
    if (paperes.value.userExamTime && paperes.value.userExamTime.indexOf('-') > -1) {
      paperes.value.userExamTime = paperes.value.userExamTime.replace(/-/g, '/');
    }
    if (!paperes.value.exercise) {
      countdown(new Date(paperes.value.userExamTime).getTime() + paperes.value.examTime * 60 * 1000, 1, 'submit');
    } else {
      initStartTime.value = new Date().getTime();
    }
  }
  // 倒计时
  const remainingTime = ref<any>({
    day: 0,
    hr: 0,
    min: 0,
    sec: 0,
  });

  if (route.query.index) {
    currentQuestionIndex.value = Number(route.query.index);
    currentQuestion.value = questionList.value[currentQuestionIndex.value];
  }

  const userUseTime = ref<any>(0);
  async function countdown(timestamp: number, recordId: number, method: string) {
    if (status.value == '1') return;
    let res = await getResponseHeader();
    const today: any = new Date(res.headers.date);
    const now = Date.parse(today);
    let remaining: number = Math.ceil((timestamp - now) / 1000);
    if (remaining <= 0) {
      finish(recordId, method);
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
      } else {
        finish(recordId, method);
      }
      userUseTime.value = remaining;
    }, 1000);
  }
  async function finish(recordId: number, method: string) {
    clearInterval(timer.value);
    timer.value = null;
    if (method === 'submit') {
      //提交
      await submit(false);
    }
  }

  watchEffect(() => {
    questionList.value[currentQuestionIndex.value] = currentQuestion.value;
  });

  const goQuestion = (index: number) => {
    currentQuestionIndex.value = index;
    currentQuestion.value = questionList.value[currentQuestionIndex.value];
  };

  const lastQuestion = () => {
    if (currentQuestionIndex.value === 0) return;
    currentQuestionIndex.value--;
    currentQuestion.value = questionList.value[currentQuestionIndex.value];
  };

  const setVisible = () => {
    answerSheetRef.value?.open();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex.value === questionList.value.length - 1) {
      return;
    }
    currentQuestionIndex.value++;
    currentQuestion.value = questionList.value[currentQuestionIndex.value];
  };

  onBeforeRouteLeave(async (to, from, next) => {
    if (to.query.examed == 'true' || from.query.status === '1') {
      return next();
    } else {
      if (sessionStorage.getItem('examPaper') == null) {
        next();
        return;
      }
      await showConfirmDialog({
        message: '退出考试会自动交卷，确认退出？',
      }).then(async () => {
        await submit(true);
        next();
      });
    }
  });
  const submitIng = ref(false);
  // 考试提交
  const submit = async (back) => {
    if (submitIng.value) return;
    submitIng.value = true;
    let result: Array<{ questionId: number; userAnswer: string | number | Array<string> }> = [];
    questionList.value.forEach((item: any) => {
      let obj = { questionId: item.questionId, userAnswer: item.userAnswer ? item.userAnswer : '' };
      // 填空题结果组装
      if (['3'].includes(item.questionType)) {
        let strs: string[] = [];
        item.userQuestionInfoList.forEach((citem: any) => {
          strs.push(citem.userAnswer || '');
        });
        obj.userAnswer = strs;
      }
      // 所有答案以数组形式提交
      if (!Array.isArray(obj.userAnswer)) obj.userAnswer = obj.userAnswer ? [obj.userAnswer] : [];
      result.push(obj);
    });
    // 自主学习考试
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
      let res = await exerciseSubmit({
        ...paperes.value,
        questionList: questionList1,
        userExamRecordId: paperes.value.userExamRecordId,
        userUseTime: computeDailyExamTime(),
        userExamTime: paperes.value.userExamTime,
      }).finally(() => {
        setTimeout(() => {
          submitIng.value = false;
          answerSheetRef.value?.close();
          answerSheetRef.value?.submitSuccess();
        }, 500);
      });
      eduStore.setExamConfig({});
      document.removeEventListener('visibilitychange', closeOrRefresh);
      sessionStorage.setItem('examResult', JSON.stringify(res));
      sessionStorage.removeItem('examPaper');
      router.replace({
        path: `/app/student/examResult`,
        query: {
          contentId: route.query.contentId,
          taskId: route.query.taskId,
          freemem: 'true',
        },
      });
      return false;
    }
    // 任务考试
    let res = await examSubmit({
      questionList: result,
      userExamRecordId: paperes.value.userExamRecordId,
      userUseTime: paperes.value.examTime * 60 - userUseTime.value,
      userExamTime: paperes.value.userExamTime,
      examType: route.query.examType,
    }).finally(() => {
      setTimeout(() => {
        submitIng.value = false;
        answerSheetRef.value?.close();
        answerSheetRef.value?.submitSuccess();
      }, 500);
    });
    eduStore.setExamConfig({});
    document.removeEventListener('visibilitychange', closeOrRefresh);
    sessionStorage.setItem('examResult', JSON.stringify(res));
    sessionStorage.removeItem('examPaper');
    if (!back) {
      router.replace({
        path: `/app/student/examResult`,
        query: {
          contentId: route.query.contentId,
          examType: route.query.examType,
          taskId: route.query.taskId,
          examed: 'true',
        },
      });
    } else {
      router.back();
    }
  };
  // 计算每日一练考试用时
  const computeDailyExamTime = () => {
    return (new Date().getTime() - initStartTime.value) / 1000;
  };
</script>

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
    font-weight: 400;
    color: #333333;
    line-height: 30px;
    margin-top: 10px;
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
</style>
