<template>
  <div class="question-title">
    <span>{{ currentIdx + 1 }}、问答题</span>
  </div>
  <div class="question-text">
    <div>{{ currentQuestion.questionName }}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>

  <div class="question-input">作答：</div>
  <div class="question-option">
    <a-textarea
      :disabled="isOver"
      placeholder="请输入答案"
      :rows="5"
      v-model:value="currentQuestion.userAnswer"
      @change="emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: $event.target.value })"
      show-count
    />
  </div>

  <AnswerResult
    v-if="rod"
    :answered="rod"
    :correctFlag="currentQuestion.correctFlag"
    :userAnswer="currentQuestion.userAnswer"
    :answer="currentQuestion.answer"
    :analysis="currentQuestion.analysis"
  />
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import ImageVies from './showImagePreview.vue';
  import AnswerResult from './AnswerResult.vue';

  const props = defineProps({
    currentIdx:      { type: Number, default: 0 },
    currentQuestion: { type: Object, default: () => ({}) },
    rod:             { type: Boolean, default: false },
    disabled:        { type: Boolean },
  });

  const isOver = computed(() => !!props.disabled || !!props.rod);

  const emits = defineEmits(['update:currentQuestion']);
</script>

<style lang="less" scoped></style>
