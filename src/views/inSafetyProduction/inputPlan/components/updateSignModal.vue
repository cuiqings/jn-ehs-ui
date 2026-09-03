<template>
  <BasicModal :can-fullscreen="false" v-bind="$attrs" @register="registerModal" title="上传签字文件" @ok="handleOk">
    <a-form :model="formState" ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="选择签字文件:" :rules="[{ required: true, message: '请上传签字文件' }]" name="filePath" align="left">
        <JUpload ref="uploadRef" :maxCount="1" v-model:value="formState.filePath" text="上传附件" />
      </a-form-item>
      <a-alert type="success" show-icon :closable="false" style="margin-top: 16px">
        <template #message>
          <span>
            <span style="color: #52c41a; font-weight: bold">支持文件格式：</span>
            <span style="color: #52c41a">PDF、Word、图片文件</span>
          </span>
          <br />
          <span style="color: #666">请确保签字文件清晰完整</span>
        </template>
      </a-alert>
    </a-form>
  </BasicModal>
</template>
<script setup lang="ts">
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { inputPlanUploadSignature } from '../api';
  import { BasicModal } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useModalInner } from '/@/components/Modal';

  const emit = defineEmits(['success']);
  const record = ref<any>({});
const [registerModal, { closeModal, changeLoading }] = useModalInner((data) => {
    record.value = data.record;
  });
  const formState = ref({
    filePath: '',
  });
  const formRef = ref<FormInstance|null>(null);
  const handleOk = () => {
    formRef.value?.validate().then(() => {
      changeLoading(true);
      inputPlanUploadSignature({ id: record.value.id, ...formState.value })
        .then((res) => {
          closeModal();
          changeLoading(false);
          emit('success');
        })
        .catch((_) => {
          changeLoading(false);
        });
    });
  };
</script>
