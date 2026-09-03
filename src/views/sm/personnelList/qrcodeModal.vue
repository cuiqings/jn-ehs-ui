<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerModal"
    :width="600"
    title="二维码"
    :body-style="{ padding: '0 20px', maxHeight: '640px', overflow: 'auto' }"
    destroyOnClose
  >
    <div style="text-align: center">
      <div v-if="qrcodeList.length === 0">正在生成二维码...</div>
      <div v-else style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px">
        <div v-for="item in qrcodeList" :key="item.id" style="margin-bottom: 16px">
          <img :src="item.url" style="width: 150px; display: block; margin: 0 auto 8px" />
          <div>{{ item.name }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" @click="downloadPdf" :disabled="qrcodeList.length === 0">下载PDF</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="qrcode-modal" setup>
  import QRCode from 'qrcode';
  import jsPDF from 'jspdf';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  const qrcodeList: any = ref([]);
  const arr: any = ref([]);
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    qrcodeList.value = [];
    arr.value = data.arr;
    // 批量生成二维码
    arr.value.forEach(async (item) => {
      const url = await QRCode.toDataURL(`qr-Code:${useGlobSetting().appUrl}/app/sm/personnel/view?id=${item.id}&token=`, { width: 150 });
      qrcodeList.value.push({
        url,
        name: item.name,
      });
    });
  });
  // 下载PDF
  const downloadPdf = () => {
    const doc = new jsPDF();
    qrcodeList.value.forEach((item, idx) => {
      if (idx > 0) doc.addPage();
      doc.addImage(item.url, 'PNG', 30, 30, 150, 150);
      // 生成带中文的图片
      const textImg = textToImage(item.name, 150, 40, 3); // scale=3
      doc.addImage(textImg, 'PNG', 30, 190, 150, 40); // 这里宽高还是150x40
    });
    doc.save('二维码.pdf');
  };
  const textToImage = (text: string, width = 150, height = 40, scale = 3) => {
    // 提高分辨率
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${16 * scale}px sans-serif`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, (width * scale) / 2, (height * scale) / 2);
    // 返回缩放后的图片
    return canvas.toDataURL('image/png');
  };
  const close = () => {
    closeModal();
  };
</script>
