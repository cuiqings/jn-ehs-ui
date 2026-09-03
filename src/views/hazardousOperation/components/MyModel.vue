<template>
  <Modal v-model:visible="popup" :mask="false" style="top: 550px; right: -150px" :maskClosable="false" @cancel="cancel" @ok="handleSubmit">
    <template #title>
      <span style="width: 100%; display: inline-block; text-align: center">签字确认</span>
    </template>
    <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" labelWrap>
      <a-form-item label="本人签字" name="sign" required>
        <template #extra><span style="color: red">提示：手机端可更新个人手写签名</span></template>
        <JImageUpload v-model:value="formState.sign" :is-watermark="true" :maxCount="1" bizPath="dangerWork" fileType="image" />
      </a-form-item>
    </a-form>
  </Modal>
</template>

<script setup lang="ts">
  import { Modal } from 'ant-design-vue';
  import { computed, ref } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  const prop = defineProps({
    open: {
      type: Boolean,
      default: false,
    },
    dataSauce: {
      type: Array,
      default: () => ([]),
    }
  });
  
  const userStore = useUserStore();
  const formState = ref({
    sign: userStore.getUserInfo?.signature || '',
  })
  const formRef = ref<any>();
  const emit = defineEmits(['update:open', 'nextStep']);
  const popup = computed({
    get: () => prop.open,
    set: (value) => {
      emit('update:open', value);
    },
  });

  const handleSubmit = () => {
    formRef.value.validateFields().then(() => {
      emit('nextStep', formState.value);
      emit('update:open', false);
      formRef.value.resetFields();
    }).catch(error => {
      console.log('error', error);
    });
  }
    
  const cancel = () => {
    emit('update:open', false);
    formRef.value.resetFields();
  };
</script>

<style scoped></style>
