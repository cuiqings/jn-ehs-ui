<template>
  <BasicDrawer style="position: relative" @register="registerRandomDrawer" :title="detailRecord.paperName" width="90%" destroyOnClose>
    <template #footer>
      <div class="total-pass">
        <span v-if="passScore > 0">及格分：{{ passScore }} 分</span>
        <span v-if="scoreTotal > 0">总分：{{ scoreTotal }} 分</span>
      </div>
      <a-button style="margin-top: 10px" type="primary" @click="saveFixedPaper">保存试卷</a-button>
    </template>
    <div class="fixed-container">
      <div class="left">
        <a-button class="fixed-btn" type="primary" @click="handleAddQuestions"> 添加试题</a-button>
        <a-button class="fixed-btn fixed-btn-1" @click="handleSetScore">设置分值</a-button>
        <div class="number-list">
          <div class="number-item" v-for="(item, index) in questionDataSource" @click="goQuestion(index)"> {{ index + 1 }} </div>
        </div>
      </div>
      <div class="right" id="question-content">
        <div class="question-list">
          <div class="question-item" :id="'question' + index" v-for="(item, index) in questionDataSource" :key="item.id">
            {{ index + 1 }}.
            <span v-if="item.questionType == 1">单选题 <span v-if="fixedPaper.radioScore">({{fixedPaper.radioScore}})</span></span>
            <span v-if="item.questionType == 2">多选题 <span v-if="fixedPaper.multiScore">({{fixedPaper.multiScore}})</span></span>
            <span v-if="item.questionType == 3">填空题 <span v-if="fixedPaper.blanksScore">({{fixedPaper.blanksScore}})</span></span>
            <span v-if="item.questionType == 4">判断题 <span v-if="fixedPaper.judgeScore">({{fixedPaper.judgeScore}})</span></span>
            <span v-if="item.questionType == 5">问答题 <span v-if="fixedPaper.quizScore">({{fixedPaper.quizScore}})</span></span>
            <div>{{ item.questionName }}</div>
            <JImageUpload :disabled="true" text="" v-model:value="item.questionNameFile" />
            <div v-for="(item1, index1) in item.questionList" :key="item.key">
              <div style="position: relative">
                <div style="display: inline-block" v-if="(item.questionType == '1' || item.questionType == '2') && (item1.value || item1.file)">
                  <img
                    v-if="item.answer.split(',').includes(item1.key)"
                    class="circle-btn-active"
                    src="/@/assets/images/exam/icon-adopt.png"
                    alt=""
                  />
                  <span v-else class="circle-btn"></span>
                </div>
                <span v-if="item.questionType == '5'">关键词</span>
                <span v-if="item.questionType == '3'">空</span>
                <span v-if="(item.questionType == '1' || item.questionType == '2') && (item1.value || item1.file)">
                  {{ item1.key }}
                </span>
                <span v-if="item.questionType == '3' || item.questionType == '5'">：</span
                ><span v-if="(item.questionType == '1' || item.questionType == '2') && (item1.value || item1.file)">.</span> {{ item1.value }}
                <JImageUpload
                  v-if="(item.questionType == '1' || item.questionType == '2') && item1.file"
                  :disabled="true"
                  text=""
                  v-model:value="item1.file"
                />
              </div>
            </div>
            <div v-if="item.questionType == '4'">
              <div>
                <img v-if="item.answer == '正确'" class="circle-btn-active" src="/@/assets/images/exam/icon-adopt.png" alt="" />
                <span v-else class="circle-btn"></span> A.正确</div
              >
              <div>
                <img v-if="item.answer == '错误'" class="circle-btn-active" src="/@/assets/images/exam/icon-adopt.png" alt="" />
                <span v-else class="circle-btn"></span> B.错误</div
              >
            </div>
            <div class="action-btn">
              <a-button type="link" :disabled="index == questionDataSource.length - 1" @click="downItem(item, index)"
                ><arrow-down-outlined
              /></a-button>
              <a-button type="link" :disabled="index == 0" @click="upItem(item, index)"><arrow-up-outlined /></a-button>
              <a-button type="link" @click="delItemBank(index)">删除</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <QuestionsModal @register="registerModal" @select="selectQuestionOk" />
    <SetScoreModal @register="registerSetScoreModal" @ok="setScoreOk" />
  </BasicDrawer>
</template>
  <script lang="ts" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { BasicDrawer, useDrawer, useDrawerInner } from '/src/components/Drawer';
import UserDrawer from '../../user/UserDrawer.vue';
import QuestionsModal from './QuestionsModal.vue';
import SetScoreModal from './SetScoreModal.vue';
import { bankColumns } from './paper.data';
import { savePaper, getPaperDetail } from './paper.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMethods } from '/@/hooks/system/useMethods';
import { message } from 'ant-design-vue';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { JImageUpload } from '/@/components/Form';

const emit = defineEmits(['register', 'success']);
const paperId = ref('');
const detailRecord = ref({});
const showFooter = ref(true);
const questionId = ref([]);
const questionDataSource = ref([]);
const radioNum = ref(0);
const radioScore = ref(0);
const radioTotalNum = ref(0);
const radioTotalScore = ref(0);
const multiNum = ref(0);
const multiScore = ref(0);
const multiMissedScore = ref(0);
const multiTotalNum = ref(0);
const multiTotalScore = ref(0);
const blanksNum = ref(0);
const blanksScore = ref(0);
const blanksTotalNum = ref(0);
const blanksTotalScore = ref(0);
const judgeNum = ref(0);
const judgeScore = ref(0);
const judgeTotalNum = ref(0);
const judgeTotalScore = ref(0);
const quizNum = ref(0);
const quizScore = ref(0);
const quizTotalNum = ref(0);
const quizTotalScore = ref(0);
const passScore = ref(0);
const fixedPaper = ref({});
const scoreTotal = ref(0);

const [registerRandomDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
  console.log('registerRandomDrawer', data);
  detailRecord.value = data;
  fixedPaper.value = {};
  scoreTotal.value = 0;
  passScore.value = 0;
  questionDataSource.value = [];
  if (data.id) {
    paperId.value = data.id;
    if (data.score > 0) {
      // 查询组卷详情
      let res = await getPaperDetail({ id: data.id });
      console.log('getPaperDetail', res);
      // 设置数据
      fixedPaper.value = res.fixedPaper;
      scoreTotal.value = res.fixedPaper.score;
      passScore.value = res.fixedPaper.passScore;
      questionDataSource.value = res.questionList;
    }
  }
});
const [registerModal, { openModal }] = useModal();
const [registerSetScoreModal, { openModal: openSetScoreModal }] = useModal();

/**
 * 新增
 */
function handleAddQuestions() {
  openModal(true, { questionId: questionId.value, data: questionDataSource.value });
}
function selectQuestionOk(data) {
  console.log('selectQuestionOk', data);
  questionDataSource.value = data.dataSource;
  questionId.value = data.selectedRowKeys;
  if (data.dataSource.length > 0) {
    radioTotalNum.value = 0;
    multiTotalNum.value = 0;
    blanksTotalNum.value = 0;
    judgeTotalNum.value = 0;
    quizTotalNum.value = 0;

    data.dataSource.forEach((item) => {
      if (!item.question1) {
        item.question1 = 0;
      }
      radioTotalNum.value += Number(item.question1);
      if (!item.question2) {
        item.question2 = 0;
      }
      multiTotalNum.value += Number(item.question2);
      if (!item.question3) {
        item.question3 = 0;
      }
      blanksTotalNum.value += Number(item.question3);
      if (!item.question4) {
        item.question4 = 0;
      }
      judgeTotalNum.value += Number(item.question4);
      if (!item.question5) {
        item.question5 = 0;
      }
      quizTotalNum.value += Number(item.question5);
    });
  }
}
function delItemBank(index) {
  questionDataSource.value.splice(index, 1);
  questionId.value.splice(index, 1);
}
function scoreChange() {
  let totalScore =
    radioNum.value * radioScore.value +
    multiNum.value * multiScore.value +
    blanksNum.value * blanksScore.value +
    judgeNum.value * judgeScore.value +
    quizNum.value * quizScore.value;
  if (totalScore > 100) {
    message.error('总分不能超过100分');
    return;
  }
}
async function saveFixedPaper() {
  if (questionDataSource.value.length == 0) {
    message.error('请先添加试题！');
    return;
  }
  if (!fixedPaper.value.score) {
    message.error('请设置分值！');
    return;
  }
  let questionList = [];
  questionDataSource.value.map((item, index) => {
    questionList.push({
      questionId: item.id,
      sort: index + 1,
    });
  });
  fixedPaper.value.questionList = questionList;
  if (paperId.value) {
    let params = {
      examPaperId: paperId.value,
      fixedPaper: fixedPaper.value,
    };
    console.log('savePaper', params);
    await savePaper(params);
    //刷新列表
    emit('success');
  } else {
    let params = Object.assign({}, detailRecord.value, { fixedPaper: fixedPaper.value });
    emit('success', params);
  }
  closeDrawer();
}
function upItem(record, index) {
  let temp = questionDataSource.value[index - 1];
  questionDataSource.value[index - 1] = record;
  questionDataSource.value[index] = temp;
}
function downItem(record, index) {
  let temp = questionDataSource.value[index + 1];
  questionDataSource.value[index + 1] = record;
  questionDataSource.value[index] = temp;
}
// 实现点击跳转到对应的题目
function goQuestion(index) {
  console.log('index', index);
  var el = document.getElementById(`question${index}`);
  if (!el) {
    return;
  }
  const doEl: any = document.getElementById('question-content');
  setTimeout(() => {
    doEl.scrollTo({
      behavior: 'smooth',
      top: el.offsetTop - 84,
    });
  }, 100);
}
function handleSetScore() {
  if (questionDataSource.value.length == 0) {
    message.error('请先添加试题！');
    return;
  }
  openSetScoreModal(true, { questionDataSource: questionDataSource.value, fixedPaper: fixedPaper.value || {} });
}
function setScoreOk(data) {
  console.log('setScoreOk', data);
  fixedPaper.value = data.fixedPaper;
  scoreTotal.value = data.fixedPaper.score;
  passScore.value = data.fixedPaper.passScore;

  console.log('fixedPaper', fixedPaper.value);
}
</script>
<style lang="less" scoped>
.fixed-container {
  width: 100%;
  height: calc(100% - 60px);
  display: flex;
  flex-direction: row;
  background: #f0f2f5;
  .left {
    width: 290px;
    height: 100vh;
    background: #ffffff;
    box-sizing: border-box;
    padding: 24px 30px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .right {
    flex: 1;
    height: 100vh;
    box-sizing: border-box;
    padding: 24px;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
.split-line {
  width: 100%;
  height: 1px;
  background-color: #f0f0f0;
  margin-top: 20px;
  margin-bottom: 20px;
}
.fixed-btn {
  display: block;
  width: 240px;
  margin: 0 auto;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
}
.fixed-btn-1 {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  margin-top: 24px;
  border: none;
}
.number-list {
  width: 100%;
  height: auto;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  padding: 50px 0;
  box-sizing: border-box;
  .number-item {
    width: 30px;
    height: 30px;
    background: rgba(24, 144, 255, 0.08);
    border-radius: 6px;
    font-size: 16px;
    line-height: 30px;
    font-weight: 500;
    text-align: center;
    color: #1890ff;
    cursor: pointer;
  }
}
.question-list {
  .question-item {
    width: 100%;
    height: auto;
    box-sizing: border-box;
    background: #ffffff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    position: relative;
  }
}
.action-btn {
  position: absolute;
  right: 24px;
  top: 24px;
}
.top-save-btn {
  position: absolute;
  right: 24px;
  top: 24px;
}
.circle-btn-active {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 5px;
}
.circle-btn {
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  margin-right: 5px;
}
.total-pass {
  position: absolute;
  right: 158px;
  bottom: 27px;
  font-size: 16px;
  color: #1890ff;
  span {
    margin-right: 30px;
  }
}
</style>