<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="签署安全承诺书" width="900px" :footer="null">
    <div class="p-4">
      <!-- Steps -->
      <div class="mb-8 px-12">
        <a-steps :current="currentStep" labelPlacement="vertical">
          <a-step title="承诺人签署" />
          <a-step title="监督人签字" />
          <a-step title="签署完成" />
        </a-steps>
      </div>

      <!-- <iframe :srcdoc="htmlContent" frameborder="0" style="width: 100%; height: 600px;"></iframe> -->
      <div style="width: 100%; height: 600px;overflow-y: scroll;margin-bottom: 20px" v-html="htmlContent"></div>

      <!-- Footer Buttons -->
      <div v-if="type != '3'&&signStatus != '3'" class="text-right space-x-4">
        <a-button @click="closeModal" size="large">取消</a-button>
        <a-button type="primary" @click="handleConfirm" size="large">确认签署</a-button>
      </div>
    </div>
    
    <BasicModal @register="registerSignModal" title="签名确认" width="600px" @ok="handleSignSubmit">
      <div class="p-4">
         <a-form-item label="电子签名" :labelCol="{span: 4}" :wrapperCol="{span: 20}">
             <JImageUpload v-model:value="signUrl" :is-watermark="false" :maxCount="1" bizPath="sign" fileType="image" />
        </a-form-item>
      </div>
    </BasicModal>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getCommitmentDetail, signCommitment } from './api';
  import { JImageUpload } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';

  const { createMessage } = useMessage();
  const record = ref<any>({});
  const htmlContent = ref('');
  const signStatus = ref('');
  const emit = defineEmits(['success']);
  const type = ref('1');
  
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const signUrl = ref('');
  const currentStep = ref(0);
  const [registerSignModal, { openModal: openSignModal, closeModal: closeSignModal }] = useModal();

  const [registerModal, { closeModal }] = useModalInner((data) => {
    record.value = data.record || {};
    type.value = data.type || '1';
    currentStep.value = Number(data.record.status) - 1;
    getCommitmentDetail({ id: data.record.id }).then((res) => {
      console.log(res);
      htmlContent.value = res.htmlValue || '';
      signStatus.value = res.status || '1';
      currentStep.value = Number(signStatus.value) - 1;
    });
  });

  const handleConfirm = () => {
    const user = userInfo.value as any;
    if (user && user.signature) {
        signUrl.value = user.signature;
    } else {
        signUrl.value = '';
    }
    openSignModal(true);
  };

  const handleSignSubmit = () => {
    if (!signUrl.value) {
        createMessage.warning('请上传签名');
        return;
    }
    let signVal = signUrl.value;
    if (Array.isArray(signVal)) {
        signVal = signVal.join(',');
    }
    let params = {
      id: record.value.id,
      type: type.value,
      sign: signVal,
    };
    signCommitment(params).then((res) => {
      closeSignModal();
      closeModal();
      signUrl.value = '';
      emit('success');
    });
  };
</script>

<style scoped lang="less">
  .commitment-paper {
    background-color: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

    .paper-content {
      max-width: 800px;
      margin: 0 auto;
      color: #333;
      line-height: 1.8;
      font-family: 'Songti SC', 'SimSun', serif; // Try to mimic a formal document font
    }

    .underline-space {
      border-bottom: 1px solid #333;
      padding: 0 10px;
      min-width: 100px;
      display: inline-block;
      text-align: center;
    }
  }

  .indent-8 {
    text-indent: 2em;
  }
</style>
