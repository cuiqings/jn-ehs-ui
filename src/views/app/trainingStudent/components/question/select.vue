<template>
  <div class="question-title">{{ currentIdx + 1}}、多选题（8分） </div>

  <div class="question-text">保温炉铝液添加时，允许打开炉门的标志是</div>
  <a-checkbox-group v-model:value="currentQuestion.answer" @change="onChange">
    <div class="question-option" v-for="v in options" :key="v">
      <div class="question-option-text">
        <a-checkbox :value="v" :disabled="isOver" checked style="width: 20; height: 20; position: absolute; top: 1"></a-checkbox>
        <span style="margin-left: 30px">{{ v }}</span>
        <span>.保温炉读秒器数字开始变动</span>
      </div>
    </div>
  </a-checkbox-group>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  const isOver = ref(false);
  const options = ['A', 'B', 'C', 'D'];
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

    emits('update:currentQuestion', { ...props.currentQuestion, answer: e });
  };
</script>

<style lang="less" scoped></style>
