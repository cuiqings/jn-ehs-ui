<template>
  <div>
    <basic-modal
      v-bind="$attrs"
      @register="registerModal"
      :width="600"
      :bodyStyle="{ padding: '10px 20px 0 0' }"
      :title="title"
      :maskClosable="false"
      destroyOnClose
    >
      <BasicForm @register="registerForm" />
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">确认</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="fraction-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { updateScore } from './api';
  const emit = defineEmits(['success']);
  const loading = ref(false);
  const title = ref('新增加分');
  const type = ref('1');
  const id = ref('');
  const formSchema: FormSchema[] = [
    {
      label: '加分分值',
      field: 'score',
      component: 'InputNumber',
      required: true,
      componentProps: {
        min: 0,
        precision: 2,
        controls: false,
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '原因',
      field: 'reason',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        rows: 3,
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await resetFields();
    title.value = data.title;
    type.value = data.type;
    id.value = data.data.id;
    updateSchema({
      label: type.value === '1' ? '加分分值' : '扣分分值',
      field: 'score',
    });
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    const values = await validate();
    loading.value = true;
    let params: any = {};
    if (type.value === '1') {
      params.increaseScore = values.score;
      params.increaseReason = values.reason;
    } else {
      params.deductScore = values.score;
      params.deductReason = values.reason;
    }
    updateScore({
      id: id.value,
      ...params,
      type: type.value,
    })
      .then((res) => {
        if (res) {
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
</script>
<style lang="less" scoped></style>
