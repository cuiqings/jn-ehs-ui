<template>
  <div class="question-title">
    <span>{{ currentIdx + 1 }}、填空题</span>
  </div>
  <div class="question-text">
    <div>{{ currentQuestion.questionName }}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>

  <div class="question-input">作答：</div>
  <div class="question-option" v-for="(item, idx) in currentQuestion.userQuestionInfoList" :key="idx">
    <a-textarea
      :disabled="isOver"
      placeholder="请输入答案"
      v-model:value="item.userAnswer"
      show-count
    />
  </div>

  <AnswerResult
    v-if="rod"
    :answered="rod"
    :correctFlag="currentQuestion.correctFlag"
    :userAnswer="currentQuestion.userQuestionInfoList?.map(i => i.userAnswer).join('、')"
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
