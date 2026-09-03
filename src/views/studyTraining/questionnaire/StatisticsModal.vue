<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="title"
    :width="'70%'"
    :canFullscreen="false"
    :showCancelBtn="false"
    :showOkBtn="false"
    :footer="null"
    destroyOnClose
  >
    <div class="statistics-container">
      <div class="header-row">
        <div class="header-title">{{ info.name }} - 统计结果</div>
        <!-- <a-button type="primary" @click="handleExport">导出统计</a-button> -->
      </div>
      <a-row :gutter="16" class="stats-cards">
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-label">应填人数</div>
            <div class="stat-value text-blue">{{ info.needNum }}</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-label">已填人数</div>
            <div class="stat-value text-blue">{{ info.alreadyNum }}</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-label">未填人数</div>
            <div class="stat-value text-orange">{{ info.unNum }}</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-label">填报率</div>
            <div class="stat-value text-blue">{{ info.ratio }}</div>
          </div>
        </a-col>
      </a-row>
      <div class="question-analysis">
        <div v-for="(question, index) in info.question" :key="question.id" class="question-item">
          <div class="question-title">问题{{ index + 1 }}: {{ question.questionName }}</div>
          <div v-if="['1', '2', '4'].includes(question.questionType)">
            <a-table :columns="choiceColumns" :dataSource="question.options" :pagination="false" size="small" bordered>
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'question_key'"> 
                  <div class="questitle" v-if="question.questionType == '4'">
                    <div class="queskey">{{ record.question_key }}</div>
                  </div>
                  <div class="questitle" v-else>
                    <div class="queskey">{{ record.question_key }}、</div>
                    <div class="contentvalue">{{ record.question_value }}</div> 
                  </div>
                </template>
                <template v-if="column.dataIndex === 'percentage'"> {{ computedRiato(record.choose_num) }}% </template>
              </template>
            </a-table>
            <div v-if="question.otherAnswers && question.otherAnswers.length" class="other-answers">
              <div class="other-label">其它选项填写内容：</div>
              <div class="other-content">{{ question.otherAnswers.join('；') }}</div>
            </div>
          </div>
          <div v-else>
            {{ question.userAnswer }}
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { statistics } from "./api"
  const title = ref('问卷统计分析');
  const info = ref<any>({});
  const stats = ref<any>({});
  const questionList = ref<any[]>([]);

  const choiceColumns = [
    { title: '选项', dataIndex: 'question_key' },
    { title: '选择人数', dataIndex: 'choose_num', width: 150 },
    { title: '占比', dataIndex: 'percentage', width: 150 },
  ];

  const computedRiato = (num) => {
    return (num / info.value.needNum * 100).toFixed(2);
  };

  const [registerModal] = useModalInner(async (data) => {
    info.value = data || {};
    statistics({id: data.id}).then((res) => {
      if(res.question && res.question.length){
        res.question.forEach((question) => {
          question.options = JSON.parse(question.options);
        });
      }
      info.value = res;
    })
  });
</script>

<style lang="less" scoped>
  .statistics-container {
    padding: 10px;
    height: 600px;
  }
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .header-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 0;
  }
  .stats-cards {
    margin-bottom: 30px;
  }
  .stat-card {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .stat-label {
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 24px;
    font-weight: bold;
  }
  .text-blue {
    color: #1890ff;
  }
  .text-orange {
    color: #fa8c16;
  }
  .question-item {
    margin-bottom: 30px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 20px;
    &:last-child {
      border-bottom: none;
    }
  }
  .question-title {
    font-weight: bold;
    font-size: 15px;
    margin-bottom: 15px;
    color: #333;
  }
  .other-answers {
    margin-top: 10px;
    background: #f9f9f9;
    padding: 10px;
    border-radius: 4px;
  }
  .other-label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #666;
  }
  .other-content {
    color: #333;
    line-height: 1.5;
  }
  .keyword-stats {
    width: 60%;
  }
  .keyword-title {
    font-weight: bold;
    margin-bottom: 10px;
    color: #666;
  }
  .questitle{
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
  }
  .queskey{
    width: 50px;
  }
  .contentvalue{
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
