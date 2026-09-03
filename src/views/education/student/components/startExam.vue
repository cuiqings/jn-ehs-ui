<template>
  <BasicModal @cancel="cancel" @register="registerThis" v-bind="$attrs" title="考试说明">
    <div class="examinfo">
      <div class="result-box">
        <div class="item">
          <div class="tit">试卷总分</div>
          <div class="value">{{ examConfigInfo.score }}分</div>
        </div>
        <div class="item">
          <div class="tit">及格分</div>
          <div class="value">{{ examConfigInfo.passScore }}分</div>
        </div>
        <div class="item">
          <div class="tit">可考次数</div>
          <div class="value">{{ { 1: '1次', 2: '2次', 3: '不限', 4: '及格为止' }[examConfigInfo.examNum] }}</div>
        </div>
        <div class="item">
          <div class="tit">考试时间</div>
          <div class="value">{{ examConfigInfo.examTime }}分</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="foot">
        <a-button @click="showExamRecord" size="middle" plain round type="success">考试记录</a-button>
        <a-button v-if="canExam" :loading="loading" :disabled="loading" round size="middle" type="primary" @click="go">开始考试</a-button>
      </div>
    </template>
  </BasicModal>
  <ExamRecord @register="register" />
  <Identify @register="registerI" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useModal, BasicModal, useModalInner } from '/@/components/Modal';
  import { examConfig, trainExamConfig, startExam, examRecord } from '/@/views/app/educationTraining/index.api';
  import Identify from './identify.vue';
  import ExamRecord from './examRecord.vue';
  import { useEduStore } from '/@/store/modules/education';
  const [register, { openModal }] = useModal();
  const [registerI, { openModal: openModalI }] = useModal();

  const eduStore = useEduStore();
  const examConfigInfo = ref<any>({});
  const currentItem = ref<any>(0);
  const canExam = ref(false);
  const examMap = { 1: '1', 2: '2', 3: '不限', 4: '及格为止' };
  const loading = ref(false);
  const examType = ref('');
  const [registerThis, { closeModal }] = useModalInner(async (item) => {
    currentItem.value = item;
    examType.value = item.examType;
    let record = await examRecord({ id: item.taskId, contentId: item.contentId, examType: item.examType });
    if (item.source == 1) {
      currentItem.value.examType = 8;
      examConfig({ id: item.taskId }).then((res) => {
        examConfigInfo.value = res;
        eduStore.setExamConfig(res);
        if (computedCanExam(record, res.examNum)) {
          canExam.value = true;
        } else {
          canExam.value = false;
        }
      });
    } else {
      let res = await trainExamConfig({ id: item.taskId, contentId: item.contentId, examType: item.examType });
      examConfigInfo.value = res;
      eduStore.setExamConfig(res);
      if (record.length == 0 || (computedCanExam(record, res.examNum) && record[record.length - 1].passStatus !== '0')) {
        canExam.value = true;
      } else {
        canExam.value = false;
      }
      if (item.examType == 1) canExam.value = true;
    }
  });
  const computedCanExam = (record, tag) => {
    let res = examMap[tag];
    let passStatus = record && record.length > 0 ? record.some((item) => item.passStatus == 0) : false;
    if (res == '不限') {
      return true;
    }
    if (res == '及格为止') {
      return !passStatus;
    }
    if (res == '1' || res == '2') {
      if (passStatus) {
        return false;
      }
      if (record && record.length && res <= record.length) {
        return false;
      }
      return true;
    }
  };

  const router = useRouter();
  const showExamRecord = () => {
    openModal(true, currentItem.value);
  };

  const go = () => {
    if (loading.value) return; // 如果正在加载则直接返回
    loading.value = true;
    if (currentItem.value?.smsFlag == 1) {
      startExam({
        source: currentItem.value.source,
        taskId: currentItem.value.taskId,
        contentId: currentItem.value.contentId,
        examType: examType.value,
      }).then((res) => {
        router.push(
          `/exam?taskId=${currentItem.value.taskId}&source=${currentItem.value.source}&contentId=${currentItem.value.contentId}&examType=${currentItem.value.examType}`
        );
        sessionStorage.setItem('examPaper', JSON.stringify(res));
        sessionStorage.setItem('identify', 'true');
        closeModal();
      }).finally(() => {
        setTimeout(() => {
          loading.value = false;
        }, 800);
      })
    } else {
      openModalI(true, { ...currentItem.value, ...examConfigInfo.value });
    }
  };

  const cancel = () => {
    canExam.value = false;
  };
</script>
<style lang="less" scoped>
  .examinfo {
    .title {
      width: 100%;
      height: auto;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 16px;
      box-sizing: border-box;
      padding: 30px 20px;
    }
    .result-box {
      width: 100%;
      height: auto;
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      box-sizing: border-box;
      padding: 0 20px;
      position: relative;
    }
    .item {
      height: auto;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 10px 16px;
      background: #f6f6f6;
      border-radius: 8px;
      .tit {
        width: 100%;
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        line-height: 32px;
      }
      .value {
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: #1890ff;
        line-height: 32px;
      }
    }
    .foot {
      width: 100%;
      padding: 0 20px;
      display: flex;
      justify-content: space-around;
    }
    .num-sheet {
      width: 100%;
      display: grid;
      row-gap: 20px;
      column-gap: 19px;
      padding: 0 16px;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      .num-item {
        width: 40px;
        height: 40px;
        background: #ee0a24;
        border-radius: 50%;
        font-size: 16px;
        line-height: 40px;
        font-weight: 500;
        text-align: center;
        color: #fff;
      }
    }
  }
</style>
