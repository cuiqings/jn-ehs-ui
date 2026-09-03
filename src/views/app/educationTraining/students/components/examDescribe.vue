<template>
  <van-popup v-model:show="showBottom" @close="close" round position="bottom" :style="{ height: '348px' }">
    <div class="examinfo">
      <div class="title">考试说明</div>
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
          <div class="value">{{ examConfigInfo.examTime }}分钟</div>
        </div>
      </div>
      <div class="foot">
        <van-button style="width: 45%" @click="showExamRecord" size="small" plain round type="success">考试记录</van-button>
        <van-button v-if="showExam" :loading="loading" style="width: 45%" :disabled="loading" round size="small" type="primary" @click="go"
          >开始考试</van-button
        >
      </div>
    </div>
  </van-popup>
  <ExamRecord ref="examRecordRef" v-if="showRecord" :taskItem="taskItem" v-model:show="showRecord" />
</template>
<script lang="ts" setup>
  import { ref, toRef, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { startExam, examRecord } from '../../index.api';
  import ExamRecord from './emamRecord.vue';
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    canExam: {
      type: Boolean,
      default: false,
    },
    taskItem: {
      type: Object,
      default: () => {},
    },
    examConfigInfo: {
      type: Object,
      default: () => {},
    },
  });
  const loading = ref(false);
  const examMap = { 1: '1', 2: '2', 3: '不限', 4: '及格为止' };
  const examRecordRef = ref(null);
  const showBottom = toRef(props, 'show');
  const router = useRouter();
  const emits = defineEmits(['update:show', 'showExamRecord', 'go']);
  const showRecord = ref(false);
  const showExamRecord = () => {
    showRecord.value = true;
  };
  const showExam = ref(false);

  watch(
    () => props.taskItem,
    (val) => {
      if (val.taskId) {
        examRecord({
          id: props.taskItem?.taskId,
          contentId: props.taskItem?.id,
          examType: props.taskItem?.examType,
        }).then((res) => {
          if (props.taskItem?.source == 0) {
            if (
              res.length == 0 ||
              !res[res.length - 1].passStatus ||
              (res[res.length - 1].passStatus === '1' && props.examConfigInfo.examNum < res.length) ||
              computedCanExam(res, props.examConfigInfo.examNum)
            ) {
              showExam.value = true;
            }
          } else {
            if (computedCanExam(res, props.examConfigInfo.examNum)) {
              showExam.value = true;
            } else {
              showExam.value = false;
            }
          }
        });
      }
    }
  );
  const processing = ref(false);
  const go = () => {
    if (processing.value) return;
    if (props.taskItem?.smsFlag == 1) {
      if(loading.value) return;
      loading.value = true;
      startExam({
        source: props.taskItem.source,
        taskId: props.taskItem?.taskId,
        contentId: props.taskItem?.id,
        examType: props.taskItem?.examType,
      })
        .then((res) => {
          emits('update:show', false);
          router.push(`/app/student/exam?taskId=${props.taskItem?.taskId}&contentId=${props.taskItem?.id}&examType=${props.taskItem?.examType}`);
          sessionStorage.setItem('examPaper', JSON.stringify(res));
          sessionStorage.setItem('identify', 'true');
        })
        .finally(() => {
          setTimeout(() => {
            loading.value = false;
            processing.value = false;
          }, 800);
        });
    } else {
      router.push(
        `/app/student/identify?taskId=${props.taskItem?.taskId}&source=${props.taskItem.source}&contentId=${props.taskItem?.id}&checkCardId=${props.examConfigInfo.checkCardId}`
      );
      processing.value = false;
    }
  };
  const close = () => {
    showExam.value = false;
    emits('update:show', false);
  };

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
      justify-content: flex-start;
      .tit {
        width: 100%;
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        line-height: 32px;
        padding: 0;
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
      position: absolute;
      bottom: 10px;
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
