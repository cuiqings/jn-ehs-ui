<template>
  <!-- 答题结果区块：判卷后显示 -->
  <div v-if="answered" class="answer-result" :class="correctFlag ? 'correct' : 'wrong'">
    <div class="result-header">
      <span>
        <CheckOutlined v-if="correctFlag" />
        <CloseOutlined v-else />
        {{ correctFlag ? '回答正确' : '回答错误' }}
      </span>
      <span v-if="correctFlag" class="score">+1</span>
    </div>
    <div class="result-body">
      <div class="result-row"><span class="label">你的答案</span><span class="user-answer" :class="correctFlag ? 'green' : 'red'">{{ displayUserAnswer }}</span></div>
      <div class="result-row"><span class="label">正确答案</span><span class="correct-answer green">{{ answer }}</span></div>
      <div class="result-row" v-if="analysis"><span class="label">解析</span><span class="analysis-text">{{ analysis }}</span></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';

  const props = defineProps({
    answered:      { type: Boolean, default: false },
    correctFlag:   { type: Boolean, default: false },
    userAnswer:    { default: '' },   // string | string[]
    answer:        { type: String, default: '' },
    analysis:      { type: String, default: '' },
  });

  // 数组答案展示为 "A、B"
  const displayUserAnswer = computed(() => {
    if (Array.isArray(props.userAnswer)) return props.userAnswer.join('、');
    return props.userAnswer || '未作答';
  });
</script>

<style lang="less" scoped>
  .answer-result {
    margin-top: 16px;
    border-radius: 6px;
    overflow: hidden;
    font-size: 14px;

    &.correct {
      background: #f6ffed;
      border: 1px solid #b7eb8f;
      .result-header { background: #d9f7be; color: #389e0d; }
    }
    &.wrong {
      background: #fff2f0;
      border: 1px solid #ffccc7;
      .result-header { background: #ffccc7; color: #cf1322; }
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      font-weight: 600;
      font-size: 14px;
      .score { font-weight: 700; }
    }

    .result-body {
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .result-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      font-size: 14px;

      .label {
        color: #999;
        width: 56px;
        flex-shrink: 0;
      }
      .green         { color: #389e0d; font-weight: 600; }
      .red           { color: #cf1322; font-weight: 600; }
      .analysis-text { color: #333; flex: 1; line-height: 1.6; }
    }
  }
</style>
