<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" width="600px" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" name="major-hazard-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate } from './majorHazard.api';
  import { formSchema } from './majorHazard.data';

  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(false);
  const getTitle = ref('');
  const recordId = ref('');

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    isUpdate.value = data?.isUpdate;
    getTitle.value = data?.title || '新增';

    await resetFields();
    setModalProps({ confirmLoading: false });

    if (data?.isUpdate && data?.record) {
      recordId.value = data.record.id;
      await setFieldsValue(data.record);
    } else {
      recordId.value = '';
    }
  });

  const [registerForm, { validate, setFieldsValue, resetFields }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: { span: 7 },
    wrapperCol: { span: 15 },
  });

  async function onSubmit() {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    const params = { ...values };
    if (isUpdate.value) {
      params.id = recordId.value;
    }
    try {
      await saveOrUpdate(params, isUpdate.value);
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
