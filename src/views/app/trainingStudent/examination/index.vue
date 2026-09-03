<template>
  <div class="paper-wrapper">
    <div class="question-box">
      <div class="time-down">
        <!-- <img src="{clockIcon}" /> -->
        {{ remainingTime.hr > 0 ? remainingTime.hr + '时' : '' }}
        {{ remainingTime.min }}分{{ remainingTime.sec }} 秒
      </div>
      <Choice :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.type === 1" />
      <Select :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.type === 2" />
      <Judge :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.type === 3" />
      <Ask :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.type === 4" />
      <QInput :currentIdx="currentQuestionIndex" v-model:currentQuestion="currentQuestion" v-if="currentQuestion.type === 5" />
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
  <AnswerSheet :questionList="questionList" @goQuestion="goQuestion" :currentIdx="currentQuestionIndex" ref="answerSheetRef" />
</template>

<script lang="ts" setup>
  import { OrderedListOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
  import AnswerSheet from '../components/AnswerSheet.vue';
  import Choice from '../components/question/choice.vue';
  import Select from '../components/question/select.vue';
  import QInput from '../components/question/input.vue';
  import Judge from '../components/question/judge.vue';
  import Ask from '../components/question/ask.vue';
  import { ref, watchEffect } from 'vue';

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('页面不可见');
    } else {
      console.log('页面可见');
    }
  });

  const answerSheetRef = ref<InstanceType<typeof AnswerSheet> | null>(null);
  const questionList = ref<any>([{ type: 1 }, { type: 2, answer: [] }, { type: 3 }, { type: 4 }, { type: 5 }]);
  const currentQuestionIndex = ref<number>(0);
  const currentQuestion = ref<any>(questionList.value[currentQuestionIndex.value]);
  const remainingTime = ref<any>({
    day: 0,
    hr: 0,
    min: 0,
    sec: 0,
  });

  const timer = ref<any>(null);
  const countdown = (timestamp: number, recordId: number, method: string) => {
    const today: any = new Date();
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
    }, 1000);
  };
  const finish = (recordId: number, method: string) => {
    clearInterval(timer.value);
    timer.value = null;
    if (method === 'submit') {
      //提交
    } else {
      //超时
    }
  };

  countdown(new Date().getTime() + 1000 * 60 * 60 * 3, 1, 'submit');

  watchEffect(() => {
    console.log(currentQuestion.value);
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
    if (currentQuestionIndex.value === questionList.value.length - 1) return;
    currentQuestionIndex.value++;
    currentQuestion.value = questionList.value[currentQuestionIndex.value];
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
</style>
