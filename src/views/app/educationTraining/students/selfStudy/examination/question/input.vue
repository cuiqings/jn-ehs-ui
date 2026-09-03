<template>
  <div class="question-title">{{ route.query.status === '1' ? currentQuestion.questionSort : currentIdx + 1 }}、填空题 </div>

  <div class="question-text">
    <div>{{ currentQuestion.questionName }}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>
  <div class="question-input">作答：</div>
  <div class="question-option" v-for="item in currentQuestion.userQuestionInfoList" :key="item.key">
    <a-textarea
      :disabled="isOver"
      placeholder="请输入答案"
      @change="emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: $event.target.value })"
      v-model:value="item.userAnswer"
      show-count
    />
  </div>
  <div class="analysis" v-if="pageState == '1'">
    <div class="result"><span class="c-red" v-if="currentQuestion.userAnswer && currentQuestion.userAnswer.length > 0">回答{{ currentQuestion.correctFlag ? '正确' : '错误'}}</span></div>
    <div class="answer">答案：{{ currentQuestion.answer }}</div>
    <div class="remark-tit">解析：{{ currentQuestion.analysis }}</div>
    <ImageVies :src="currentQuestion.analysisFile" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ImageVies from './showImagePreview.vue'
  const route = useRoute();
  const isOver = ref(false);
  const answer = ref('');
  const props = defineProps({
    currentIdx: {
      type: Number,
      default: 0,
    },
    currentQuestion: {
      type: Object,
      default: () => ({}),
    },
  });

  const pageState = ref(route.query.status as string);
  if (pageState.value == '1') {
    isOver.value = true;
  }
  
  const emits = defineEmits(['update:currentQuestion']);
  const onChange = (e) => {
    console.log(e);
    console.log(answer.value);
  };
</script>

<style lang="less" scoped></style>
