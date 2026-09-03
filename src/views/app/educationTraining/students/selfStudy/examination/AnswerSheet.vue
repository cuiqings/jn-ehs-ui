<template>
  <van-popup position="bottom" round v-model:show="show" :style="{ height: 'auto' }" z-index="299">
    <div class="title">答题卡</div>
    <div class="number-box">
      <template v-if="route.query.status != '1'">
        <div
          
          v-for="(item, i) in questionList"
          :class="{ 'act-num-item': !!item.userAnswer, 'num-item': !item.userAnswer, 'error': !item.correctFlag && route.query.status == '1' }"
          :key="i"
          @click="goQuestion(i)"
          >{{ i + 1 }}</div
        >
      </template>
      <template v-else>
        <div
          v-for="(item, i) in questionList"
          :class="{ 'act-num-item': !!item.userAnswer && item.userAnswer.length > 0, 'num-item': !item.userAnswer || !item.userAnswer.length, 'error': !!item.userAnswer && item.userAnswer.length > 0 && !item.correctFlag }"
          :key="i"
          @click="goQuestion(i)"
          >{{ i + 1 }}</div
        >
      </template>

    </div>
    <div class="btn-box" v-if="route.query.status != '1'">
      <a-button class="confirm-btn" :loading="loading" @click="onSuccess()">提交试卷</a-button>
    </div>
  </van-popup>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const props = defineProps({
    questionList: {
      type: Array,
      default: () => [],
    },
  });

  const emits = defineEmits(['submit', 'goQuestion']);

  const goQuestion = (index: number) => {
    emits('goQuestion', index);
    close();
  };
  const show = ref(false);

  const open = () => {
    console.log(props.questionList);

    show.value = true;
  };

  const close = () => {
    show.value = false;
  };
  const submitSuccess = () => {
    loading.value = false;
  };
  const loading = ref(false);
  const onSuccess = () => {
    loading.value = true;
    emits('submit');
  };
  defineExpose({
    open,
    close,
    submitSuccess
  });
</script>

<style lang="less" scoped>
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
    max-height: 494px;
    overflow-y: auto;
    overflow-x: hidden;
    display: grid;
    row-gap: 20px;
    column-gap: 19px;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    box-sizing: border-box;
    padding: 0px 20px 30px 20px;
    .num-item {
      width: 40px;
      height: 40px;
      background: #1890ff;
      border-radius: 50%;
      font-size: 16px;
      line-height: 40px;
      font-weight: 500;
      text-align: center;
      color: #ffffff;
    }
    .act-num-item {
      width: 40px;
      height: 40px;
      background: #04c877;
      border-radius: 50%;
      font-size: 16px;
      line-height: 40px;
      font-weight: 500;
      text-align: center;
      color: #ffffff;
    }
  }
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
      background: rgba(24, 144, 255, 0.15);
      border-radius: 50%;
      font-size: 16px;
      line-height: 40px;
      font-weight: 500;
      text-align: center;
      color: #1890ff;
    }
    .error {
      background: rgba(245, 34, 45, 0.1);
      color: #f5222d;
      border: none;
    }
  }

  .btn-box {
    width: 100%;
    height: 84px;
    box-sizing: border-box;
    padding: 20px;
    .confirm-btn {
      width: 100%;
      height: 44px;
      box-sizing: border-box;
      background: #1890ff;
      border-radius: 25px;
      font-size: 16px;
      font-weight: 500;
      color: #ffffff;
      border: none;
    }
  }
</style>
