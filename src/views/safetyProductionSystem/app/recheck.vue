<template>
  <div style="padding: 20px">
    <BasicForm @register="registerForm" />
    <div style="text-align: center; padding-top: 20px">
      <a-button style="width: 100%" size="large" type="primary" @click="handleSubmit">提交</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { getReexamine } from '../certificate/certificate.api';
  import { useRouter, useRoute } from 'vue-router';
  import { message, Upload } from 'ant-design-vue';
  import dayjs from 'dayjs';
  const router = useRouter();
  const route = useRoute();
  const schemas: any = [
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
  const [registerForm, { validate }] = useForm({
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

  async function handleSubmit() {
    const values = await validate();
    getReexamine({
      ...values,
      id: route.query.id,
    }).then(() => {
      router.go(-1);
    });
  }
</script>

<style lang="less" scoped></style>
