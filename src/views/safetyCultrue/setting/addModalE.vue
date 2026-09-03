<template>
  <BasicModal @register="registerModal" v-bind="$attrs" :title="title" @ok="submit" @close="close" @cancel="close">
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item label="类型" name="isTop" :rules="[{ required: true, message: '请选择' }]">
        <a-select v-model:value="formState.isTop" placeholder="请选择类型">
          <a-select-option value="1">政府发布</a-select-option>
          <a-select-option value="2">企业发布</a-select-option>
          <a-select-option value="3">案例信息</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="标题" name="title" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.title" :maxLength="50" placeholder="请输入标题" />
      </a-form-item>

      <a-form-item label="内容" name="playContent" :rules="[{ required: true, message: '请输入' }]">
        <a-textarea :auto-size="{ minRows: 3, maxRows: 6 }" v-model:value="formState.playContent" placeholder="请输入内容" />
      </a-form-item>

      <a-form-item label="发布时间" name="playDate" :rules="[{ required: true, message: '请选择' }]">
        <a-date-picker v-model:value="formState.playDate" value-format="YYYY-MM-DD" placeholder="请选择发布时间" style="width: 100%" />
      </a-form-item>

      <a-form-item label="标签" name="playLocation">
        <a-input v-model:value="formState.playLocation" :maxLength="20" placeholder="请输入标签" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { add, edit } from '../api';
  import { ref } from 'vue';

  const formRef = ref<FormInstance | null>(null);
  const defaultForm = () => ({
    isTop: undefined,
    title: '',
    playContent: '',
    playDate: undefined,
    playLocation: '',
    type: '5',
    displayFlag: '2',
  });
  const formState = ref(defaultForm());
  const title = ref('新增安全文化宣传');
  const [registerModal, { closeModal }] = useModalInner((data) => {
    title.value = data.title;
    if (title.value == '编辑安全文化宣传') {
      formState.value = data.record;
    }
  });

  const emits = defineEmits(['success']);
  const submit = () => {
    formRef.value?.validate().then(() => {
      if (title.value == '编辑安全文化宣传') {
        edit(formState.value).then((res) => {
          emits('success', res);
          closeModal();
          formRef.value?.resetFields();
        });
        return;
      }
      add(formState.value).then((res) => {
        emits('success', res);
        closeModal();
        formRef.value?.resetFields();
      });
    });
  };
  const close = () => {
    closeModal();
    formRef.value?.resetFields();
    formState.value = defaultForm();
  };
</script>
