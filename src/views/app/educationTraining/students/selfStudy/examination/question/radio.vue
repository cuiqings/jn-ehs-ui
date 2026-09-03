<template>
  <div class="question-title">
    <span>{{ route.query.status === '1' ? currentQuestion.questionSort : currentIdx + 1 }}、单选题</span>
    <span class="exam-diffiCulty" v-if="pageState == '1'">试题难度：{{ { 1: '简单', 2: '中等', 3: '复杂' }[currentQuestion.questionExtent] }}</span>
  </div>
  <div class="question-text">
    <div>{{currentQuestion.questionName}}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>

  <a-radio-group v-model:value="currentQuestion.userAnswer" @change="onChange">
    <div class="question-option" v-for="v in currentQuestion.userQuestionInfoList" :key="v">
      <div class="question-option-text">
        <a-radio :value="v.key" :disabled="isOver">
          <div style="color: #333">
            <span style="margin-left: 10px">{{ v.key }}. </span>
            <span>{{ v.value }}</span>
          </div>
        </a-radio>
      </div>
      <ImageVies v-if="v.file" :src="v.file" />
    </div>
  </a-radio-group>
  <div class="analysis" v-if="pageState == '1'">
    <div class="result" v-if="currentQuestion.userAnswer && currentQuestion.userAnswer.length > 0"><span class="c-red">回答{{ currentQuestion.correctFlag ? '正确' : '错误'}}</span></div>
    <div class="answer">答案：{{ currentQuestion.answer }}</div>
    <div class="remark-tit">解析：{{ currentQuestion.analysis }}</div>
    <ImageVies :src="currentQuestion.analysisFile" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import ImageVies from './showImagePreview.vue'
  import { useRoute } from 'vue-router';
  const route = useRoute();
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
  const isOver = ref(false);
  const options = ['A', 'B', 'C', 'D'];
  const answer = ref('');
  console.log(props.currentQuestion, 'radio');
  const pageState = ref(route.query.status as string);
  if (pageState.value == '1') {
    isOver.value = true;
  }
  
  const onChange = (e) => {
    console.log('radio checked', e.target.value);
    emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: e.target.value });
  };
</script>

<style lang="less" scoped>
  
</style>
