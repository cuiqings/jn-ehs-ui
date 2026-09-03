<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :mask="false"
    style="top: 550px; right: -150px"
    :maskClosable="false"
    @cancel="cancel"
    title="核查签字"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="formState" :rules="formRules" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" labelWrap>
      <div style="font-size: 14px; font-weight: 400; margin-bottom: 20px; margin-left: 55px">生产经营单位核查意见：情况属实。</div>
      <a-form-item label="核查人员签字" name="sign">
        <template #extra><span style="color: red; font-size: 12px">提示：手机端可更新个人手写签名</span></template>
        <JImageUpload v-model:value="formState.sign" :is-watermark="true" :maxCount="1" bizPath="edu" fileType="image" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { addCheckSign } from './archive.api';
  const emit = defineEmits(['success']);
  const formRef = ref<any>();
  let formRules = {
    sign: [{ required: true, message: '请上传核查人签字', trigger: 'change' }],
  };
  let formState = ref({ sign: '', id: '' });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (id) => {
    formState.value.id = id;
    formState.value.sign = '';
    setModalProps({ confirmLoading: false });
  });
  const handleSubmit = async () => {
    formRef.value
      .validate()
      .then(async () => {
        setModalProps({ confirmLoading: true });
        // 调用后端接口
        await addCheckSign(formState.value)
          .then(() => {
            emit('success');
            closeModal();
          })
          .finally(() => {
            setModalProps({ confirmLoading: false });
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const cancel = () => {
    formRef.value.resetFields();
    closeModal();
  };
</script>

<style scoped></style>
