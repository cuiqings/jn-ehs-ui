<template>
    <BasicModal @register="registerThis" v-bind="$attrs" title="订正确认">
      <div class="number-box">
          <div v-for="(item, i) in questionList" :class="item.userAnswer ? 'act-num-item' : 'num-item'" key="{i}" @click="goQuestion(item, i)">{{
            item.questionSort
          }}</div>
        </div>
      <template #footer>
        <div class="foot">
          <a-button @click="showExamRecord" size="middle" plain round type="success">取消</a-button>
          <a-button round size="middle" type="primary" @click="confirm">确认签字</a-button>
        </div>
      </template>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { correctionMistakes } from '/@/views/app/educationTraining/index.api';
  
    const questionList = ref([]);
    const currentItem = ref<any>({});
    const [registerThis, {closeModal}] = useModalInner(async (item) => {
      currentItem.value = item;
      correctionMistakes({ taskId: item.taskId, contentId: item.contentId }).then((res) => {
        questionList.value = res;
      });
    });
  
    const router = useRouter();
    const showExamRecord = () => {
      closeModal();
    };
  
    // 订正
  const goQuestion = (item, idx) => {
    sessionStorage.setItem('identify', 'true');
    sessionStorage.setItem('examResult', JSON.stringify({
      taskName: '',
      questionList: questionList.value
    }));
    let query = {
      status: 1,
      index: idx,
      taskId: currentItem.value.taskId,
      contentId: currentItem.value.contentId,
      source: 0,
      isReflection: 1 // 考试订正
    };
    router.push({
      path: '/examresult',
      query: query,
    });
  };
  const emit = defineEmits(['confirm']);
  const confirm = () => {
    emit('confirm');
  }
  </script>
  <style lang="less" scoped>
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
  </style>
  