<template>
  <BasicModal
    v-bind="$attrs"
    @cancel="handleCancel"
    :mask="false"
    @register="registerModal"
    style="top: 550px; right: -150px"
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
  import { ref, computed } from 'vue';
  import { JobApplyForFrom } from '../type';
  import { JImageUpload } from '/@/components/Form';
  import { getWorkExaminePass } from '../api';
  import { useUserStore } from '/@/store/modules/user';
  const confirmLoading = ref<boolean>(false);
  // 用户信息
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);

  const formState = ref<JobApplyForFrom>({ sign: '' });
  const [registerModal, { closeModal }] = useModalInner((data) => {
    formState.value = data;
    if (userInfo.value.signature) {
      if (/^http/i.test(userInfo.value.signature)) formState.value.sign = userInfo.value.signature;
    }
  });
  const formRef = ref<any>();

  let formRules = { sign: [{ required: true, message: '请上传签字', trigger: 'submit' }] };
  const emit = defineEmits(['close']);
  const handleSubmit = async () => {
    formRef.value
      .validate()
      .then(async () => {
        confirmLoading.value = true;
        let data = formState.value; //@ts-ignore
        data.workApplyId = data.id; //@ts-ignore
        data.workExamineId = data.examineInfoList[data.examineInfoList.length - 1].id;
        await getWorkExaminePass(data);
        formRef.value.resetFields();
        emit('close');
        closeModal();
        confirmLoading.value = false;
      })
      .catch((err) => {
        confirmLoading.value = false;
        console.log(err);
      });
  };
  const handleCancel = () => {
    formRef.value.resetFields();
    closeModal();
    emit('close');
  };
</script>

<style scoped></style>
