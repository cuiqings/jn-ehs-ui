<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="复审/换证" @ok="onSubmit" width="700px" destroyOnClose>
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { getReexamine } from './certificate.api';
  import dayjs from 'dayjs';
  import { message, Upload } from 'ant-design-vue';
  const emit = defineEmits(['success', 'register']);
  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '所属单位',
      field: 'organizationName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '车间',
      field: 'departName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '人员姓名',
      field: 'userRealname',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '证件编号',
      field: 'certificationsCode',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '下次复审/换证日期',
      field: 'reviewTime',
      required: true,
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          return current && dayjs(current).isBefore(dayjs(new Date()).subtract(1, 'day'));
        },
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'InputTextArea',
      componentProps: {
        rows: 3,
        maxLength: 50,
      },
    },
    {
      label: '文件上传',
      field: 'filePath',
      required: true,
      component: 'JUpload',
      componentProps: {
        text: '添加附件',
        maxCount: 3,
        beforeUpload: (file: File) => {
          const isPdf = file.type === 'application/pdf';
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf) {
            message.error(`文件格式错误，仅支持pdf格式！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
  ];
  const [registerForm, { validate, setFieldsValue, clearValidate }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 17 },
    },
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    const obj = JSON.parse(JSON.stringify(data.record));
    obj.reviewTime = undefined;
    obj.remark = '';
    obj.filePath = '';
    await setFieldsValue({
      ...obj,
    });
    clearValidate(['reviewTime', 'filePath']);
    setModalProps({
      confirmLoading: false,
    });
  });

  async function onSubmit() {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    try {
      await getReexamine(values);
      closeModal();
      emit('success');
      setModalProps({ confirmLoading: false });
    } catch {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped></style>
