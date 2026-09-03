<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="启用报警" @ok="onSubmit" width="600px">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="设备名称">
        <span style="margin-right: 5px" v-for="(item, index) in deviceList" :key="index">
          <span v-if="index == 0">{{ item.deviceName }}</span>
          <span v-else> , {{ item.deviceName }}</span>
        </span>
      </a-form-item>
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
      
    <script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { startDevice } from './device.api';
import { duplicateCheck } from '/@/views/system/user/user.api';
import { message, Upload } from 'ant-design-vue';
import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
import dayjs from 'dayjs';
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const deviceIds = ref([]);
const labelCol = {
  xs: { span: 24 },
  sm: { span: 6 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 18 },
};
const deviceList = ref([]);
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
      label: '启用开始时间',
      field: 'startTime',
      component: 'DatePicker',
      required: true,
      componentProps: {
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          console.log('current', current);
          return current < dayjs().startOf('day');
        },
      },
    },
    {
      label: '报警启用原因',
      field: 'info',
      component: 'InputTextArea',
      componentProps: {
        style: {
          marginBottom: '150px',
        },
        rows: 4,
      },
      rules: [
        { min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
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
  deviceList.value = data.deviceList;
  data.deviceList.forEach((item) => {
    deviceIds.value.push(item.deviceId);
  });
  // 下次点击弹窗的时候清空表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  //表单赋值
//   await setFieldsValue({
//     completeTimeLimit: data.record.completeTimeLimit,
//   });
});

async function onSubmit() {
  const values = await validate();
  console.log('validate value', values);
  if (!values) {
    return;
  }
  let params = Object.assign({}, values);
  params.ids = deviceIds.value;
  await startDevice(params);
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
      