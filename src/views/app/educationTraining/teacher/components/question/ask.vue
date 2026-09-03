<template>
  <div class="question-title">{{ route.query.status === '1' ? currentQuestion.questionSort : currentIdx + 1 }}、问答题（{{ currentQuestion.score }}分） </div>

  <div class="question-text">
    <div>{{ currentQuestion.questionName }}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>
  <div class="question-input">作答：</div>
  <div class="question-option">
    <a-textarea @change="emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: $event.target.value })" 
      :rows="4"
      :disabled="isOver" v-model:value="currentQuestion.userAnswer" placeholder="请输入答案" 
      show-count />
  </div>
  <div class="analysis" v-if="pageState == '1'">
    <div class="answer">答案：{{ currentQuestion.answer }}</div>
    <div class="remark-tit" v-if="currentQuestion.analysis">解析：{{ currentQuestion.analysis }}</div>
    <ImageVies :src="currentQuestion.analysisFile" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ImageVies from './showImagePreview.vue'
  const route = useRoute();
  const isOver = ref(false);
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
  const answer = ref('');
  const onChange = (e) => {
    console.log(e);
    console.log(answer.value);
  };
</script>

<style lang="less" scoped></style>
