<template>
  <BasicDrawer @register="registerRandomDrawer" :title="detailRecord.paperName" width="90%" destroyOnClose>
    <div style="margin-left: 20px">
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAddQuestionBank"> 添加抽题库</a-button>
      <a-table
        bordered
        style="width: 90%; margin: 10px 0"
        v-if="bankDataSource.length > 0"
        :columns="bankColumns"
        :dataSource="bankDataSource"
        ref="table"
        size="small"
        rowKey="id"
        :pagination="false"
      >
        <template #bodyCell="{ column, index }">
          <template v-if="column.dataIndex === 'operation'">
            <a @click="delItemBank(index)">删除</a>
          </template>
        </template>
      </a-table>
      <div v-if="bankDataSource.length > 0">
        <div style="color: #1890ff; margin-top: 15px">试卷设置</div>
        <div class="question-list">
          <div class="question-item">
            <span style="color: #ff4d4f">*</span>
            <span style="margin-right: 5px">单选题（共 {{ radioTotalNum }} 题）：抽取 </span
            ><a-input-number v-model:value="radioNum" style="width: 80px" :min="0" :max="radioTotalNum" :precision="0" @change="scoreChange" />
            <span style="margin: 0 40px 0 5px">题</span>
            <a-input-number
              v-model:value="radioScore"
              style="width: 80px; margin-right: 5px"
              :min="0"
              :precision="0"
              :max="100"
              @change="scoreChange"
            />分/题
            <span class="total-score">共 {{ radioNum * radioScore }} 分</span>
          </div>
          <div class="question-item">
            <span style="color: #ff4d4f">*</span>
            <span style="margin-right: 5px">多选题（共 {{ multiTotalNum }} 题）：抽取 </span
            ><a-input-number v-model:value="multiNum" style="width: 80px" :min="0" :max="multiTotalNum" :precision="0" @change="scoreChange" />
            <span style="margin: 0 40px 0 5px">题</span>
            <a-input-number
              v-model:value="multiScore"
              style="width: 80px; margin-right: 5px"
              :min="0"
              :precision="0"
              :max="100"
              @change="scoreChange"
            />分/题 <span style="margin-right: 5px; margin-left: 60px"><span style="color: #ff4d4f">*</span>漏选得： </span
            ><a-input-number v-model:value="multiMissedScore" style="width: 80px" :min="0" :max="multiScore" :precision="0" />
            <span style="margin: 0 40px 0 5px">分</span>
            <span class="total-score">共 {{ multiNum * multiScore }} 分</span>
          </div>
          <div class="question-item">
            <span style="color: #ff4d4f">*</span>
            <span style="margin-right: 5px">填空题（共 {{ blanksTotalNum }} 题）：抽取 </span
            ><a-input-number v-model:value="blanksNum" style="width: 80px" :min="0" :max="blanksTotalNum" :precision="0" @change="scoreChange" />
            <span style="margin: 0 40px 0 5px">题</span>
            <a-input-number
              v-model:value="blanksScore"
              style="width: 80px; margin-right: 5px"
              :min="0"
              :precision="0"
              :max="100"
              @change="scoreChange"
            />分/题
            <span class="total-score">共 {{ blanksNum * blanksScore }} 分</span>
          </div>
          <div class="question-item">
            <span style="color: #ff4d4f">*</span>
            <span style="margin-right: 5px">判断题（共 {{ judgeTotalNum }} 题）：抽取 </span
            ><a-input-number v-model:value="judgeNum" style="width: 80px" :min="0" :max="judgeTotalNum" :precision="0" @change="scoreChange" />
            <span style="margin: 0 40px 0 5px">题</span>
            <a-input-number
              v-model:value="judgeScore"
              style="width: 80px; margin-right: 5px"
              :min="0"
              :precision="0"
              :max="100"
              @change="scoreChange"
            />分/题
            <span class="total-score">共 {{ judgeNum * judgeScore }} 分</span>
          </div>
          <div class="question-item">
            <span style="color: #ff4d4f">*</span>
            <span style="margin-right: 5px">问答题（共 {{ quizTotalNum }} 题）：抽取 </span
            ><a-input-number v-model:value="quizNum" style="width: 80px" :min="0" :max="quizTotalNum" :precision="0" @change="scoreChange" />
            <span style="margin: 0 40px 0 5px">题</span>
            <a-input-number
              v-model:value="quizScore"
              style="width: 80px; margin-right: 5px"
              :min="0"
              :precision="0"
              :max="100"
              @change="scoreChange"
            />分/题
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
        <div style="text-align: center">
          <a-button type="primary" style="margin-right: 10px" @click="saveRandomPaper">保存</a-button>
          <a-button @click="closeDrawer">取消</a-button>
        </div>
      </div>
    </div>
    <QuestionBankModal @register="registerModal" @select="selectBankOk" />
  </BasicDrawer>
</template>
  <script lang="ts" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { BasicDrawer, useDrawer, useDrawerInner } from '/src/components/Drawer';
import UserDrawer from '../../user/UserDrawer.vue';
import QuestionBankModal from './QuestionBankModal.vue';
import { bankColumns } from './paper.data';
import { savePaper, getPaperDetail } from './paper.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMethods } from '/@/hooks/system/useMethods';
import { message } from 'ant-design-vue';
const emit = defineEmits(['register', 'success']);
const paperId = ref('');
const detailRecord = ref({});
const showFooter = ref(true);
const bankId = ref([]);
const bankDataSource = ref([]);
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

const [registerRandomDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
  detailRecord.value = data;
  paperId.value = data.id;
  resetData();
  if (data.id) {
    if (data.score > 0) {
      // 查询组卷详情
      let res = await getPaperDetail({ id: data.id });
      // 设置数据
      bankId.value = res.randomPaper.questionBankId.split(',');
      bankDataSource.value = res.questionBankList;

      radioNum.value = res.randomPaper.radioNum;
      radioScore.value = res.randomPaper.radioScore;
      multiNum.value = res.randomPaper.multiNum;
      multiScore.value = res.randomPaper.multiScore;
      multiMissedScore.value = res.randomPaper.multiMissedScore;
      blanksNum.value = res.randomPaper.blanksNum;
      blanksScore.value = res.randomPaper.blanksScore;
      judgeNum.value = res.randomPaper.judgeNum;
      judgeScore.value = res.randomPaper.judgeScore;
      quizNum.value = res.randomPaper.quizNum;
      quizScore.value = res.randomPaper.quizScore;
      passScore.value = res.randomPaper.passScore;
      // 计算总分
      if (res.questionBankList.length > 0) {
        radioTotalNum.value = 0;
        multiTotalNum.value = 0;
        blanksTotalNum.value = 0;
        judgeTotalNum.value = 0;
        quizTotalNum.value = 0;

        res.questionBankList.forEach((item) => {
          radioTotalNum.value += Number(item.question1);
          multiTotalNum.value += Number(item.question2);
          blanksTotalNum.value += Number(item.question3);
          judgeTotalNum.value += Number(item.question4);
          quizTotalNum.value += Number(item.question5);
        });
      }
    }
  }
});
const [registerModal, { openModal }] = useModal();
function resetData() {
  bankDataSource.value = [];
  bankId.value = [];
  radioNum.value = 0;
  radioScore.value = 0;
  radioTotalNum.value = 0;
  radioTotalScore.value = 0;
  multiNum.value = 0;
  multiScore.value = 0;
  multiMissedScore.value = 0;
  multiTotalNum.value = 0;
  multiTotalScore.value = 0;
  blanksNum.value = 0;
  blanksScore.value = 0;
  blanksTotalNum.value = 0;
  blanksTotalScore.value = 0;
  judgeNum.value = 0;
  judgeScore.value = 0;
  judgeTotalNum.value = 0;
  judgeTotalScore.value = 0;
  quizNum.value = 0;
  quizScore.value = 0;
  quizTotalNum.value = 0;
  quizTotalScore.value = 0;
  passScore.value = 0;
}
/**
 * 新增
 */
function handleAddQuestionBank() {
  openModal(true, { bankId: bankId.value, data: bankDataSource.value });
}
function selectBankOk(data) {
  bankDataSource.value = data.dataSource;
  bankId.value = data.selectedRowKeys;
  radioNum.value = 0;
  multiNum.value = 0;
  blanksNum.value = 0;
  judgeNum.value = 0;
  quizNum.value = 0;

  if (data.dataSource.length > 0) {
    radioTotalNum.value = 0;
    multiTotalNum.value = 0;
    blanksTotalNum.value = 0;
    judgeTotalNum.value = 0;
    quizTotalNum.value = 0;
    data.dataSource.forEach((item) => {
      radioTotalNum.value += Number(item.question1);

      multiTotalNum.value += Number(item.question2);

      blanksTotalNum.value += Number(item.question3);

      judgeTotalNum.value += Number(item.question4);

      quizTotalNum.value += Number(item.question5);
    });
  }
}
function delItemBank(index) {
  bankDataSource.value.splice(index, 1);
  bankId.value.splice(index, 1);
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
async function saveRandomPaper() {
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
  // 至少一题
  if (radioNum.value + multiNum.value + blanksNum.value + judgeNum.value + quizNum.value == 0) {
    message.error('至少抽取一题！');
    return;
  }
  // 如果有多选题，必须要设置漏选得分
  if (multiNum.value > 0 && (multiMissedScore.value === null || multiMissedScore.value === undefined)) {
    message.error('请设置漏选得分！');
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
  // 及格分不能大于总分
  if (passScore.value > totalScore) {
    message.error('及格分不能大于总分！');
    return;
  }
  let params = {
    questionBankId: bankId.value.join(','),
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
  if (paperId.value) {
    let obj = {
      examPaperId: paperId.value,
      randomPaper: params,
    };
    await savePaper(obj);
    //刷新列表
    emit('success');
  }else{
    let obj = Object.assign({}, detailRecord.value, { randomPaper: params });
    emit('success', obj);
  }
  closeDrawer();
}
</script>
<style lang="less" scoped>
.question-list {
  width: 800px;
}
.question-item {
  position: relative;
  margin: 15px 0;
}
.total-score {
  position: absolute;
  top: 8px;
  right: 0;
  color: #1890ff;
}
.split-line {
  width: 100%;
  height: 1px;
  background-color: #f0f0f0;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>