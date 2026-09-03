<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="onSubmit">
      <!-- <div class="deadline-wrap"><span class="report-deadline">工作要求：</span>{{ curRecord.jobRequirement }}</div> -->
      <div class="deadline-wrap"
        ><span class="report-deadline">汇报周期：</span>{{ curRecord.reportCycle }}
        <span style="display: inline-block; margin-left: 10px; color: #cd2b1d">{{ curRecord.tag }}</span>
        <span></span>
      </div>
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
      
 <script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { reportTask } from './report.api';
import { useMessage } from '/@/hooks/web/useMessage';
import { UploadTypeEnum } from '/@/components/Form/src/jeecg/components/JUpload';
const { createMessage } = useMessage();
const emit = defineEmits(['register', 'success']);
const title = ref('补交汇报');
const curRecord = ref({});
// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields }] = useForm({
  schemas: [
    {
      field: 'finishExplain',
      label: '汇报说明',
      component: 'InputTextArea',
      required: true,
      rules: [
        { required: true, message: '请输入汇报说明！' },
        { min: 0, max: 800, message: '长度不能超过 800 个字符', trigger: 'blur' },
      ],
    },
    {
      field: 'attachmentImg',
      component: 'JUpload',
      label: '上传图片',
      componentProps: {
        fileType: UploadTypeEnum.image,
        maxCount: 10,
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            createMessage.error('图拍过大，请不要超过300M！');
          }
          return isLt300M;
        },
      },
    },
    {
      field: 'attachmentFile',
      component: 'JUpload',
      componentProps: {
        biz: 'eia',
        maxCount: 5,
        text: '上传',
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            createMessage.error('文件过大，请不要超过300M！');
          }
          return isLt300M;
        },
      },
      label: '附件',
    },
  ],
  showActionButtonGroup: false,
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
});
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  curRecord.value = data.record;

  // 下次点击弹窗的时候清空表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  if (data.record.tag === '验收未通过') {
    title.value = '重新提交';
    // 表单赋值
    setFieldsValue({
      finishExplain: data.record.finishExplain,
      attachmentImg: data.record.attachmentImg,
      attachmentFile: data.record.attachmentFile,
    });
  }
});

async function onSubmit() {
  const values = await validate();
  console.log('validate value', values);
  values.id = curRecord.value.id;
  await reportTask(values);
  closeModal();
  emit('success');
}
</script>
      
  <style scoped>
.deadline-wrap {
  font-size: 13px;
  margin-bottom: 20px;
}
.report-deadline {
  display: inline-block;
  width: 25%;
  text-align: right;
}
.already-text {
  text-align: center;
  font-size: 16px;
  color: #ff8d04;
  margin-top: 20px;
}
</style>
      