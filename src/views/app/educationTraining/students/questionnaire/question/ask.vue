<template>
  <div class="question-title">{{ currentIdx + 1 }}、{{ currentQuestion.questionName }} </div>

  <div class="question-text" v-if="currentQuestion.questionNameFile">
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>
  <div class="question-input">作答：</div>
  <div class="question-option">
    <a-textarea @change="emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: $event.target.value })" 
      :rows="4"
      :disabled="isOver" v-model:value="currentQuestion.userAnswer" placeholder="请输入答案" 
      show-count />
  </div>
  <!-- <div class="question-option" v-for="item in currentQuestion.userQuestionInfoList" :key="item.key">
    <a-textarea @change="emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: $event.target.value })" 
      :disabled="isOver" v-model:value="item.userAnswer" placeholder="请输入答案" 
      show-count />
  </div> -->
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
