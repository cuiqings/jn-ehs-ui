<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="600" :bodyStyle="{ padding: '0 20px 20px 20px' }" title="非事故/事件关闭">
      <basic-form @register="registerForm" />
      <template #footer>
        <div style="text-align: center">
          <a-button type="primary" :loading="nonAccidentLoading" @click="confirmClose">确认关闭</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="non-accident-model" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { buttonAdd } from './url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref } from 'vue';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  const nonAccidentLoading = ref(false);
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'eventId',
      component: 'Input',
      show: false,
    },
    {
      label: '关闭说明',
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
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({
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
    setFieldsValue({ eventId: data.id });
  });
  const confirmClose = async () => {
    try {
      const values = await validate();
      nonAccidentLoading.value = true;
      await buttonAdd({ ...values, type: 2 })
        .then((res) => {
          if (res.success) {
            createMessage.success('关闭成功！');
            //刷新列表
            emit('success', 2);
            //关闭弹窗
            closeModal();
          } else {
            createMessage.error(res.message);
          }
        })
        .finally(() => {
          nonAccidentLoading.value = false;
        });
    } catch (e) {}
  };
</script>
