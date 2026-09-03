<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="试题详情" width="1000px" :footer="null" destroyOnClose>
    <div class="detail-container">
      <div v-for="(detailData, qIndex) in questionList" :key="qIndex" class="question-block">
        <!-- 基础信息标签 -->
        <div class="header-tags">
          <span class="index-label">第 {{ qIndex + 1 }} 题</span>
          <a-tag color="blue">{{ getQuestionTypeParams(detailData.questionType) }}</a-tag>
          <a-tag :color="getDifficultyColor(detailData.questionExtent)">{{ getDifficultyText(detailData.questionExtent) }}</a-tag>
          <span class="knowledge-point" v-if="detailData.knowledgePoint">知识点：{{ detailData.knowledgePoint }}</span>
        </div>

        <!-- 题目内容 -->
        <div class="question-content">
          <h3 class="question-title">
            {{ detailData.questionName }}
          </h3>
          <div v-if="detailData.questionNameFile" class="question-image">
            <JImageUpload :value="detailData.questionNameFile" :disabled="true" />
          </div>
        </div>

        <!-- 选项/答案区域 -->
        <div class="options-area">
          <!-- 单选题/多选题 -->
          <div v-if="['1', '2'].includes(detailData.questionType)">
            <div
              v-for="(item, index) in getOptionsList(detailData)"
              :key="index"
              class="option-item"
              :class="{ 'option-correct': isCorrectOption(detailData, item.key) }"
            >
              <div class="option-main">
                <div class="option-key" :class="{ 'key-correct': isCorrectOption(detailData, item.key) }">
                  {{ item.key }}
                </div>
                <div class="option-text-wrapper">
                  <div class="option-text">{{ item.value }}</div>
                  <div v-if="item.file" class="option-image">
                    <JImageUpload :value="item.file" :disabled="true" />
                  </div>
                </div>
              </div>
              <div v-if="isCorrectOption(detailData, item.key)" class="correct-label"> <CheckOutlined /> 正确答案 </div>
            </div>
          </div>

          <!-- 填空题 -->
          <div v-if="detailData.questionType === '3'" class="answer-block">
            <div class="block-title">正确答案：</div>
            <div v-for="(ans, idx) in formatAnswerList(detailData.answer)" :key="idx" class="answer-item">
              <span class="label">第 {{ Number(idx) + 1 }} 空：</span>
              <span class="value">{{ ans }}</span>
            </div>
          </div>

          <!-- 判断题 -->
          <div v-if="detailData.questionType === '4'" class="answer-block flex-row">
            <span class="block-title mr-4">正确答案：</span>
            <a-tag :color="detailData.answer === '正确' || detailData.answer === '1' ? 'green' : 'red'">
              {{ detailData.answer === '1' ? '正确' : detailData.answer === '2' ? '错误' : detailData.answer }}
            </a-tag>
          </div>

          <!-- 问答题 -->
          <div v-if="detailData.questionType === '5'" class="answer-block">
            <div class="block-title">关键词：</div>
            <div class="keyword-list">
              <a-tag v-for="(kw, idx) in formatAnswerList(detailData.answer)" :key="idx" color="cyan">
                {{ kw }}
              </a-tag>
            </div>
          </div>
        </div>

        <!-- 解析区域 -->
        <div class="analysis-section">
          <div class="analysis-header">
            <InfoCircleOutlined class="icon" />
            <span class="title">试题解析</span>
          </div>
          <div class="analysis-text">{{ detailData.analysis || '暂无解析' }}</div>
          <div v-if="detailData.analysisFile" class="analysis-image">
            <JImageUpload :value="detailData.analysisFile" :disabled="true" />
          </div>
        </div>

        <a-divider v-if="qIndex < questionList.length - 1" />
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CheckOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
  import { JImageUpload } from '/@/components/Form';
  import { getPaperDetail } from '/@/views/education/exam/paper/paper.api';
  import { detailList } from '/@/views/education/exam/questions/questions.api';
  const type = ref('');
  const [registerModal, { setModalProps, redoModalHeight }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });
    type.value = data.type;
    questionList.value = [];
    if (data && data.id) {
      loadDetail(data.id);
    }
  });
  const questionList = ref<any[]>([]);
  async function loadDetail(id) {
    try {
      let res: any = null;
      if (type.value === '1') {
        res = await getPaperDetail({ id });
        if (res && res.questionList) {
          questionList.value = res.questionList;
        }
      } else {
        res = await detailList({ questionBankId: id, pageNo: 1, pageSize: 9999 });
        if (res && res.records) {
          questionList.value = res.records;
        }
      }
      redoModalHeight();
    } catch (e) {
      console.error(e);
    }
  }

  function getOptionsList(record) {
    if (['1', '2'].includes(record.questionType)) {
      if (Array.isArray(record.questionList)) {
        return record.questionList;
      }
    }
    return [];
  }

  function formatAnswerList(ans) {
    if (!ans) return [];
    if (Array.isArray(ans)) return ans;
    return ans.split(',');
  }

  function isCorrectOption(record, key) {
    if (!record.answer) return false;
    const ansArr = typeof record.answer === 'string' ? record.answer.split(',') : record.answer;
    return ansArr.includes(key);
  }

  function getQuestionTypeParams(type) {
    const map = {
      '1': '单选题',
      '2': '多选题',
      '3': '填空题',
      '4': '判断题',
      '5': '问答题',
    };
    return map[type] || '未知类型';
  }

  function getDifficultyText(level) {
    const map = {
      '1': '简单',
      '2': '中等',
      '3': '复杂',
    };
    return map[level] || '未知';
  }

  function getDifficultyColor(level) {
    const map = {
      '1': 'green',
      '2': 'orange',
      '3': 'red',
    };
    return map[level] || 'default';
  }
</script>

<style lang="less" scoped>
  .detail-container {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
  .question-block {
    margin-bottom: 20px;
  }
  .header-tags {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    .index-label {
      font-weight: bold;
      margin-right: 12px;
      font-size: 16px;
    }
    .knowledge-point {
      margin-left: 10px;
      color: #999;
      font-size: 14px;
    }
  }
  .question-content {
    margin-bottom: 16px;
    .question-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .question-image {
      margin-top: 10px;
    }
  }

  .options-area {
    margin-bottom: 16px;
  }

  .option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #fff;

    &.option-correct {
      background-color: #f6ffed;
      border-color: #b7eb8f;
    }

    .option-main {
      display: flex;
      align-items: flex-start;
      flex: 1;
      .option-key {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        margin-right: 12px;
        flex-shrink: 0;
        font-size: 14px;

        &.key-correct {
          background-color: #52c41a;
          color: #fff;
        }
      }
      .option-text-wrapper {
        padding-top: 4px;
        .option-text {
          font-size: 14px;
          color: #333;
        }
        .option-image {
          margin-top: 8px;
        }
      }
    }
    .correct-label {
      color: #52c41a;
      font-weight: bold;
      margin-left: 10px;
      font-size: 13px;
    }
  }

  .answer-block {
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 4px;

    &.flex-row {
      display: flex;
      align-items: center;
    }

    .block-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 6px;
      font-size: 14px;
    }
    .answer-item {
      margin-bottom: 4px;
      font-size: 14px;
      .label {
        color: #666;
      }
      .value {
        color: #52c41a;
        font-weight: bold;
      }
    }
    .keyword-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .analysis-section {
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    padding: 12px;
    border-radius: 4px;

    .analysis-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      .icon {
        color: #1890ff;
        margin-right: 6px;
      }
      .title {
        color: #096dd9;
        font-weight: bold;
        font-size: 14px;
      }
    }
    .analysis-text {
      color: #595959;
      line-height: 1.5;
      padding-left: 20px;
      white-space: pre-wrap;
      font-size: 13px;
    }
    .analysis-image {
      margin-top: 8px;
      padding-left: 20px;
    }
  }
  .mr-4 {
    margin-right: 16px;
  }
</style>
