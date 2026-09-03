<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" :showOkBtn="showOkBtn">
      <div class="deadline-wrap"><span class="report-deadline">汇报截止：</span>{{ curRecord.completeTimeLimit }}</div>
      <BasicForm @register="registerForm" />
      <div v-if="!showOkBtn" class="already-text"> 已提交，审核中～ </div>
    </BasicModal>
  </div>
</template>
    
  <script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { applyExtension } from './report.api';
import { formatToDate } from '/@/utils/dateUtil';
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const getTitle = computed(() => (!unref(isUpdate) ? '申请延期' : '申请延期'));
const roleId = ref('');
const curRecord = ref({});
const taskDetail = ref({});
const showOkBtn = ref(true);
// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields }] = useForm({
  schemas: [
    {
      label: '延期时限',
      field: 'delayTime',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          const today = new Date(curRecord.value.completeTimeLimit);
          // 将当前日期转换为时间戳
          const todayTimestamp = today.getTime();
          // 将当前日期之前的日期转换为时间戳
          current = new Date(formatToDate(current));

          const currentTimestamp = current.getTime();
          // 判断当前日期是否在当前日期之前
          return currentTimestamp <= todayTimestamp;
        },
      },
      rules: [{ required: true, message: '请选择延期时限！' }],
    },
    {
      label: '延期原因',
      field: 'delayReason',
      component: 'InputTextArea',
      rules: [
        { required: true, message: '请输入延期原因！' },
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
  curRecord.value = data.record.publish;
  taskDetail.value = data.record;
  if (data.record.reportId) {
    showOkBtn.value = false;
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
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
    console.log('data.record', data.record);
    roleId.value = data.record.id;
  }
});

async function onSubmit() {
  const values = await validate();
  console.log('validate value', values);
  values.id = taskDetail.value.id;
  await applyExtension(values);
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
    