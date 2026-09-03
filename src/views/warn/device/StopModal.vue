<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="禁用报警" @ok="onSubmit">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="设备名称">
        <span style="margin-right: 5px" v-for="(item, index) in deviceList" :key="index">
          <span v-if="index == 0">{{ item.deviceName }}</span>
          <span v-else> , {{ item.deviceName }}</span>
        </span>
      </a-form-item>
      <BasicForm @register="registerForm">
        <template #stopTime="{ model, field }">
          <a-range-picker
            style="width: 100%"
            v-model:value="model[field]"
            show-time
            :disabled-date="disabledDate"
            :disabled-time="disabledRangeTime"
            @change="onChangeTime"
          />
        </template>
      </BasicForm>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { stopDevice } from './device.api';
  import { duplicateCheck } from '/@/views/system/user/user.api';
  import { message, Upload } from 'ant-design-vue';
  import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
  import dayjs, { Dayjs } from 'dayjs';
  import { del } from '../../sm/admissionApplication/url';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const deviceIds = ref([]);
  const startTime = ref('');
  const endTime = ref('');
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
        label: '禁用时间',
        field: 'stopTime',
        component: 'Input',
        required: true,
        slot: 'stopTime',
      },
      {
        label: '禁用报警原因',
        field: 'info',
        component: 'InputTextArea',
        rules: [
          { required: true, message: '请输入禁用报警原因', trigger: 'blur' },
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
  function onChangeTime(value: any, dateString: any) {
    console.log('value', value, dateString);
    startTime.value = dateString[0];
    endTime.value = dateString[1];
  }
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
    //     completeTimeLimit: vertebrate.completeTimeLimit,
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
    params.startTime = startTime.value;
    params.endTime = endTime.value;
    delete params.stopTime;
    await stopDevice(params);
    closeModal();
    emit('success');
  }
  const disabledDate = (current: Dayjs) => {
    // Can not select days before today and today
    return current && current < dayjs().startOf('day');
  };
  const range = (start: number, end: number) => {
    const result = [];

    for (let i = start; i < end; i++) {
      result.push(i);
    }

    return result;
  };
  const disabledRangeTime = (_: Dayjs, type: 'start' | 'end') => {
    if (type === 'start') {
      // 当日只能选择当前时间之后的时间点
      //  判断选的日是否是今天
      const current = dayjs().day();
      const selected = dayjs(_).day();
      if (current == selected) {
        // 获取今天的小时
        const hours = dayjs().hour();
        // 获取今天的分钟
        const minutes = dayjs().minute();
        // 获取今天的秒
        const seconds = dayjs().second();
        console.log('hours', hours, minutes, seconds);
        return {
          disabledHours: () => range(0, hours),
          disabledMinutes: () => range(0, minutes),
          disabledSeconds: () => range(0, seconds),
        };
      }
    }
  };
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
