<template>
  <BasicModal
    v-bind="$attrs"
    @cancel="handleCancel"
    :mask="false"
    :maskClosable="false"
    @ok="handleSubmit"
    @register="registerModal"
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
  import { ref, computed, reactive } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  import { examine } from '../../api'
  const confirmLoading = ref<boolean>(false);
  // 用户信息
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const formState = reactive({
    sign: '',
  });
  const curId = ref(null);
  const [registerModal, { closeModal }] = useModalInner((data) => {
    curId.value = data.id;
    if (userInfo.value.signature) {
      if (/^http/i.test(userInfo.value.signature)) formState.sign = userInfo.value.signature;
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
        examine({
          id: curId.value,
          sign: formState.sign,
          reviewComments: '同意'
        }).then(() => {
          emit('close');
          closeModal();
          confirmLoading.value = false;
        })
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
