<template>
  <div class="question-title">
    <span>{{ currentIdx + 1 }}、{{ currentQuestion.questionName }}</span>
    <span class="exam-diffiCulty" v-if="pageState == '1'">试题难度：{{ { 1: '简单', 2: '中等', 3: '复杂' }[currentQuestion.questionExtent] }}</span>
  </div>

  <div class="question-text" v-if="currentQuestion.questionNameFile">
    <ImageVies v-if="currentQuestion.questionNameFile" :key="currentQuestion.questionNameFile" :src="currentQuestion.questionNameFile" />
  </div>
  <a-radio-group
    v-model:value="currentQuestion.userAnswer"
    @change="emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: $event.target.value })"
  >
    <div className="question-option">
      <div className="question-option-text">
        <a-radio value="正确" :disabled="isOver">
          <span style="color: #333">正确</span>
        </a-radio>
      </div>
    </div>
    <div className="question-option">
      <div className="question-option-text">
        <a-radio value="错误" :disabled="isOver">
          <span style="color: #333">错误</span>
        </a-radio>
      </div>
    </div></a-radio-group
  >
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
