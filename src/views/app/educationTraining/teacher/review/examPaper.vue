<template>
    <div class="result" v-loading="loading">
        <div class="list" v-if="detailInfo.paperContent">
          <template v-for="(currentQuestion, idx) in detailInfo.paperContent.questionList">
              <Radio :currentIdx="idx" :currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 1" />
              <Select :currentIdx="idx" :currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 2" />
              <QInput :currentIdx="idx" :currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 3" />
              <Judge :currentIdx="idx" :currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 4" />
              <Ask :currentIdx="idx" :currentQuestion="currentQuestion" v-if="currentQuestion.questionType == 5" />
          </template>
        </div>
        <div class="list-box" v-if="detailInfo.questionBankList">
          <ul class="questionku-box" v-for="(item, idx) in detailInfo.questionBankList" @click="go(item)">
              <li><span>题库名称:</span>{{ item.name }}</li>
              <li><span>分类:</span>{{ item.categoryName }}</li>
              <li><span>创建人:</span>{{ item.createUser }}</li>
              <li><span>单选题:</span>{{ item.question1 || 0 }}</li>
              <li><span>多选题:</span>{{ item.question2 || 0 }}</li>
              <li><span>填空题:</span>{{ item.question3 || 0 }}</li>
              <li><span>判断题:</span>{{ item.question4 || 0 }}</li>
              <li><span>问答题:</span>{{ item.question5 || 0 }}</li>
          </ul>
        </div>

    </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { viewExam } from '../../index.api';
  import { detailList } from '/@/views/education/exam/questions/questions.api'
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showImagePreview } from 'vant';
  import Select from '../components/question/select.vue';
  import QInput from '../components/question/input.vue';
  import Radio from '../components/question/radio.vue';
  import Judge from '../components/question/judge.vue';
  import Ask from '../components/question/ask.vue';
  const route = useRoute();
  const router = useRouter();
  const loading = ref(false);
  const questionBankList = ref<any>([]);
  const detailInfo = ref<any>({});
  const userUseTime = ref('');
  pageInit();
  async function pageInit() {
    console.log(route.query);
    loading.value = true;
    await viewExam({ id: route.query.id }).then((res: any) => {
        console.log(res);
        detailInfo.value = res;
        if(res.questionBankList){
          detailList({
            questionBankId: res.questionBankList[0].id,
            pageSize: 10000,
            pageNo: 1
          }).then(res => {
            questionBankList.value = res.records;
          })
        }

    });
    loading.value = false;
  }

  const imagePreview = (url: string) => {
    showImagePreview([getFileAccessHttpUrl(url)]);
  };
  const go = (item: any) => { 
    router.replace({
      path: '/app/teacher/questionBank',
      query: { questionBankId: item.id, status: 1 }
    })
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
  .list-box{
    width: 100%;
    padding: 10px 13px;
  }
  .questionku-box{
    width: 100%;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
    li{
      display: flex;
    }
    span{
      width: 70px;
      text-align: left;
    }
  }
</style>
