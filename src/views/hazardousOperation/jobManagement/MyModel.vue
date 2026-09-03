<template>
  <BasicModal
    v-bind="$attrs"
    :z-index="9999"
    :mask="false"
    @register="registerModal"
    style="top: 550px; right: -150px"
    @cancel="cancel"
    :maskClosable="false"
    @ok="handleSubmit"
    :confirmLoading="confirmLoading"
  >
    <template #title>
      <span style="width: 100%; display: inline-block; text-align: center">签字确认</span>
    </template>
    <a-form ref="formRef" :model="formState" :rules="formRules" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" labelWrap>
      <a-form-item label="本人签字" name="sign">
        <template #extra><span style="color: red">提示：手机端可更新个人手写签名</span></template>
        <JImageUpload v-model:value="formState.sign" :is-watermark="true" :maxCount="1" bizPath="dangerWork" fileType="image" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { computed, ref } from 'vue';
  import { JobApplyForFrom } from '../type';
  import { JImageUpload } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const confirmLoading = ref<boolean>(false);
  const formState = ref<JobApplyForFrom>({ sign: '' });

  const [registerModal, { closeModal }] = useModalInner((data) => {
    confirmLoading.value = false;
    formState.value = data;
    if (userInfo.value.signature) {
      if (/^http/i.test(userInfo.value.signature)) formState.value.sign = userInfo.value.signature;
    }
  });
  const formRef = ref<any>();

  let formRules = {
    sign: [
      {
        required: true,
        message: '请选择',
        trigger: 'change',
      },
    ],
  };
  const emit = defineEmits(['cancle', 'nextStep']);
  const handleSubmit = async () => {
    confirmLoading.value = true;
    formRef.value
      .validate()
      .then(async () => {
        if (!formState.value.sign) return;
        confirmLoading.value = false;
        closeModal();
        emit('nextStep', formState.value);
        formRef.value.resetFields();
      })
      .catch((err) => {
        confirmLoading.value = false;
        console.log(err);
      });
  };
  const cancel = () => {
    formRef.value.resetFields();
    emit('cancle');
  };
</script>

<style scoped></style>
