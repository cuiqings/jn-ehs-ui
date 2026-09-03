<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
    
  <script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { endTask } from './publish.api';
import { duplicateCheck } from '/@/views/system/user/user.api';
import { message, Upload } from 'ant-design-vue';
import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const getTitle = computed(() => (!unref(isUpdate) ? '关闭任务' : '关闭任务'));
const roleId = ref('');
const curRecord = ref({});
// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields }] = useForm({
  schemas: [
    {
      label: 'id',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'closeReason',
      label: '关闭原因',
      component: 'Select',
      defaultValue: '1',
      componentProps: {
        options: [
          { label: '已完成', value: '1' },
          { label: '目标变更', value: '2' },
          { label: '重复任务', value: '3' },
          { label: '其它原因', value: '4' },
        ],
      },
      rules: [{ required: true, message: '请选择关闭原因！' }],
    },
    {
      label: '关闭说明',
      field: 'closeDesc',
      component: 'InputTextArea',
      rules: [
        { min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' },
      ],
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
  if (data.record.id) {
    // const res = await duplicateCheck({ recordId: curRecord.value.recordId });
    // if (res.success) {
    //   if (res.data) {
    //     message.error('该任务已申请延期，请勿重复申请！');
    //     return;
    //   }
    // }
  }

  // 下次点击弹窗的时候清空表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  console.log('data.record', data.record);
});

async function onSubmit() {
  const values = await validate();
  console.log('validate value', values);
  if (!values) {
    return;
  }
  let params = Object.assign({}, curRecord.value);
  params.closeReason = values.closeReason;
  params.closeDesc = values.closeDesc;
  await endTask(params);
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
    