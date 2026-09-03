<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerModal"
    :width="500"
    title="扫码签到"
    :body-style="{ padding: '0 20px', maxHeight: '640px', overflow: 'auto' }"
    destroyOnClose
  >
    <div style="text-align: center">
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px">
        <img :src="qrcodeInfo.url" style="width: 380px; display: block; margin: 0 auto 8px" />
      </div>
      <div>{{ qrcodeInfo.conferenceTheme }}</div>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="qrcode-modal" setup>
  import QRCode from 'qrcode';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  const qrcodeInfo: any = ref({});
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    Object.assign(qrcodeInfo.value, data);
    // 批量生成二维码
    const url = await QRCode.toDataURL(`qr-Code:${useGlobSetting().appUrl}/app/conferenceManage/appSign?id=${data.id}&name=${data.conferenceTheme}&startDate=${data.startDate}&endDate=${data.endDate}&snum=${data.signStartTime || 0}&enum=${data.signEndTime || 0}&token=`, { width: 880 });
    qrcodeInfo.value.url = url;
  });
  
  const close = () => {
    closeModal();
  };
</script>
