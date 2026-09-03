<template>
  <div class="question-title">
    <span>{{ route.query.status === '1' ? currentQuestion.questionSort : currentIdx + 1 }}、多选题（{{ currentQuestion.score }}分）</span>
    <span class="exam-diffiCulty" v-if="pageState == '1'">
      <CloseOutlined v-if="currentQuestion.userScore == 0" style="color: #ff4d4f;padding-left: 10px;" />
      <CheckOutlined v-if="currentQuestion.userScore > 0" style="color: #1890ff;padding-left: 10px;" />
      得分：{{ currentQuestion.userScore }}分</span>
  </div>
  
  <div class="question-text">
    <div>{{ currentQuestion.questionName }}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>
  <a-checkbox-group v-model:value="currentQuestion.userAnswer" @change="onChange">
    <div class="question-option" v-for="v in currentQuestion.userQuestionInfoList" :key="v">
      <div class="question-option-text">
        <a-checkbox :value="v.key" :disabled="isOver" checked>
          <div style="color: #333">
            <span style="margin-left: 10px">{{ v.key }}. </span>
            <span>{{ v.value }}</span>
          </div>
        </a-checkbox>
      </div>
      <ImageVies v-if="v.file" :src="v.file" />
    </div>
  </a-checkbox-group>
  <div class="analysis" v-if="pageState == '1' || rod">
    <div class="answer">正确答案：{{ currentQuestion.answer }}</div>
    <span class="exam-diffiCulty" v-if="pageState == '1'">试题难度：{{ { 1: '简单', 2: '中等', 3: '复杂' }[currentQuestion.questionExtent] }}</span>
    <div class="remark-tit">解析：{{ currentQuestion.analysis }}</div>
    <ImageVies :src="currentQuestion.analysisFile" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ImageVies from './showImagePreview.vue';
  import {
    CloseOutlined, CheckOutlined
} from '@ant-design/icons-vue';
  const route = useRoute();
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
    rod: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
    },
  });
  const pageState = ref(route.query.status as string);
  if (pageState.value == '1' || props.disabled) {
    isOver.value = true;
  }

  const emits = defineEmits(['update:currentQuestion']);
  const onChange = (e) => {
    emits('update:currentQuestion', { ...props.currentQuestion, answer: e });
  };
</script>

<style lang="less" scoped></style>
