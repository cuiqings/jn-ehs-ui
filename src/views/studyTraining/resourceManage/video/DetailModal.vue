<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="试题" @ok="handleSubmit" width="700px" destroyOnClose>
    <div>
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="题目" name="questionName" :rules="[{ required: true, message: '请输入!' }]">
          <a-input style="width: 100%" v-model:value="formState.questionName" show-count :maxlength="300" />
        </a-form-item>
        <!-- <a-form-item label="">
          <div style="margin-left: 120px">
            <JImageUpload :fileMax="10" text="" v-model:value="formState.questionNameFile" />
          </div>
        </a-form-item> -->
        <div>
          <a-form-item label="选项">
            <div class="icon-blue-1">*</div>
            <a-button style="margin-right: 10px" @click="add">加选项</a-button>
            <a-button @click="del">减选项</a-button>
            <div class="correct-label">
              <span class="icon-blue">*</span>
              正确答案
            </div>
          </a-form-item>
          <div v-for="item in label" :key="item">
            <a-form-item :label="`选项${item}`">
              <a-input style="width: 90%" v-model:value="formState.questionList[item]" show-count :maxlength="300" />
              <div>
                <div class="circle-btn" @click="choseAnswer(item)"></div>
                <img
                  v-if="item == formState.answer"
                  class="circle-btn-active"
                  src="/@/assets/images/exam/icon-adopt.png"
                  alt=""
                  @click="choseAnswer(item)"
                />
              </div>
            </a-form-item>
            <!-- <a-form-item label="">
              <div style="margin-left: 120px; margin-top: -15px">
                <JImageUpload :fileMax="10" text="" v-model:value="formState.fileList[item]" />
              </div>
            </a-form-item> -->
          </div>
        </div>
        <!-- 解析 -->
        <a-form-item label="解析" name="analysis">
          <a-textarea v-model:value="formState.analysis" show-count :maxlength="1000" :rows="4" placeholder="请输入解析" />
        </a-form-item>
        <!-- <a-form-item label="">
          <div style="margin-left: 120px">
            <JImageUpload :fileMax="10" text="" v-model:value="formState.analysisFile" />
          </div>
        </a-form-item> -->
      </a-form>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { message, FormInstance } from 'ant-design-vue';
  import { JImageUpload } from '/@/components/Form';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const labelCol = { style: { width: '120px' } };
  const wrapperCol = { span: 19 };
  const formRef: any = ref<FormInstance>();
  const formState = reactive({
    questionName: '',
    questionNameFile: '',
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
    answer: '',
    analysis: '',
    analysisFile: '',
  });
  const label = ref(['A', 'B', 'C', 'D']);
  const labelAll = ref(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
  const index = ref(0);
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    index.value = data.index;
    //重置表单
    formRef.value.resetFields();
    // 初始化formState
    resetFormState();
    Object.assign(formState, data.from);
    data.from.questionList.forEach((item) => {
      formState.questionList[item.key] = item.value;
      formState.fileList[item.key] = item.file;
    });
    setModalProps({ confirmLoading: false });
  });
  function resetFormState() {
    formState.questionName = '';
    formState.questionNameFile = '';
    formState.questionList = {
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
    };
    formState.fileList = {
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
    };
    formState.answer = '';
    formState.analysis = '';
    formState.analysisFile = '';
  }
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await formRef.value.validate();
      console.log('values', values);
      setModalProps({ confirmLoading: true });
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
      if (!formState.answer) {
        message.error('请选择正确答案');
        return;
      }
      // 组装数据
      let params = {};
      let questionList: any[] = [];
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
        questionName: formState.questionName,
        questionNameFile: formState.questionNameFile,
        questionList: questionList,
        answer: formState.answer,
        analysis: formState.analysis,
        analysisFile: formState.analysisFile,
      };
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', params, index.value);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
  const choseAnswer = (item) => {
    formState.answer = item;
  };
  const add = () => {
    formState.answer = '';
    if (label.value.length >= 10) {
      message.error('最多添加10个选项');
      return;
    }
    label.value.push(labelAll.value[label.value.length]);
  };
  const del = () => {
    // 清空答案
    formState.answer = '';
    if (label.value.length <= 2) {
      message.error('最少保留2个选项');
      return;
    }
    label.value.pop();
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
    top: 0;
  }
  .icon-blue {
    color: red;
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
