<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="设置分值" width="900px" @cancel="handleCancel" @ok="handleSubmit" destroyOnClose>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="按题型设分" force-render>
        <div>
          <div class="question-list">
            <div class="question-item">
              <span style="color: #1890ff">*</span>
              <span style="margin-right: 5px">单选题： </span>
              <a-input-number
                v-model:value="radioScore"
                style="width: 80px; margin-right: 5px"
                :min="0"
                :max="100"
                :precision="0"
                @change="scoreChange"
              />分/题
              <span class="total-num">共 {{ radioNum }} 题</span>
              <span class="total-score">共 {{ radioNum * radioScore }} 分</span>
            </div>
            <div class="question-item">
              <span style="color: #1890ff">*</span>
              <span style="margin-right: 5px">多选题：</span>
              <a-input-number
                v-model:value="multiScore"
                style="width: 80px; margin-right: 5px"
                :min="0"
                :max="100"
                :precision="0"
                @change="scoreChange"
              />分/题 <span style="margin-right: 5px; margin-left: 60px"><span style="color: #ff4d4f">*</span>漏选得： </span
              ><a-input-number v-model:value="multiMissedScore" style="width: 80px" :min="0" :max="multiScore" :precision="0" />
              <span style="margin: 0 40px 0 5px">分</span>
              <span class="total-num">共 {{ multiNum }} 题</span>
              <span class="total-score">共 {{ multiNum * multiScore }} 分</span>
            </div>
            <div class="question-item">
              <span style="color: #1890ff">*</span>
              <span style="margin-right: 5px">填空题：</span>
              <a-input-number
                v-model:value="blanksScore"
                style="width: 80px; margin-right: 5px"
                :min="0"
                :max="100"
                :precision="0"
                @change="scoreChange"
              />分/题
              <span class="total-num">共 {{ blanksNum }} 题</span>
              <span class="total-score">共 {{ blanksNum * blanksScore }} 分</span>
            </div>
            <div class="question-item">
              <span style="color: #1890ff">*</span>
              <span style="margin-right: 5px">判断题：</span>
              <a-input-number
                v-model:value="judgeScore"
                style="width: 80px; margin-right: 5px"
                :min="0"
                :max="100"
                :precision="0"
                @change="scoreChange"
              />分/题
              <span class="total-num">共 {{ judgeNum }} 题</span>
              <span class="total-score">共 {{ judgeNum * judgeScore }} 分</span>
            </div>
            <div class="question-item">
              <span style="color: #1890ff">*</span>
              <span style="margin-right: 5px">问答题：</span>
              <a-input-number
                v-model:value="quizScore"
                style="width: 80px; margin-right: 5px"
                :min="0"
                :max="100"
                :precision="0"
                @change="scoreChange"
              />分/题
              <span class="total-num">共 {{ quizNum }} 题</span>
              <span class="total-score">共 {{ quizNum * quizScore }} 分</span>
            </div>
          </div>
          <div class="split-line"></div>
          <div class="question-list">
            <div class="question-item">
              <span style="color: #ff4d4f">*</span>
              <span style="margin-right: 5px">及格分 </span
              ><a-input-number
                v-model:value="passScore"
                style="width: 80px"
                :min="0"
                :max="radioNum * radioScore + multiNum * multiScore + blanksNum * blanksScore + judgeNum * judgeScore + quizNum * quizScore"
                :precision="0"
              />
              <span class="total-score"
                >总分：{{
                  radioNum * radioScore + multiNum * multiScore + blanksNum * blanksScore + judgeNum * judgeScore + quizNum * quizScore
                }}
                分</span
              >
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="按试题设分" force-render>
        <div>
          <div class="question-list">
            <div class="question-item" v-for="(item, index) in questionDataSource" :key="item.id">
              <span class="item-name">{{ item.questionName }}</span>
              <span class="total-num" v-if="item.questionType == '1'">单选题</span>
              <span class="total-num" v-if="item.questionType == '2'">多选题</span>
              <span class="total-num" v-if="item.questionType == '3'">填空题</span>
              <span class="total-num" v-if="item.questionType == '4'">判断题</span>
              <span class="total-num" v-if="item.questionType == '5'">问答题</span>
              <div class="total-score">
                <!-- 借用一下question1、question2占位 -->
                <a-input-number
                  v-model:value="item.question1"
                  style="width: 80px; margin-right: 5px"
                  :min="0"
                  :max="100"
                  :precision="0"
                  @change="scoreChange2"
                />分
                <div v-if="item.questionType == '2'" style="display: inline-block"
                  ><span>漏选得： </span
                  ><a-input-number
                    v-model:value="item.question2"
                    style="width: 80px; margin-right: 5px"
                    :min="0"
                    :max="item.question1"
                    :precision="0"
                  />分</div
                >
              </div>
            </div>
          </div>
          <div class="split-line"></div>
          <div class="question-list">
            <div class="question-item">
              <span style="color: #ff4d4f">*</span>
              <span style="margin-right: 5px">及格分 </span
              ><a-input-number v-model:value="passScore" style="width: 80px" :min="0" :max="totalScoreType2" :precision="0" />
              <span class="total-score">总分：{{ totalScoreType2 }} 分</span>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { message } from 'ant-design-vue';
  const emit = defineEmits(['ok', 'register']);
  const questionDataSource: any = ref([]);
  const activeKey = ref('1');
  const radioNum = ref(0);
  const radioScore = ref(0);
  const multiNum = ref(0);
  const multiScore = ref(0);
  const multiMissedScore = ref(0);
  const blanksNum = ref(0);
  const blanksScore = ref(0);
  const judgeNum = ref(0);
  const judgeScore = ref(0);
  const quizNum = ref(0);
  const quizScore = ref(0);
  const passScore = ref(0);
  const totalScoreType2 = ref(0);

  const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
    console.log('useModalInner', data);
    questionDataSource.value = data.questionDataSource;
    questionDataSource.value.forEach((item) => {
      item.question1 = 0;
      item.question2 = 0;
    });
    let fixedPaperObj = data.fixedPaper;
    resetData();
    if (!fixedPaperObj.scoreType) {
      activeKey.value = '1';
    }
    if (fixedPaperObj.scoreType && fixedPaperObj.scoreType == '1') {
      activeKey.value = '1';
      radioNum.value = fixedPaperObj.radioNum;
      radioScore.value = fixedPaperObj.radioScore;
      multiNum.value = fixedPaperObj.multiNum;
      multiScore.value = fixedPaperObj.multiScore;
      multiMissedScore.value = fixedPaperObj.multiMissedScore;
      blanksNum.value = fixedPaperObj.blanksNum;
      blanksScore.value = fixedPaperObj.blanksScore;
      judgeNum.value = fixedPaperObj.judgeNum;
      judgeScore.value = fixedPaperObj.judgeScore;
      quizNum.value = fixedPaperObj.quizNum;
      quizScore.value = fixedPaperObj.quizScore;
      passScore.value = fixedPaperObj.passScore;
    }
    if (fixedPaperObj.scoreType && fixedPaperObj.scoreType == '2') {
      activeKey.value = '2';
      passScore.value = fixedPaperObj.passScore;
      totalScoreType2.value = fixedPaperObj.score;
      questionDataSource.value.forEach((item) => {
        fixedPaperObj.questionScore.forEach((item2) => {
          if (item.id == item2.questionId) {
            item.question1 = item2.score;
            item.question2 = item2.multiMissedScore;
          }
        });
      });
    }
    if (data.questionDataSource.length > 0) {
      radioNum.value = 0;
      multiNum.value = 0;
      blanksNum.value = 0;
      judgeNum.value = 0;
      quizNum.value = 0;
      data.questionDataSource.forEach((item) => {
        if (item.questionType == '1') {
          radioNum.value += 1;
        }
        if (item.questionType == '2') {
          multiNum.value += 1;
        }
        if (item.questionType == '3') {
          blanksNum.value += 1;
        }
        if (item.questionType == '4') {
          judgeNum.value += 1;
        }
        if (item.questionType == '5') {
          quizNum.value += 1;
        }
      });
    }
  });
  // 重置数据
  function resetData() {
    activeKey.value = '1';
    radioNum.value = 0;
    radioScore.value = 0;
    multiNum.value = 0;
    multiScore.value = 0;
    multiMissedScore.value = 0;
    blanksNum.value = 0;
    blanksScore.value = 0;
    judgeNum.value = 0;
    judgeScore.value = 0;
    quizNum.value = 0;
    quizScore.value = 0;
    passScore.value = 0;
    totalScoreType2.value = 0;
  }
  const handleCancel = () => {
    closeModal();
    // 重置勾选
  };
  //提交事件
  function handleSubmit() {
    let params = {};
    if (activeKey.value == '1') {
      let totalScore =
        radioNum.value * radioScore.value +
        multiNum.value * multiScore.value +
        blanksNum.value * blanksScore.value +
        judgeNum.value * judgeScore.value +
        quizNum.value * quizScore.value;
      if (radioScore.value == 0 && multiScore.value == 0 && blanksNum.value == 0 && judgeNum.value == 0 && quizNum.value == 0) {
        message.error('请设置至少一种题型的分值！');
        return;
      }
      if (totalScore > 1000) {
        message.error('总分不能超过1000分');
        return;
      }
      // 至少一分
      if (
        radioNum.value * radioScore.value +
          multiNum.value * multiScore.value +
          blanksNum.value * blanksScore.value +
          judgeNum.value * judgeScore.value +
          quizNum.value * quizScore.value ==
        0
      ) {
        message.error('总分不能为0分！');
        return;
      }
      if (passScore.value == 0) {
        message.error('及格分不能为0分！');
        return;
      }

      params = {
        scoreType: '1',
        score: totalScore,
        radioNum: radioNum.value,
        radioScore: radioScore.value,
        radioTotalScore: radioNum.value * radioScore.value,
        multiNum: multiNum.value,
        multiScore: multiScore.value,
        multiTotalScore: multiNum.value * multiScore.value,
        multiMissedScore: multiMissedScore.value,
        blanksNum: blanksNum.value,
        blanksScore: blanksScore.value,
        blanksTotalScore: blanksNum.value * blanksScore.value,
        judgeNum: judgeNum.value,
        judgeScore: judgeScore.value,
        judgeTotalScore: judgeNum.value * judgeScore.value,
        quizNum: quizNum.value,
        quizScore: quizScore.value,
        passScore: passScore.value,
        quizTotalScore: quizNum.value * quizScore.value,
      };
    } else {
      let totalScore = 0;
      questionDataSource.value.forEach((item) => {
        if (item.question1 == 0) {
          message.error('请设置所有题的分值！');
          return;
        }
        totalScore += item.question1;
      });
      if (totalScore > 1000) {
        message.error('总分不能超过1000分');
        return;
      }
      if (passScore.value == 0) {
        message.error('及格分不能为0分！');
        return;
      }
      let questionScore = [];
      questionScore = questionDataSource.value.map((item) => {
        return {
          questionId: item.id,
          score: item.question1,
          multiMissedScore: item.question2,
        };
      });
      params = {
        scoreType: '2',
        score: totalScore,
        passScore: passScore.value,
        questionScore: questionScore,
      };
    }

    //刷新列表
    emit('ok', { fixedPaper: params });
    //关闭弹窗
    closeModal();
    setModalProps({ confirmLoading: false });
    // 重置数据
  }
  function scoreChange() {
    let totalScore =
      radioNum.value * radioScore.value +
      multiNum.value * multiScore.value +
      blanksNum.value * blanksScore.value +
      judgeNum.value * judgeScore.value +
      quizNum.value * quizScore.value;
    if (totalScore > 1000) {
      message.error('总分不能超过1000分');
      return;
    }
  }
  function scoreChange2() {
    // 求item.question1 的总和
    let totalScore = 0;
    questionDataSource.value.forEach((item) => {
      totalScore += item.question1;
    });
    totalScoreType2.value = totalScore;
    if (totalScore > 1000) {
      message.error('总分不能超过1000分');
      return;
    }
  }
</script>
<style lang="less" scoped>
  .question-list {
    width: 800px;
    margin-left: 20px;
  }
  .question-item {
    position: relative;
    margin: 15px 0;
  }
  .total-score {
    position: absolute;
    top: 8px;
    right: 0;
  }
  .total-num {
    position: absolute;
    top: 8px;
    right: 320px;
  }
  .item-name {
    // 超过一行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 300px;
    display: inline-block;
  }
  .split-line {
    width: 100%;
    height: 1px;
    background-color: #f0f0f0;
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>
