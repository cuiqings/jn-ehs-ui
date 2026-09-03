<template>
  <div class="question-title">{{ currentIdx + 1 }}、多选题 </div>

  <div class="question-text">
    <div>{{ currentQuestion.questionName }}</div>
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>
  <a-checkbox-group v-model:value="currentQuestion.userAnswer" @change="onChange" style="width: 100%;display: block;">
    <div class="question-option" v-for="v in currentQuestion.userQuestionInfoList" :key="v">
      <div class="question-option-text">
        <a-checkbox :value="v.key" v-if="v.key != '其它'" :disabled="isOver" checked>
          <div style="color: #333">
            <span style="margin-left: 10px">{{ v.key }}. </span>
            <span>{{ v.value }}</span>
          </div>
        </a-checkbox>
        <div class="other-option-box" v-else>
          <a-checkbox :value="v.key">其它</a-checkbox>
          <a-textarea v-if="currentQuestion.userAnswer && currentQuestion.userAnswer.includes('其它')"
            v-model:value="currentQuestion.otherText"
            :rows="3"
            placeholder="请输入内容"
            class="other-input"
            :maxlength="200"
          />
        </div>
      </div>
      <ImageVies v-if="v.file" :src="v.file" />
    </div>
  </a-checkbox-group>
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
