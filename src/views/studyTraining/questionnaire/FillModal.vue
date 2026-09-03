<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :bodyStyle="{ height: '700px', overflow: 'auto' }"
    :title="title"
    :width="800"
    :canFullscreen="false"
    @ok="handleOk"
    okText="提交"
    cancelText="取消"
    :confirmLoading="confirmLoading"
    :showOkBtn="type !== 'view'"
  >
    <div class="fill-container">
      <div class="header-section">
        <h2 class="paper-title">{{ info.name }}</h2>
        <div class="paper-desc">
          <div class="desc-text">
            各位同事：
            <div style="text-indent: 2em">
              {{
                info.workshopName1 ||
                info.instructions
              }}
            </div>
          </div>
          <div class="paper-date">问卷有效期：{{ info.startTime }} 至 {{ info.endTime }}</div>
        </div>
      </div>
      <div class="question-list">
        <div v-for="(question, index) in info.questionList" :key="question.id" class="question-card">
          <div class="question-title">
            {{ index + 1 }}. {{ question.questionName }}
            <span class="question-type">（{{ getQuestionTypeLabel(question.questionType) }}）</span>
          </div>
          <div v-if="question.questionType === '1'" class="options-group">
            <a-radio-group v-model:value="question.userAnswer" :disabled="isView">
              <div v-for="opt in question.questionJson" :key="opt.key" class="option-item">
                <a-radio v-if="opt.key != '其它'" :value="opt.key">{{opt.key}}、{{ opt.value }}</a-radio>
                <div class="other-option-box" v-else>
                  <a-radio :value="opt.key">其它</a-radio>
                  <a-textarea v-if="question.userAnswer == '其它'"
                    v-model:value="question.otherText"
                    :rows="3"
                    placeholder="请输入内容"
                    class="other-input"
                    :maxlength="200"
                    :disabled="isView"
                  />
                </div>
              </div>
            </a-radio-group>
          </div>
          <div v-else-if="question.questionType === '2'" class="options-group">
            <a-checkbox-group v-model:value="question.userAnswer" :disabled="isView">
              <div v-for="opt in question.questionJson" :key="opt.key" class="option-item">
                <a-checkbox :value="opt.key" v-if="opt.key != '其它'">{{opt.key}}、{{ opt.value }}</a-checkbox>
                <div class="other-option-box" v-else>
                  <a-checkbox :value="opt.key" :disabled="isView"> 其它 </a-checkbox>
                  <a-textarea v-if="question.userAnswer == '其它'"
                    v-model:value="question.otherText"
                    :rows="3"
                    placeholder="请输入内容"
                    class="other-input"
                    :maxlength="200"
                    :disabled="isView"
                  />
                </div>
              </div>
            </a-checkbox-group>
            
          </div>
          <div v-else-if="question.questionType === '4'" class="options-group">
            <a-radio-group v-model:value="question.userAnswer" :disabled="isView">
              <div class="option-item">
                <a-radio value="正确">正确 <span v-if="question.userAnswer === '正确'" style="color: #52c41a; margin-left: 5px">✔</span></a-radio>
              </div>
              <div class="option-item">
                <a-radio value="错误">错误 <span v-if="question.userAnswer === '错误'" style="color: #ff4d4f; margin-left: 5px">✘</span></a-radio>
              </div>
            </a-radio-group>
          </div>
          <div v-else-if="['3', '5'].includes(question.questionType)" class="text-answer">
            <a-textarea v-model:value="question.userAnswer" :rows="3" placeholder="请输入您的回答" :disabled="isView" />
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getSurveyQues, submitSurveyQues } from './api'

  const { createMessage } = useMessage();
  const info = ref<any>({});
  const title = ref('');
  const type = ref('');
  const isView = computed(() => type.value === 'view');
  const [registerModal, { closeModal }] = useModalInner((data) => {
    title.value = data.title;
    type.value = data.type;
    if(title.value == '查看问卷') {
      data.data.questionList = JSON.parse(data.data.questionList);
      info.value = data.data;
      console.log(info.value);
      return;
    }
    getSurveyQues({id: data.data.id}).then((res) => {
      res.questionList = JSON.parse(res.questionList);
      res.questionList.forEach((item) => {
        item.questionJson = JSON.parse(item.questionJson);
      });
      info.value = res;
      console.log(res);
    });
  });

  const getQuestionTypeLabel = (type: string) => {
    const map: any = {
      '1': '单选',
      '2': '多选',
      '3': '填空',
      '4': '判断',
      '5': '问答',
    };
    return map[type] || '未知';
  };
  const confirmLoading = ref(false);
  const handleOk = () => {
    let params = {...info.value};
    let str = '';
    params.questionList.forEach((item: any, idx: number) => { 
      if(!item.userAnswer){
        str = '您有第 ' + (idx + 1) + ' 题没有作答！';
        return;
      }
      if(item.userAnswer && item.userAnswer == '其它' && !item.otherText){
        str = '请补充第' + (idx + 1) + '题的其它选项内容！'
      }
    });
    if(str) {
      createMessage.error(str);
      return;
    }
    confirmLoading.value = true;
    params.questionList = JSON.stringify(params.questionList);
    submitSurveyQues(params).then((res) => { 
      createMessage.success('提交成功！');
      closeModal();
    }).finally(() => { 
      confirmLoading.value = false;
    })
  };
</script>

<style lang="less" scoped>
  .fill-container {
    padding: 10px 20px;
  }
  .header-section {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
  }
  .paper-title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }
  .paper-desc {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    text-align: left;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
  }
  .desc-text {
    margin-bottom: 10px;
  }
  .paper-date {
    font-weight: bold;
    margin-top: 10px;
  }
  .question-card {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
    background: #fff;
  }
  .question-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 15px;
    color: #333;
  }
  .question-type {
    font-weight: normal;
    font-size: 14px;
    color: #666;
  }
  .options-group {
    display: flex;
    flex-direction: column;
  }
  .option-item {
    margin-bottom: 8px;
  }
  .other-option-box {
    color: #ff4d4f;
    font-size: 12px;
  }
  .other-input {
    margin-top: 10px;
    width: 100%;
  }
  .text-answer {
    width: 100%;
  }
</style>
