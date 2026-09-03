<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="600" :bodyStyle="{ padding: '0 20px 20px 20px' }" title="报告审核">
      <basic-form @register="registerForm" />
      <template #footer>
        <div style="text-align: center">
          <a-button @click="close">取消</a-button>
          <a-button type="primary" :loading="confirmLoading" @click="confirm">确认</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="report-review-model" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { buttonAdd } from './url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref } from 'vue';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  const confirmLoading = ref(false);
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'eventId',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'type',
      component: 'Input',
      show: false,
    },
    {
      label: '审核说明',
      field: 'closeInfo',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        maxlength: 200,
        rows: 5,
      },
    },
  ];
  //表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setFieldsValue({ eventId: data.id, type: data.status === 9 ? 10 : 7 });
  });
  const close = () => {
    closeModal();
  };
  const confirm = async () => {
    try {
      const values = await validate();
      confirmLoading.value = true;
      await buttonAdd(values)
        .then((res) => {
          if (res.success) {
            createMessage.success('审核完成！');
            //刷新列表
            emit('success', values.type === '10' ? 10 : 7);
            //关闭弹窗
            closeModal();
          } else {
            createMessage.error(res.message);
          }
        })
        .finally(() => {
          confirmLoading.value = false;
        });
    } catch (e) {}
  };
</script>
