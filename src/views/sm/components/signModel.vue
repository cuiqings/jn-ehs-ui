<template>
  <BasicModal
    v-bind="$attrs"
    title="本人签字"
    @register="register"
    :mask="true"
    :maskClosable="false"
    @cancel="cancel"
    @ok="handleSubmit"
    :keyboard="false"
  >
    <a-form ref="formRef" :model="formState" :rules="formRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off" labelWrap>
      <a-form-item label="本人签字" name="sign" style="margin-top: 15px">
        <template #extra><span style="color: red">提示：手机端可更新个人手写签名</span></template>
        <JImageUpload v-model:value="formState.sign" :is-watermark="true" :maxCount="1" bizPath="edu" fileType="image" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import { ref } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  const emit = defineEmits(['signOk']);
  const formRef = ref<any>();
  let formRules = {
    sign: [{ required: true, message: '请上传本人签字', trigger: 'change' }],
  };
  let formState = ref({ sign: '' });
  // 用户信息
  const userStore: any = useUserStore();
  const userInfo = userStore.userInfo;
  console.log('userInfo', userInfo);
  if (userInfo.signature) {
    console.log('userInfo.signature', userInfo.signature);
    if (/^http/i.test(userInfo.signature)) formState.value.sign = userInfo.signature;
  } else {
    formState.value.sign = '';
  }

  const [register, { closeModal, setModalProps }] = useModalInner(() => {});
  const handleSubmit = async () => {
    setModalProps({ confirmLoading: true });
    formRef.value
      .validate()
      .then(async () => {
        emit('signOk', formState.value.sign);
        closeModal(); // 签名成功后关闭弹框
        setModalProps({ confirmLoading: false });
      })
      .catch((err) => {
        console.log(err);
        setModalProps({ confirmLoading: false });
      });
  };
  const cancel = () => {
    formRef.value.resetFields();
    closeModal();
  };
</script>

<style scoped></style>
