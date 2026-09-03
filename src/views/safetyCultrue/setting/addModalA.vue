<template>
  <BasicModal @register="registerModal" v-bind="$attrs" :title="title" @ok="submit" @close="close" @cancel="close">
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item label="理念内容" name="playContent" :rules="[{ required: true, message: '请输入' }]">
        <a-textarea :auto-size="{ minRows: 2, maxRows: 5 }" v-model:value="formState.playContent" :maxLength="80" placeholder="请输入安全理念" />
      </a-form-item>

      <a-form-item label="排序" name="sort" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.sort" :maxLength="10" placeholder="请输入序号" />
      </a-form-item>

      <a-form-item label="首页轮播" name="displayFlag">
        <a-switch
          v-model:checked="formState.displayFlag"
          checked-children="开启"
          un-checked-children="关闭"
          checked-value="1"
          un-checked-value="2"
        />
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
  const formState = ref({
    playContent: '',
    type: '1',
    sort: null,
    displayFlag: '2',
  });
  const title = ref('新增理念');
  const [registerModal, { closeModal }] = useModalInner((data) => {
    title.value = data.title;
    if (title.value == '编辑理念') {
      formState.value = data.record;
    }
  });

  const emits = defineEmits(['success']);
  const submit = () => {
    formRef.value?.validate().then(() => {
      if (title.value == '编辑理念') {
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
    formState.value = {
      playContent: '',
      type: '1',
      sort: null,
      displayFlag: '2',
    };
  };
</script>
