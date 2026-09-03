<template>
  <div class="question-title">
    <span>{{ currentIdx + 1 }}、多选题</span>
  </div>
  <div class="question-text">
    <div>{{ currentQuestion.questionName }}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>

  <!-- 答题中 -->
  <a-checkbox-group v-if="!rod" v-model:value="currentQuestion.userAnswer" @change="onChange">
    <div class="question-option-row" v-for="v in currentQuestion.userQuestionInfoList" :key="v.key">
      <a-checkbox :value="v.key">
        <span class="option-text">{{ v.key }}. {{ v.value }}</span>
      </a-checkbox>
      <ImageVies v-if="v.file" :src="v.file" />
    </div>
  </a-checkbox-group>

  <!-- 判卷后 -->
  <div v-else>
    <div
      class="question-option-row result-row"
      v-for="v in currentQuestion.userQuestionInfoList"
      :key="v.key"
      :class="{
        'option-correct': currentQuestion.userAnswer?.includes(v.key) && currentQuestion.correctFlag,
        'option-wrong':   currentQuestion.userAnswer?.includes(v.key) && !currentQuestion.correctFlag,
      }"
    >
      <span class="option-icon">
        <CheckCircleFilled v-if="currentQuestion.userAnswer?.includes(v.key) && currentQuestion.correctFlag" class="icon-correct" />
        <CloseCircleFilled v-else-if="currentQuestion.userAnswer?.includes(v.key) && !currentQuestion.correctFlag" class="icon-wrong" />
        <span v-else class="icon-empty"></span>
      </span>
      <span class="option-text">{{ v.key }}. {{ v.value }}</span>
      <ImageVies v-if="v.file" :src="v.file" />
    </div>
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
  import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';

  const props = defineProps({
    currentIdx:      { type: Number, default: 0 },
    currentQuestion: { type: Object, default: () => ({}) },
    rod:             { type: Boolean, default: false },
    disabled:        { type: Boolean },
  });

  const isOver = computed(() => !!props.disabled || !!props.rod);
  const emits = defineEmits(['update:currentQuestion']);

  const onChange = (val) => {
    if (isOver.value) return;
    emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: val });
  };
</script>

<style lang="less" scoped>
  .question-option-row {
    display: flex;
    align-items: center;
    padding: 6px 16px 6px 10px;
    border-radius: 6px;
    margin-bottom: 4px;
    min-height: 40px;
    white-space: nowrap;

    &.result-row {
      width: 50%;
    }

    .option-icon {
      width: 22px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-right: 4px;
      .icon-correct { color: #52c41a; }
      .icon-wrong   { color: #ff4d4f; }
      .icon-empty   { display: inline-block; width: 18px; height: 18px; }
    }

    .option-text { color: #333; }

    &.option-correct {
      background: #f6ffed;
      border: 1px solid #b7eb8f;
    }
    &.option-wrong {
      background: #fff2f0;
      border: 1px solid #ffccc7;
    }
  }
</style>
