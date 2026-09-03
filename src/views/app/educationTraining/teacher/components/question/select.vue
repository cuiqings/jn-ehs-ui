<template>
  <div class="question-title">{{ route.query.status === '1' ? currentQuestion.questionSort : currentIdx + 1 }}、多选题（{{ currentQuestion.score }}分） </div>

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
  <div class="analysis" v-if="pageState == '1'">
    <div class="answer">答案：{{ currentQuestion.answer }}</div>
    <div class="remark-tit" v-if="currentQuestion.analysis">解析：{{ currentQuestion.analysis }}</div>
    <ImageVies :src="currentQuestion.analysisFile" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ImageVies from './showImagePreview.vue'
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
  });
  const pageState = ref(route.query.status as string);
  if (pageState.value == '1') {
    isOver.value = true;
  }

  const emits = defineEmits(['update:currentQuestion']);
  const onChange = (e) => {
    emits('update:currentQuestion', { ...props.currentQuestion });
  };
</script>

<style lang="less" scoped></style>
