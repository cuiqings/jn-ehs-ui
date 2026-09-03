<template>
  <BasicModal @register="register" v-bind="$attrs" :title="title" width="650" @cancel="cancel" ok-text="审核签字"
    @ok="handleSubmit" destroyOnClose>
    <a-form ref="formRef" :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">

      <a-form-item label="上报月度" name="month" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model:value="formState.month" disabled placeholder="请输入" />
      </a-form-item>

      <a-form-item label="上报单位" name="orgCodeName" :rules="[{ required: true, message: '请选择' }]">
        <a-input v-model:value="formState.orgCodeName" disabled placeholder="请输入" />
      </a-form-item>

      <a-form-item label="人员明细" name="fileUrl"
        :rules="[{ required: formState.addNum > 0 || formState.decreaseNum > 0, message: '请上传' }]">
        <div class="download">
          <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" disabled :maxCount="1" v-model:value="formState.fileUrl"
            text="上传人员明细文件" />
        </div>
      </a-form-item>

    </a-form>
    <signModal @register="registerSignModal" @close="signSuccess" />
  </BasicModal>
</template>
<script lang="ts" setup>
import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import type { FormInstance } from 'ant-design-vue'
import signModal from './signModal.vue';
import { ref } from 'vue';

const title = ref('检验')
const emits = defineEmits(['submitSuccess']);
const formRef = ref<FormInstance | null>(null);
const formState = ref({
  id: '',
});
const [registerSignModal, { openModal: openSignModal }] = useModal();
const [register, { closeModal, changeOkLoading }] = useModalInner(async (data) => {
  formRef.value?.resetFields();
  title.value = data.title;
  Object.assign(formState.value, data.data);
  
});

const handleSubmit = async () => {
  let data = JSON.parse(JSON.stringify(formState.value));
  changeOkLoading(true)
  openSignModal(true, data)
};
const signSuccess = () => {
  changeOkLoading(false)
  formRef.value?.resetFields();
  emits('submitSuccess');
  closeModal();
}

const cancel = () => {
  formRef.value?.resetFields();
}

</script>
<style>
.download{
  display: flex;
}
</style>
