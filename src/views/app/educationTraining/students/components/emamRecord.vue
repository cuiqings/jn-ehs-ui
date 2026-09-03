<template>
  <van-popup position="bottom" round v-model:show="showRecord" @close="$emit('update:show', false)" :style="{ height: '400px' }">
    <div class="record">
      <div class="record-title">考试记录</div>
      <div class="main">
        <div class="record-item" v-for="item in recordList">
          <div class="left">
            <div class="date">{{ item.taskName }}</div>
            <div class="status"><i class="error"></i>{{ item.passStatus === '0' ? '合格' : '不合格' }}</div>
          </div>
          <div class="right">
            {{ item.score }}分
            <span style="color: #1989fa" @click="go(item)">明细</span>
          </div>
        </div></div
      >
    </div>
  </van-popup>
</template>
<script lang="ts" setup>
  import { examRecord } from '../../index.api';
  import { ref, toRef, watch } from 'vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();

  const props = defineProps({
    taskItem: {
      type: Object,
      default: () => {},
    },
    show: {
      type: Boolean,
      default: false,
    },
  });
  const recordList = ref([]);

  pageInit();
  function pageInit() {
    examRecord({ 
      id: props.taskItem.taskId,
      contentId: props.taskItem?.id,
      examType: props.taskItem?.examType,
    }).then((res) => {
      console.log(res);
      recordList.value = res;
    });
  }
  const showRecord = toRef(props, 'show');
  const go = (item) => {
    sessionStorage.setItem('identify', 'true');
    sessionStorage.setItem('examResult', JSON.stringify(item.userExamContent));
    router.push('/app/student/exam?status=1&taskId=' + item.taskId)
  };
</script>
<style lang="less" scoped>
  .record {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
  }
  .record-title {
    width: 100%;
    height: auto;
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.88);
    line-height: 16px;
    box-sizing: border-box;
    padding: 30px 20px;
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
    .left {
      width: auto;
      display: flex;
      height: 22px;
      align-items: center;
      .date {
        height: 22px;
        width: 170px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 22px;
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
    .right {
      width: auto;
      height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.88);
      line-height: 22px;
      span {
        padding-left: 15px;
      }
    }
  }
</style>
