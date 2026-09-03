<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :mask="false"
    style="top: 550px; right: -150px"
    :maskClosable="false"
    @cancel="cancel"
    title="本人签字"
    @ok="handleSubmit"
  >
    <a-form ref="formRef" :model="formState" :rules="formRules" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" labelWrap>
      <div style="font-size: 14px; font-weight: 400; margin-bottom: 20px; margin-left: 80px">
        入职人承诺：以上信息已经本人核实，信息真实、有效、完整，如有虚假或欺骗等行为，自愿承担相应的法律责任。</div
      >
      <a-form-item label="本人签字" name="sign">
        <template #extra><span style="color: red; font-size: 12px">提示：手机端可更新个人手写签名</span></template>
        <JImageUpload v-model:value="formState.sign" :is-watermark="true" :maxCount="1" bizPath="edu" fileType="image" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, computed } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { auditRecord, auditBatch } from './dutyReview.api';
  import { useUserStore } from '/@/store/modules/user';
  // 获取当前用户的签名
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const emit = defineEmits(['success']);
  const formRef = ref<any>();
  const isBatch = ref(false);
  let formRules = {
    sign: [{ required: true, message: '请上传本人签字', trigger: 'change' }],
  };
  let formState = ref({ sign: '', id: '', auditData: {}, idList: [] });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    isBatch.value = data.isBatch;
    if (data.isBatch) {
      formState.value.idList = data.idList;
    } else {
      formState.value.id = data.id;
      formState.value.auditData = data.auditData;
    }
    if (userInfo.value.signature) {
      formState.value.sign = userInfo.value.signature;
    } else {
      formState.value.sign = '';
    }
    setModalProps({ confirmLoading: false });
  });
  const handleSubmit = async () => {
    formRef.value
      .validate()
      .then(async () => {
        setModalProps({ confirmLoading: true });
        let params = Object.assign({}, formState.value);
        // 调用后端接口
        if (isBatch.value) {
          if ('id' in params) {
            delete params.id;
          }
          if ('auditData' in params) {
            delete params.auditData;
          }
          await auditBatch(params)
            .then(() => {
              emit('success');
              closeModal();
            })
            .finally(() => {
              setModalProps({ confirmLoading: false });
            });
        } else {
          if ('idList' in params) {
            delete params.idList;
          }
          await auditRecord(params)
            .then(() => {
              emit('success');
              closeModal();
            })
            .finally(() => {
              setModalProps({ confirmLoading: false });
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const cancel = () => {
    formRef.value.resetFields();
    emit('success');
    closeModal();
  };
</script>

<style scoped></style>
