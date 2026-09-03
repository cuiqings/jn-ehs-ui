<template>
  <div class="question-title">{{ currentIdx + 1}}、填空题（8分） </div>

  <div class="question-text">保温炉铝液添加时，允许打开炉门的标志是</div>
  <div class="question-input">作答：</div>
  <div class="question-option">
    <a-textarea
        :disabled="isOver"
      placeholder="请输入答案"
      @change="emits('update:currentQuestion', { ...props.currentQuestion, answer: $event.target.value })"
      v-model:value="currentQuestion.answer"
      show-count
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
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
  const emits = defineEmits(['update:currentQuestion']);
  const onChange = (e) => {
    console.log(e);
    console.log(answer.value);
  };
</script>

<style lang="less" scoped></style>
