<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="关联计划" @ok="onSubmit" width="500px" destroyOnClose>
      <BasicForm class="plan" @register="registerForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { modifyClearPlan } from './ledger.api';
  import { defHttp } from '/@/utils/http/axios';

  const emit = defineEmits(['success', 'register']);
  const ledgerId = ref('');
  const planOptions: any = ref([]);

  function getPlanList(subsidiaryCode) {
    planOptions.value = [];
    defHttp
      .get({
        url: '/fireManagement/jnFireKeyLedger/getClearName',
        params: { subsidiaryCode },
      })
      .then((res) => {
        planOptions.value = res;
      });
  }

  const schemas: any = [
    {
      label: '关联清理计划',
      field: 'planId',
      component: 'Select',
      componentProps: () => {
        return {
          options: planOptions.value,
          placeholder: '请选择',
        };
      },
    },
  ];
  const [registerForm, { validate, setFieldsValue }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
    },
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    const { id, subsidiaryCode, clearId } = data.record;
    data.record.planId = clearId?.replace(/\s+/g, '') === '' || !clearId ? undefined : clearId;
    ledgerId.value = id;
    getPlanList(subsidiaryCode);
    await setFieldsValue({
      ...data.record,
    });
    setModalProps({
      confirmLoading: false,
    });
  });

  async function onSubmit() {
    const values = await validate();
    values.id = ledgerId.value;
    setModalProps({ confirmLoading: true });
    try {
      if (values.planId == undefined) {
        values.planId = '';
      }
      await modifyClearPlan(values);
      closeModal();
      emit('success');
      setModalProps({ confirmLoading: false });
    } catch {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .plan {
    padding-top: 70px;
  }
</style>
