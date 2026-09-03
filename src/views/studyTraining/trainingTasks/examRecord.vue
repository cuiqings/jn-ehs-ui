<template>
  <BasicModal :canFullscreen="false" :z-index="9000" @register="registerThis" v-bind="$attrs" title="考试记录">
    <div class="main">
      <div class="record-item" v-for="(item, index) in recordList" :key="index">
        <div class="date">{{ item.taskName }}</div>
        <div class="status"><i class="error"></i>{{ item.passStatus == 0 ? '合格' : '不合格' }}</div>
        <span>{{ item.score }}分</span>
        <span style="color: #1989fa; cursor: pointer" @click="go(item)">查看</span>
      </div>
    </div>
    <template #footer></template>
  </BasicModal>
  <ExamResult @register="register" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useModal, BasicModal, useModalInner } from '/@/components/Modal';
  import ExamResult from './examResult.vue';
  const [register, { openModal }] = useModal();
  interface Record {
    examTaskName: string;
    passStatus: number;
    taskId: string;
    score: number;
  }

  const recordList: any = ref<Array<Record>>([]);
  const [registerThis] = useModalInner((item) => {
    recordList.value = item;
  });

  const go = (item: Record) => {
    openModal(true, { title: '考试结果', record: item });
  };
</script>
<style lang="less" scoped>
  .main {
    width: 100%;
    height: 400px;
    overflow-y: auto;
    padding: 0 16px;
  }
  .record-item {
    width: 100%;
    height: 44px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding-bottom: 20px;
    .date {
      height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.88);
      line-height: 22px;
      margin-right: 40px;
    }
    .status {
      width: 70px;
      height: 22px;
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.88);
      line-height: 22px;
      .error {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin-right: 8px;
        background: #1890ff;
      }
    }
  }
</style>
