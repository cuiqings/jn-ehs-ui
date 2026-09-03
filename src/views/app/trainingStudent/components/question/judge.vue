<template>
  <div class="question-title">{{ currentIdx + 1}}、判断题（8分） </div>

  <div class="question-text">保温炉铝液添加时，允许打开炉门的标志是</div>
  <a-radio-group v-model:value="currentQuestion.answer" @change="emits('update:currentQuestion', { ...props.currentQuestion, answer: $event.target.value })">
    <div className="question-option">
      <div className="question-option-text">
        <a-radio value="y" :disabled="isOver" style="width: 20px; height: 20px; position: absolute; top: 1px"></a-radio>
        <span style="margin-left: 30px">正确</span>
      </div>
    </div>
    <div className="question-option">
      <div className="question-option-text">
        <a-radio value="n" :disabled="isOver" style="width: 20; height: 20; position: absolute; top: 1px"></a-radio>
        <span style="margin-left: 30px">错误</span>
      </div>
    </div></a-radio-group
  >
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  const isOver = ref(false);
  const props = defineProps({
    currentIdx: {
      type: Number,
      default: 0
    },
    currentQuestion: {
      type: Object,
      default: () => ({})
    }
  })
  const emits = defineEmits(['update:currentQuestion'])
  const answer = ref('');
  const onChange = (e) => {
    console.log(e);
    console.log(answer.value);
  };
</script>

<style lang="less" scoped></style>
