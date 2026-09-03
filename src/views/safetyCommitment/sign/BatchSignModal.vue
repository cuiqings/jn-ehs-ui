<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="监督人批量签署" width="600px" @ok="handleOk" :showOkBtn="names.length > 0">
    <div class="p-4">
     <div v-if="names.length > 0">
         <div class="mb-4">
        <div class="mb-2 font-bold">批量签署包含下列承诺人：</div>
        <a-tag v-for="(item, index) in names" :key="index" color="blue">{{ item }}</a-tag>
      </div>
      <div class="mt-4 flex" style="margin-top: 16px;">
        <span class="required mr-2">电子签名：</span>
        <JImageUpload v-model:value="signUrl" :is-watermark="false" :maxCount="1" bizPath="sign" fileType="image" />
      </div>
     </div>
     <div v-else>
        <div class="mb-2 font-bold">暂无批量签署承诺书</div>
     </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { JImageUpload } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { batchSignCommitment, getBatchSignList } from './api';
  import { useUserStore } from '/@/store/modules/user';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);

  const signUrl = ref('');
  const names = ref<string[]>([]);

  const [registerModal, { closeModal, setModalProps }] = useModalInner((data) => {
    setModalProps({ confirmLoading: false });
    signUrl.value = '';
    names.value = [];
    // 从接口获取待签署的承诺书列表
    getBatchSignList({}).then((res) => {
      console.log(res);
      if (res && res.length > 0) {
        names.value = res;
      }
    });

    // 自动填充用户已有签名
    const user = userInfo.value as any;
    if (user && user.signature) {
      signUrl.value = user.signature;
    }
  });

  const handleOk = async () => {
    if (!signUrl.value) {
      createMessage.warning('请上传签名');
      return;
    }

    try {
      setModalProps({ confirmLoading: true });

      let signVal = signUrl.value;
      if (Array.isArray(signVal)) {
        signVal = signVal.join(',');
      }

      await batchSignCommitment({
        sign: signVal,
      });
      emit('success');
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  };
</script>

<style scoped>
  .required::before {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: '*';
  }
</style>
