<template>
  <div>
    <basic-modal
      v-bind="$attrs"
      @register="registerModal"
      :width="800"
      :bodyStyle="{ padding: '10px 10px 0 0', height: '660px', overflow: 'auto' }"
      :title="title"
      :canFullscreen="false"
      :maskClosable="false"
      destroyOnClose
      @cancel="close"
    >
      <a-form :model="info" ref="infoForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row>
          <a-col :span="24">
            <a-form-item label="问卷名称" name="name" required>
              <a-input v-model:value="info.name" :maxlength="50" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="24">
            <a-form-item label="问卷说明" name="instructions" required>
              <InputTextArea :maxlength="300" v-model:value="info.instructions" :rows="3" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="24">
            <a-form-item
              style="margin-left: 45px; margin-bottom: 0"
              label="选择题目（从题库中选择）"
              :label-col="{ span: 24 }"
              :wrapper-col="{ span: 24 }"
              required
            />
            <a-form-item label="" :wrapper-col="{ span: 24 }" style="margin-left: 45px" name="workshopName">
              <a-button @click="openQuestionsModal">从题库中选择题目</a-button>
              <div class="selected-questions">
                <div class="header">已选题目 ({{ paperList.length }})</div>
                <div class="question-list">
                  <div class="question-card" v-for="(item, index) in paperList" :key="item.id">
                    <div class="question-header">
                      <span class="question-title"
                        >{{ index + 1 }}. {{ item.questionName }} <span class="question-type">[{{ questionTypeText(item.questionType) }}]</span></span
                      >
                      <span class="delete-btn" @click="handlePaperDle(index)">×</span>
                    </div>
                    <div class="options-list">
                      <div class="option-item" v-for="(ite, inx) in item.questionList" :key="inx">{{ ite.key }}. {{ ite.value }}</div>
                    </div>
                    <div class="other-option" v-if="['1', '2'].includes(item.questionType)">
                      <a-checkbox v-model:checked="item.otherStatus">是否添加"其它"选项（选择后可输入文本）</a-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="24">
            <a-form-item style="margin-bottom: 0" label="发布范围" name="scope" required>
              <a-radio-group v-model:value="info.scope">
                <a-radio value="1">全员</a-radio>
                <a-radio value="2">指定人员</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" v-if="info.scope === '2'">
            <a-form-item style="margin-left: 125px" :wrapper-col="{ span: 24 }" label="" name="userIds" required>
              <JUserModal @confirm="pChange" :userStyle="{ width: '100%', marginTop: '10px' }" v-model:value="info.userIds" type="checkbox" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="发布日期" name="startTime" required>
              <a-date-picker :disabledDate="disabledDate" @change="startChange" style="width: 100%" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" v-model:value="info.startTime" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="有效期至" name="endTime" required>
              <a-date-picker style="width: 100%" :disabledDate="disabledDateEnd" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" v-model:value="info.endTime" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="" name="noticeTag">
              <a-checkbox style="margin-left: 50px" v-model:checked="info.noticeTag">自动提醒未填报人员（任务到期自动关闭）</a-checkbox>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注" name="remark">
              <InputTextArea v-model:value="info.remark" :maxlength="300" :rows="3" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <template #footer>
        <div style="text-align: right">
          <a-button @click="close">取消</a-button>
          <a-button v-if="type !== 'view'" style="margin-left: 15px" type="primary" :loading="loading" @click="confirmClose">发布问卷</a-button>
        </div>
      </template>
    </basic-modal>
    <QuestionsModal @register="registerQuestionsModal" @select="handleQuestionsList" />
  </div>
</template>
<script lang="ts" name="questionnaire-add-modal" setup>
  import { ref } from 'vue';
  import { add, detail, edit } from './api';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { JUserModal } from '/@/components/Form';
  import { Input } from 'ant-design-vue';
  import QuestionsModal from '../../education/exam/paper/QuestionsModal.vue';
  import dayjs, { Dayjs } from 'dayjs';
  const emit = defineEmits(['success']);
  const InputTextArea = Input.TextArea;
  const loading = ref(false);
  const infoForm: any = ref();
  const title = ref('创建培训调查问卷');
  const type = ref('');
  const info: any = ref({
    scope: '1',
    noticeTag: false
  });
  const paperList: any = ref([]);
  const [registerQuestionsModal, { openModal }] = useModal();
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    type.value = data.type;
    await infoForm.value.resetFields();
    if(title.value == '编辑'){
      detail({id: data.data.id}).then((res) => {
        console.log(res);
        res.questionList = JSON.parse(res.questionList);
        res.questionList.forEach((item) => {
          item.questionList = JSON.parse(item.questionJson);
        });
        paperList.value = res.questionList;
        info.value = res;
      })
    }
  });
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };
  const disabledDateEnd = (current: Dayjs) => {
    return current && current < dayjs(info.value.startTime).startOf('day');
  };
  const startChange = (date) => {
    if(date > info.value.endTime){
      info.value.endTime = null;
    }
  };
  const openQuestionsModal = () => {
    openModal(true, {data: JSON.parse(JSON.stringify(paperList.value))});
  };
  const handleQuestionsList = ({ dataSource }) => {
    dataSource.forEach((item) => {
      item.otherStatus = false;
    });
    if(paperList.value.length > 0){
      paperList.value.forEach((item) => {
        dataSource.forEach((ite) => {
          if(item.id == ite.id){
            ite.otherStatus = item.otherStatus;
          }
        });
      });
    }
    paperList.value = dataSource;
  };
  const pChange = (name, nameNo) => {
    info.value = {
      ...info.value,
      userNames: nameNo
    };
  }
  const handlePaperDle = (index) => {
    paperList.value.splice(index, 1);
  };
  const questionTypeText = (value) => {
    const arr = [
      {
        label: '单选题',
        value: '1',
      },
      {
        label: '多选题',
        value: '2',
      },
      {
        label: '填空题',
        value: '3',
      },
      {
        label: '判断题',
        value: '4',
      },
      {
        label: '问答题',
        value: '5',
      },
    ];
    return arr.filter((item) => item.value === value)[0]?.label || '';
  };
  const close = () => {
    closeModal();
    paperList.value = [];
    infoForm.value.resetFields();
  };
  const confirmClose = async () => {
    const values = await infoForm.value.validate();
    loading.value = true;
    info.value = {
      ...info.value,
      questionList: paperList.value
    };
    if(title.value == '编辑') {
      edit(info.value).then((res) => {
        if (res) {
          //关闭弹窗
          close();
          //刷新列表
          emit('success');
        }
      }).finally(() => {
        loading.value = false;
      });
      return;
    }
    add(info.value)
      .then((res) => {
        if (res) {
          //关闭弹窗
          close();
          //刷新列表
          emit('success');
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
</script>
<style lang="less" scoped>
  .selected-questions {
    margin-top: 20px;
    width: 100%;
  }
  .question-list {
    // max-height: 500px;
    // overflow-y: auto;
    padding-right: 5px;
  }
  .question-list::-webkit-scrollbar {
    width: 6px;
  }
  .question-list::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
  .question-list::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
  .header {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 14px;
    color: #333;
  }
  .question-card {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 16px;
    background: #fff;
    margin-bottom: 10px;
  }
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .question-title {
    font-weight: 500;
    color: #333;
  }
  .question-type {
    color: #999;
    font-weight: normal;
    margin-left: 8px;
  }
  .delete-btn {
    cursor: pointer;
    color: #ff4d4f;
    font-size: 20px;
  }
  .options-list {
    margin-left: 20px;
    margin-bottom: 16px;
  }
  .option-item {
    line-height: 24px;
    color: #666;
  }
  .other-option {
    background: #f5f7fa;
    padding: 10px 16px;
    border-radius: 4px;
  }
</style>
