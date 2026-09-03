<template>
  <BasicModal @register="registerThis" v-bind="$attrs" title="考试记录">
    <div class="main">
      <div class="record-item" v-for="item in recordList">
        <div class="date">{{ item.taskName }}</div>
        <div class="status"><i class="error"></i>{{ item.passStatus == 0 ? '合格' : '不合格' }}</div>
        <span>{{ item.score }}分</span>
        <span style="color: #1989fa;cursor: pointer;" @click="go(item)">查看</span>
      </div>
    </div>
    <template #footer></template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { examRecord } from '/@/views/app/educationTraining/index.api';
  import { useRoute, useRouter } from 'vue-router';
  const route = useRoute();
  const router = useRouter();

  interface Record {
    examTaskName: string;
    passStatus: number;
    taskId: string;
    score: number;
  }

  const recordList = ref<Array<Record>>([]);
  const currentItem = ref<any>({})
  const [registerThis, {closeModal}] = useModalInner((item) => {
    currentItem.value = item;
    examRecord({ id: item.taskId, contentId: item.contentId, examType: item.examType }).then((res) => {
      recordList.value = res;
    });
  });

  const go = (item) => {
    sessionStorage.setItem('identify', 'true');
    sessionStorage.setItem('examResult', JSON.stringify(item.userExamContent));
    let id = item.taskId || item.userExamContent.taskId || route.query.taskId || currentItem.value.taskId;
    closeModal();
    router.replace(`/examresult?status=1&taskId=${id}&createTime=${item.createTime}&source=${route.query.source || currentItem.value.source}&contentId=${route.query.contentId || currentItem.value.contentId}`);
  };
</script>
<style lang="less" scoped>
  .main {
    width: 100%;
    height: 600px;
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
