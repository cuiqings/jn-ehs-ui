<template>
  <div class="paper-wrapper">
    <div class="hd">
      <div class="title">{{ questionnaireInfo.name }}</div>
      <div class="nil">各位同事：</div>
      <div class="instructions">{{ questionnaireInfo.instructions }}</div>
    </div>
    <div class="question-box" v-for="(item, idx) in questionList">
      <Radio :disabled="isDetail" :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 1" />
      <Select :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 2" />
      <QInput :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 3" />
      <Judge :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 4" />
      <Ask :currentIdx="idx" v-model:currentQuestion="questionList[idx]" v-if="item.questionType == 5" />
    </div>
    <div class="btn-box" v-if="!isDetail">
      <div class="btn" v-loading="submitIng" @click="submit(true)">提交</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Select from './question/select.vue';
  import QInput from './question/input.vue';
  import Radio from './question/radio.vue';
  import Judge from './question/judge.vue';
  import Ask from './question/ask.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { ref } from 'vue';
  import { getSurveyQues, submitSurveyQues, queryAnswerInfo } from '/@/views/studyTraining/studentquestionnaire/api'
  import { showSuccessToast, showFailToast } from 'vant';

  const router = useRouter();
  const route = useRoute();
  const questionList = ref<any>([]);
  const questionnaireInfo = ref<any>({});
  const isDetail = ref(false);
  pageInit();
  function pageInit() {
    if(route.query.status) {
      isDetail.value = true;
      queryAnswerInfo({id: route.query.id}).then((res) => { 
        questionnaireInfo.value = res;
        questionList.value = JSON.parse(res.questionList);
        questionList.value.forEach((item: any) => {
          item.userQuestionInfoList = JSON.parse(item.questionJson);
          item.questionJson = JSON.parse(item.questionJson);
        });
      });
    } else {
      getSurveyQues({id: route.query.id}).then((res) => { 
        questionnaireInfo.value = res;
        questionList.value = JSON.parse(res.questionList);
        questionList.value.forEach((item: any) => {
          item.userQuestionInfoList = JSON.parse(item.questionJson);
          item.questionJson = JSON.parse(item.questionJson);
          if(item.questionType == '4'){
            item.questionJson = [{key: '正确', value: '正确'}, {key: '错误', value: '错误'}]
          }
        });
      });
    }
  }

  const submitIng = ref(false);
  // 考试提交
  const submit = async (back) => {
    if (submitIng.value) return;
    let params = {...questionnaireInfo.value};
    let str = '';
    questionList.value.forEach((item: any, idx: number) => { 
      if(!item.userAnswer){
        str = '您有第 ' + (idx + 1) + ' 题没有作答！';
        return;
      }
      if(item.userAnswer && item.userAnswer == '其它' && !item.otherText){
        str = '请补充第' + (idx + 1) + '题的其它选项内容！'
      }
    });
    if(str) {
      showFailToast(str);
      return;
    }
    submitIng.value = true;
    params.questionList = JSON.parse(JSON.stringify(questionList.value));
    params.questionList.forEach((item: any) => { 
      if(item.questionType == 3) {
        item.userAnswer = item.userQuestionInfoList && item.userQuestionInfoList.map(v => v.userAnswer).toString();
      }
    });
    params.questionList = JSON.stringify(params.questionList);
    // 任务考试
    await submitSurveyQues(params).then(res => {
      showSuccessToast('提交成功！');
      setTimeout(() => { 
        router.back();
        submitIng.value = false;
      }, 1000);
    }).catch((err) => {
      showFailToast('提交失败，请联系管理员');
      submitIng.value = false;
    });
  };
</script>

<style lang="less">
  .hd{
    width: 100%;
    height: auto;
    padding: 20px 15px;
    padding-top: 10px;
    padding-bottom: 50px;
    position: relative;
    &::after{ 
      content: '';
      position: absolute;
      width: 800px;
      height: 800px;
      bottom: 0;
      z-index: 1;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 0% 0% 400px 400px;
      background: linear-gradient(0deg, #1f7cf8 0%, #ffffff 30%);
    }
    .title{
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      padding: 10px 0;
      color: #333333;
      z-index: 3;
      position: relative;
    }
    .nil{
      font-size: 16px;
      z-index: 3;
      position: relative;
    }
    .instructions{
      text-indent: 2em;
      color: #383838;
      z-index: 3;
      position: relative;
    }
  }
  .question-box {
    width: 100%;
    height: auto;
    box-sizing: border-box;
  }
  .btn-box{
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 50px 0;
    .btn{
      width: 200px;
      height: 40px;
      background-color: #1890ff;
      color: #fff;
      text-align: center;
      line-height: 45px;
      border-radius: 4px;
    }
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
    margin-bottom: 34px;
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
