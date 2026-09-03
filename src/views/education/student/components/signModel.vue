<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :mask="false"
    style="top: 550px; right: -150px"
    :maskClosable="false"
    @cancel="cancel"
    @ok="handleSubmit"
  >
    <template #title>
      <span style="width: 100%; display: inline-block; text-align: center">签字确认</span>
    </template>
    <a-form ref="formRef" :model="formState" :rules="formRules" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" labelWrap>
      <a-form-item label="本人签字" name="sign">
        <template #extra><span style="color: red">提示：手机端可更新个人手写签名</span></template>
        <JImageUpload v-model:value="formState.sign" :is-watermark="true" :maxCount="1" bizPath="edu" fileType="image" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { useModal, BasicModal } from '/@/components/Modal';
  import { ref, computed } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  // 用户信息
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);

  const emit = defineEmits(['signOk']);
  const formRef = ref<any>();
  let formRules = {
    sign: [{ required: true, message: '请上传本人签字', trigger: 'change' }],
  };
  let formState = ref({ sign: '' });
  if (userInfo.value.signature) {
    if (/^http/i.test(userInfo.value.signature)) formState.value.sign = userInfo.value.signature;
  }
  const [register, { closeModal }] = useModal();
  const handleSubmit = async () => {
    formRef.value
      .validate()
      .then(async () => {
        emit('signOk', formState.value.sign);
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
