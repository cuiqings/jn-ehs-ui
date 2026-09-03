<template>
  <BasicModal @register="registerModal" :title="getTitle" width="600px" @ok="handleSubmit">
    <div style="display: flex; align-items: center; justify-content: center; margin: 15px">
      <p v-if="!isBatch && !isRelief">已选 {{ type }} - {{ name }} , 是否确认更新?</p>
      <p v-else-if="!isBatch && isRelief">已选 {{ type }} - {{ name }} 的安全阀, 是否确认更新?</p>
      <p v-else>已选 {{ number }} 个特种设备, 是否确认全部更新?</p>
    </div>

    <div>
      <BasicForm @register="registerForm" />
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { check, checkBatch, reliefCheck } from './url';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { FormSchema } from '/@/components/Table';
  import dayjs, { Dayjs } from 'dayjs';

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const rowId = ref('');
  const isBatch = ref(); // 是否批量操作模式
  const isRelief = ref(false); // 是否为安全阀校验
  const ids = ref('');
  let getTitle = ref('');
  const name = ref('');
  const number = ref(0);
  let type = ref('');
  const infoSingle = ref<any>({
    checkVos: [
      {
        checkType: '',
        id: '',
      },
    ],
    nextCheckDate: '',
    remark: '',
  });
  const infoBatch = ref<any>({
    checkVos: [
      {
        checkType: '',
        id: '',
      },
    ],
    nextCheckDate: '',
    remark: '',
  });

  const checkFormSchema: FormSchema[] = [
    {
      label: '下次检定日期',
      field: 'nextCheckDate',
      component: 'DatePicker',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current: Dayjs) => {
          return current && current < dayjs(new Date()).endOf('day');
        },
        getPopupContainer: () => document.body,
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'Input',
    },
  ];

  // 根据布尔值A动态生成表单 schema
  const dynamicCheckFormSchema = isRelief.value ? checkFormSchema.filter((schema) => schema.field !== 'remark') : checkFormSchema;

  // 表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, removeSchemaByFiled }] = useForm({
    schemas: dynamicCheckFormSchema,
    showActionButtonGroup: false,
  });

  // 表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //获取传来的data里的值
    isBatch.value = data.isBatch;
    isRelief.value = data.isRelief;

    //获取标题
    if (!isBatch.value) {
      if (isRelief.value) {
        getTitle.value = '安全阀校验';
        removeSchemaByFiled('remark');
      } else {
        getTitle.value = '设备检验';
      }
    } else {
      console.log('isBatch', isBatch.value);
      getTitle.value = '批量检验特种设备';
    }

    if (!isBatch.value) {
      //获取设备名称
      name.value = data.record.deviceName;
      //获取设备类型
      if (data.record.deviceType == 1) {
        type.value = '起重机械';
      } else if (data.record.deviceType == 2) {
        type.value = '叉车';
      } else if (data.record.deviceType == 3) {
        type.value = '锅炉';
      } else if (data.record.deviceType == 4) {
        type.value = '压力容器';
      }
    } else {
      //获取已选设备数量和id数组
      number.value = data.records.length;
      ids.value = data.records;
    }

    // 重置表单
    await resetFields();
    setModalProps({ confirmLoading: false, minHeight: 180 });

    // 表单赋值
    if (!isBatch.value) {
      if (data?.record) {
        rowId.value = data.record.id;
        await setFieldsValue({
          ...data.record,
        });
      }
    }
  });

  // 表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      console.log('values', values);

      if (!isBatch.value) {
        if (!isRelief.value) {
          //当前行设备检验
          infoSingle.value.nextCheckDate = values.nextCheckDate;
          infoSingle.value.remark = values.remark;
          setModalProps({ confirmLoading: true });
          await check(infoSingle.value, rowId.value);
        } else if (isRelief.value) {
          //当前行安全阀校验
          setModalProps({ confirmLoading: true });
          await reliefCheck(values.nextCheckDate, rowId.value);
        }
      } else {
        //选中行批量设备检验
        infoBatch.value.nextCheckDate = values.nextCheckDate;
        infoBatch.value.remark = values.remark;
        setModalProps({ confirmLoading: true });
        await checkBatch(infoBatch.value, ids.value);
      }

      // 关闭弹窗
      closeModal();

      // 刷新列表
      if (isBatch.value) {
        emit('success', { infoSingle });
      } else {
        emit('success', { infoBatch });
      }
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
