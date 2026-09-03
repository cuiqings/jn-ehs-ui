<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="title"
    @ok="handleSubmit"
    width="900px"
    :body-style="{ height: '700px', overflowY: 'auto' }"
    destroyOnClose
  >
    <div>
      <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
        <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.title" :force-render="item.key === '2'">
          {{ item.title }}
        </a-tab-pane>
      </a-tabs>
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="难度" name="questionExtent" :rules="[{ required: true, message: '请选择难度!' }]">
          <a-radio-group v-model:value="formState.questionExtent">
            <a-radio value="1">简单</a-radio>
            <a-radio value="2">中等</a-radio>
            <a-radio value="3">复杂</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="activeKey === '5'" label="满分数量" name="optionsNum" :rules="[{ required: true, message: '请输入满分数量' }]">
          <a-input-number style="width: 100%" v-model:value="formState.optionsNum" placeholder="请输入" :min="1" :precision="0" :controls="false" />
        </a-form-item>
        <a-form-item label="知识点" name="knowledgePoint">
          <a-input style="width: 100%" v-model:value="formState.knowledgePoint" placeholder="请输入" show-count :maxlength="300" />
        </a-form-item>
        <a-form-item label="题目" name="questionName" :rules="[{ required: true, message: '请输入题目' }]">
          <a-input style="width: 100%" v-model:value="formState.questionName" placeholder="请输入" show-count :maxlength="300" />
        </a-form-item>
        <a-form-item label="">
          <div style="margin-left: 120px">
            <JImageUpload :fileMax="10" text="" v-model:value="formState.questionNameFile" />
          </div>
        </a-form-item>
        <div v-if="activeKey == '1' || activeKey == '2'">
          <a-form-item label="选项">
            <div class="icon-blue-1">*</div>
            <a-button style="margin-right: 10px" @click="add">加选项</a-button>
            <a-button @click="del">减选项</a-button>
            <div class="correct-label">
              <span class="icon-blue">*</span>
              正确答案</div
            >
          </a-form-item>
          <div v-for="(item, index) in optionsList" :key="index">
            <div>
              <a-form-item :label="`选项${item}`">
                <a-input style="width: 90%" v-model:value="formState.questionList[item]" placeholder="请输入" show-count :maxlength="300" />
                <div v-if="activeKey == '1'">
                  <div class="circle-btn" @click="choseAnswer(item)"></div>
                  <img
                    v-if="item == formState.answer"
                    class="circle-btn-active"
                    src="/@/assets/images/exam/icon-adopt.png"
                    alt=""
                    @click="choseAnswer(item)"
                  />
                </div>
                <div v-if="activeKey == '2'">
                  <div class="box-btn" @click="choseSelectAnswer(item)"></div>
                  <div
                    v-if="formState.answer && formState.answer.length > 0 && formState.answer.indexOf(String(item)) !== -1"
                    class="box-btn-active"
                    @click="choseSelectAnswer(item)"
                  >
                    <check-outlined style="color: #fff" />
                  </div>
                </div>
              </a-form-item>
              <a-form-item label="">
                <div style="margin-left: 120px; margin-top: -15px">
                  <JImageUpload :fileMax="10" text="" v-model:value="formState.fileList[item]" />
                </div>
              </a-form-item>
            </div>
          </div>
        </div>
        <!-- 填空题 -->
        <div v-if="activeKey == '3'">
          <a-form-item label="填空">
            <div class="icon-blue-1">*</div>
            <a-button style="margin-right: 10px" @click="addSpace">添加空</a-button>
            <a-button @click="delSpace">删除空</a-button>
          </a-form-item>
          <div v-for="(item, index) in formState.answer" :key="index">
            <a-form-item :label="`空${index + 1}答案`">
              <a-input style="width: 90%" v-model:value="formState.answer[index]" show-count :maxlength="300" placeholder="请在此处输入答案内容">
                <template #suffix>
                  <a-tooltip title="若有多个备选答案用/隔开">
                    <info-circle-outlined style="color: rgba(0, 0, 0, 0.45)" />
                  </a-tooltip>
                </template>
              </a-input>
            </a-form-item>
          </div>
          <a-form-item label="匹配" name="questionRule">
            <div class="icon-blue-1">*</div>
            <a-radio-group v-model:value="formState.questionRule">
              <a-radio value="1">固定匹配</a-radio>
              <a-radio value="2">任意顺序</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
        <!-- 判断题 -->
        <div v-if="activeKey == '4'">
          <a-form-item label="答案" name="answer" :rules="[{ required: true, message: '请选择!' }]">
            <a-radio-group v-model:value="formState.answer">
              <a-radio value="1">正确</a-radio>
              <a-radio value="2">错误</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
        <!-- 问答题 -->
        <div v-if="activeKey == '5'">
          <a-form-item label="关键词">
            <div class="icon-blue-1">*</div>
            <a-button style="margin-right: 10px" @click="addKeyword">加关键词</a-button>
            <a-button @click="delKeyword">减关键词</a-button>
          </a-form-item>
          <div v-for="(item, index) in formState.answer" :key="index">
            <a-form-item :label="`关键词${index + 1}`">
              <a-input style="width: 90%" v-model:value="formState.answer[index]" show-count :maxlength="300" placeholder="请在此处输入关键词内容">
                <template #suffix>
                  <a-tooltip title="若有多个备选关键词用/隔开">
                    <info-circle-outlined style="color: rgba(0, 0, 0, 0.45)" />
                  </a-tooltip>
                </template>
              </a-input>
            </a-form-item>
          </div>
        </div>
        <!-- 解析 -->
        <a-form-item label="解析" name="analysis">
          <a-textarea v-model:value="formState.analysis" show-count :maxlength="1000" :rows="4" placeholder="请输入解析" />
        </a-form-item>
        <a-form-item label="">
          <div style="margin-left: 120px">
            <JImageUpload :fileMax="10" text="" v-model:value="formState.analysisFile" />
          </div>
        </a-form-item>
      </a-form>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { saveOrUpdateQuestion, detailByQuestionId } from './questions.api';
  import { CheckOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
  import { message, FormInstance } from 'ant-design-vue';
  import { JImageUpload } from '/@/components/Form';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const activeKey = ref('1');
  const labelCol = { style: { width: '120px' } };
  const wrapperCol = { span: 19 };
  const formRef: any = ref<FormInstance>();
  const tabList = ref([
    {
      key: '1',
      title: '单选题',
      closable: false,
    },
    {
      key: '2',
      title: '多选题',
      closable: false,
    },
    {
      key: '3',
      title: '填空题',
      closable: false,
    },
    {
      key: '4',
      title: '判断题',
      closable: false,
    },
    {
      key: '5',
      title: '问答题',
      closable: false,
    },
  ]);
  const formState: any = reactive({
    questionExtent: '1',
    questionName: '',
    knowledgePoint: '',
    questionNameFile: '',
    optionsNum: null,
    questionList: {
      A: null,
      B: null,
      C: null,
      D: null,
      E: null,
      F: null,
      G: null,
      H: null,
      I: null,
      J: null,
    },
    fileList: {
      A: '',
      B: '',
      C: '',
      D: '',
      E: '',
      F: '',
      G: '',
      H: '',
      I: '',
      J: '',
    },
    answer: [],
    analysis: '',
    analysisFile: '',
    questionRule: '1',
  });
  const optionsList: any = ref(['A', 'B', 'C', 'D']);
  const labelAll = ref(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
  // 获取题库id
  const questionBankId = ref('');
  // 获取题目id
  const questionId = ref('');
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    questionBankId.value = data.questionBankId;
    //重置表单
    formRef.value.resetFields();
    questionId.value = '';
    // 初始化formState
    activeKey.value = '1';
    resetFormState();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      questionId.value = data.record.id;
      //获取详情
      let res = await detailByQuestionId(data.record.id);
      setFormState(res);
    }
  });
  function setFormState(record) {
    activeKey.value = record.questionType;
    formState.questionExtent = record.questionExtent;
    formState.knowledgePoint = record.knowledgePoint;
    formState.questionName = record.questionName;
    formState.questionNameFile = record.questionNameFile;
    optionsList.value = record.questionList.map((item) => item.key);
    if (record.questionType == '2') {
      formState.answer = record.answer.split(',');
      record.questionList.forEach((item) => {
        formState.questionList[item.key] = item.value;
        formState.fileList[item.key] = item.file;
      });
    }
    if (record.questionType == '3') {
      formState.answer = record.answer.split(',');
    }
    if (record.questionType == '5') {
      formState.answer = record.questionList.map((item) => item.value);
      formState.optionsNum = record.optionsNum;
    }
    if (record.questionType == '1') {
      formState.answer = record.answer;
      record.questionList.forEach((item) => {
        formState.questionList[item.key] = item.value;
        formState.fileList[item.key] = item.file;
      });
    }
    if (record.questionType == '4') {
      formState.answer = record.answer == '正确' ? '1' : '2';
    }
    formState.analysis = record.analysis;
    formState.analysisFile = record.analysisFile;
    formState.questionRule = record.questionRule;
  }
  function resetFormState() {
    Object.assign(formState, {
      questionExtent: '1',
      questionName: '',
      knowledgePoint: '',
      questionNameFile: '',
      optionsNum: null,
      questionList: {
        A: null,
        B: null,
        C: null,
        D: null,
        E: null,
        F: null,
        G: null,
        H: null,
        I: null,
        J: null,
      },
      fileList: {
        A: '',
        B: '',
        C: '',
        D: '',
        E: '',
        F: '',
        G: '',
        H: '',
        I: '',
        J: '',
      },
      answer: [],
      analysis: '',
      analysisFile: '',
      questionRule: '1',
    });
    optionsList.value = ['A', 'B', 'C', 'D'];
    labelAll.value = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  }
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新建试题' : '编辑试题'));
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await formRef.value.validate();
      console.log('values', values);
      setModalProps({ confirmLoading: true });
      if (activeKey.value == '1' || activeKey.value == '2') {
        // 如果选项A为空，则不提交
        if (!formState.questionList['A'] && !formState.fileList['A']) {
          message.error('选项A不能为空');
          return;
        }
        // 如果选项B为空，则不提交
        if (!formState.questionList['B'] && !formState.fileList['B']) {
          message.error('选项B不能为空');
          return;
        }
      }
      // 组装数据
      let params = {};
      // 多选题
      if (activeKey.value == '1' || activeKey.value == '2') {
        params = {};
        let answer = '';
        if (activeKey.value == '2') {
          if (formState.answer.length > 0) {
            answer = formState.answer.join(',');
          } else {
            message.error('请选择正确答案');
            return;
          }
        } else {
          if (formState.answer.length == 0) {
            message.error('请选择正确答案');
            return;
          } else {
            answer = formState.answer;
          }
        }

        let questionList: any = [];
        for (let key in formState.questionList) {
          if (formState.questionList[key]) {
            questionList.push({
              key: key,
              value: formState.questionList[key],
              file: formState.fileList[key],
            });
          }
        }
        params = {
          questionBankId: questionBankId.value,
          questionExtent: formState.questionExtent,
          questionType: activeKey.value,
          questionName: formState.questionName,
          knowledgePoint: formState.knowledgePoint,
          questionNameFile: formState.questionNameFile,
          questionList: questionList,
          answer: answer,
          analysis: formState.analysis,
          analysisFile: formState.analysisFile,
        };
        console.log('params', params);
      }
      // 3 填空题
      if (activeKey.value == '3') {
        if (formState.answer.length == 0) {
          message.error('请添加空');
          return;
        }
        params = {};
        let answer = '';
        answer = formState.answer.join(',');
        let questionList: any = [];
        formState.answer.forEach((item, index) => {
          questionList.push({
            key: index + 1,
            value: item,
          });
        });
        params = {
          questionBankId: questionBankId.value,
          questionExtent: formState.questionExtent,
          questionName: formState.questionName,
          knowledgePoint: formState.knowledgePoint,
          questionType: activeKey.value,
          questionNameFile: formState.questionNameFile,
          questionList: questionList,
          answer: answer,
          analysis: formState.analysis,
          analysisFile: formState.analysisFile,
          questionRule: formState.questionRule,
        };
        console.log('params', params);
      }
      // 4 判断题
      if (activeKey.value == '4') {
        if (!formState.answer) {
          message.error('请选择正确答案');
          return;
        }
        params = {};
        params = {
          questionBankId: questionBankId.value,
          questionExtent: formState.questionExtent,
          questionName: formState.questionName,
          knowledgePoint: formState.knowledgePoint,
          questionType: activeKey.value,
          questionNameFile: formState.questionNameFile,
          questionList: [],
          answer: formState.answer == '1' ? '正确' : '错误', // 1正确 2错误
          analysis: formState.analysis,
          analysisFile: formState.analysisFile,
        };
        console.log('params', params);
      }
      // 5 问答题
      if (activeKey.value == '5') {
        if (formState.answer.length == 0) {
          message.error('请添加关键词');
          return;
        }
        params = {};
        let questionList: any = [];
        formState.answer.forEach((item, index) => {
          questionList.push({
            key: index + 1,
            value: item,
          });
        });
        console.log('formState answer', formState.answer);
        let answer = '';
        answer = formState.answer.join(',');
        params = {
          questionBankId: questionBankId.value,
          questionExtent: formState.questionExtent,
          questionName: formState.questionName,
          knowledgePoint: formState.knowledgePoint,
          questionType: activeKey.value,
          questionNameFile: formState.questionNameFile,
          questionList: questionList,
          answer: answer,
          analysis: formState.analysis,
          analysisFile: formState.analysisFile,
          optionsNum: formState.optionsNum,
        };
        console.log('params', params);
      }
      if (isUpdate.value) {
        params['id'] = questionId.value;
      }
      await saveOrUpdateQuestion(params, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
  const choseAnswer = (item) => {
    formState.answer = item;
  };
  const add = () => {
    console.log('add');
    formState.answer = [];
    if (optionsList.value.length >= 10) {
      message.error('最多添加10个选项');
      return;
    }
    optionsList.value.push(labelAll.value[optionsList.value.length]);
  };
  const del = () => {
    console.log('del');
    // 清空答案
    formState.answer = [];
    if (optionsList.value.length <= 2) {
      message.error('最少保留2个选项');
      return;
    }
    optionsList.value.pop();
  };
  const choseSelectAnswer = (item) => {
    console.log('choseSelectAnswer');
    if (!formState.answer) {
      formState.answer = [];
    }
    if (formState.answer.indexOf(item) !== -1) {
      formState.answer = formState.answer.filter(function (it: any) {
        return it != item;
      });
    } else {
      formState.answer = formState.answer.concat(item);
    }
    console.log('formState.answer', formState.answer);
  };
  const addSpace = () => {
    console.log('addSpace');
    // 最多10个空
    if (formState.answer.length >= 10) {
      message.error('最多添加10个空');
      return;
    }
    formState.answer.push('');
  };
  const delSpace = () => {
    console.log('delSpace');
    if (formState.answer.length <= 1) {
      message.error('最少保留1个空');
      return;
    }
    formState.answer.pop();
  };
  const addKeyword = () => {
    console.log('addKeyword');
    // 最多10个关键词
    if (formState.answer.length >= 10) {
      message.error('最多添加10个关键词');
      return;
    }
    formState.answer.push('');
  };
  const delKeyword = () => {
    console.log('delKeyword');
    if (formState.answer.length <= 1) {
      message.error('最少保留1个关键词');
      return;
    }
    formState.answer.pop();
  };
  const handleTabChange = (key) => {
    activeKey.value = key;
    formState.answer = [];
    formState.questionExtent = '1';
    formState.questionName = '';
    formState.knowledgePoint = '';
    formState.questionRule = '1';
    if ((key == '1' || key == '2') && !isUpdate.value) {
      optionsList.value = ['A', 'B', 'C', 'D'];
    }
    // resetFormState();
  };
</script>
<style lang="less" scoped>
  :deep(.ant-upload-list-picture-card-container) {
    display: inline-block;
    width: 60px;
    height: 60px;
    margin: 0 8px 8px 0;
    vertical-align: top;
  }
  :deep(.ant-upload.ant-upload-select-picture-card) {
    width: 60px;
    height: 60px;
    margin-right: 8px;
    margin-bottom: 8px;
    text-align: center;
    vertical-align: top;
    background-color: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
    cursor: pointer;
    transition: border-color 0.3s;
  }
  .select-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
  .circle-btn {
    position: absolute;
    right: 0;
    top: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.15);
  }
  .circle-btn-active {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
  .correct-label {
    position: absolute;
    right: -18px;
    top: 5px;
  }
  .icon-blue {
    color: #3e87f8;
    display: inline-block;
    vertical-align: middle;
  }
  .icon-blue-1 {
    position: absolute;
    z-index: 100;
    left: -52px;
    top: 7px;
    color: #3e87f8;
  }
  .box-btn {
    position: absolute;
    right: 0;
    top: 0;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.3);
  }
  .box-btn-active {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: rgb(4, 200, 119);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
