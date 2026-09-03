<template>
 <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" width="900px" destroyOnClose>
  <template #title>
     <div style="text-align: right; margin-top: 16px;position: absolute;top: -7px;right: 20px;z-index: 100;">
      <a-button v-if="type == 'notice'" type="primary" @click="downloadWord">导出</a-button>
      <a-button v-if="type == 'repair'" type="primary" @click="downloadWordRepair">导出</a-button>
    </div>
    </template>
    <div ref="wordPreviewContainer" style="min-height: 400px; max-height: 90vh; overflow: auto"></div>
 </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, nextTick, reactive } from 'vue';
 import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getCheckReport, getRepairReport } from './history.api';
  import { renderAsync } from 'docx-preview';
  import { useMessage } from '/@/hooks/web/useMessage';
  const title = ref('检查通报');
  const { createMessage } = useMessage();
  const previewVisible = ref(false);
  const wordPreviewContainer = ref<HTMLElement | null>(null);
  let currentBlob = null; // 保存当前blob用于下载
  const type = ref('notice');
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  //表单赋值
 const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    console.log('data', data);
    type.value = data.type;
    if(data.type == 'notice'){
      getCheckReport({id: data.record.id}).then((res) => {
      console.log('getCheckReport res', res);
      // 从响应中提取blob数据
      const blob = res.data || res;
      previewWord(blob);
     }).catch((error) => {
      console.error('获取检查报告失败:', error);
      createMessage.error('获取检查报告失败，请稍后重试');
     });
    }else if(data.type == 'repair'){
      getRepairReport({id: data.record.id}).then((res) => {
      console.log('getRepairReport res', res);
      // 从响应中提取blob数据
      const blob = res.data || res;
      previewWord(blob);
     });
    }
  });
  function handleOk() {
    currentBlob = null;
    closeDrawer();
  }
  async function previewWord(res) {
    try {
      // 验证数据是否有效
      if (!res || !(res instanceof Blob)) {
        throw new Error('无效的文档数据');
      }
      
      currentBlob = res;
      previewVisible.value = true;
      await nextTick();
      // 渲染到容器
      if (wordPreviewContainer.value) {
        wordPreviewContainer.value.innerHTML = ''; // 清空
        await renderAsync(res, wordPreviewContainer.value);
      }
    } catch (e) {
      // 错误处理
      console.error('预览失败', e);
      createMessage.error('文档预览失败，请检查文件格式是否正确');
    }
  }

  function downloadWord() {
    if (!currentBlob) {
      createMessage.warning('没有可下载的文档');
      return;
    }
    try {
      const url = window.URL.createObjectURL(currentBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '检查报告.docx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      createMessage.error('文档下载失败');
    }
  }
  function downloadWordRepair() {
    if (!currentBlob) {
      createMessage.warning('没有可下载的文档');
      return;
    }
    try {
      const url = window.URL.createObjectURL(currentBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '整改报告.docx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      createMessage.error('文档下载失败');
    }
  }
</script>
