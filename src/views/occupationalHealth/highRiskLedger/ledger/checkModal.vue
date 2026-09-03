<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="550" @cancel="cancel" @ok="handleSubmit" destroyOnClose>
    <a-form ref="formRef" :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="当前数值" name="numValue" :rules="[{ required: true, message: '请选择' }]">
        <a-input v-model:value="formState.numValue" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="检测照片" name="checkFile" :rules="[{ required: true, message: '请选择' }]">
        <JUpload  ref="uploadRef" fileType="image" :maxCount="2" v-model:value="formState.checkFile" text="上传附件"  />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { detectionRecord } from '../api'
import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
import type { FormInstance } from 'ant-design-vue'
const title = ref('检验')
const emits = defineEmits(['submitSuccess']);
const formRef = ref<FormInstance|null>(null);
const formState = ref({
  checkFile: undefined,
  numValue: undefined,
  id: '',
});
const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
  formRef.value?.resetFields();
  title.value = data.title;
  formState.value.id = data.data.latestItem;
  formState.value.numValue = data.data.itemValue;
});

const handleSubmit = async () => {
  let data = JSON.parse(JSON.stringify(formState.value));
  changeOkLoading(true)
  detectionRecord(data).then(res => {
    emits('submitSuccess', data);
    cancel()
    closeModal();
    changeOkLoading(false)
  }).catch(err => {
    changeOkLoading(false)
  })
};

const cancel = () => {
  formState.value = {
    checkFile: undefined,
    numValue: undefined,
    id: '',
  };
}

</script>
