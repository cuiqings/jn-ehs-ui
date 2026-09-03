<template>
  <div class="question-title">
    <span>{{ currentIdx + 1 }}、{{currentQuestion.questionName}}</span>
  </div>
  <div class="question-text" v-if="currentQuestion.questionNameFile">
    <ImageVies :src="currentQuestion.questionNameFile" />
  </div>

  <a-radio-group v-model:value="currentQuestion.userAnswer" @change="onChange" style="width: 100%;display: block;">
    <div class="question-option" v-for="v in currentQuestion.userQuestionInfoList" :key="v">
      <div class="question-option-text">
        <a-radio :value="v.key" v-if="v.key != '其它'" :disabled="isOver">
          <div style="color: #333">
            <span style="margin-left: 10px">{{ v.key }}. </span>
            <span>{{ v.value }}</span>
          </div>
        </a-radio>
        <div class="other-option-box" v-else>
          <a-radio @change="onChange" :value="v.key">其它</a-radio>
          <a-textarea
            v-if="currentQuestion.userAnswer == '其它'"
            v-model:value="currentQuestion.otherText"
            :rows="3"
             @change="onChangeOther"
            placeholder="请输入内容"
            class="other-input"
            :maxlength="200"
          />
        </div>
      </div>
      <ImageVies v-if="v.file" :src="v.file" />
    </div>
  </a-radio-group>
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
  const pageState = ref(route.query.status as string);
  if (pageState.value == '1') {
    isOver.value = true;
  }
  
  const onChange = (e) => {
    console.log('radio checked', e.target.value);
    emits('update:currentQuestion', { ...props.currentQuestion, userAnswer: e.target.value });
  };
  const onChangeOther = (e) => {
    console.log('radio checked', e.target.value);
    emits('update:currentQuestion', { ...props.currentQuestion, otherText: e.target.value });
  };
</script>

<style lang="less" scoped>
  
</style>
