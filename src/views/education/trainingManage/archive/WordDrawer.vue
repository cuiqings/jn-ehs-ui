<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="档案信息" width="1200px" destroyOnClose>
    <template #title>
      <div style="text-align: right; margin-top: 16px; position: absolute; top: -7px; right: 20px; z-index: 100">
        <a-button type="primary" @click="downloadWord">下载原文件</a-button>
      </div>
    </template>
    <a-spin :spinning="spinning" tip="加载中...">
      <div ref="wordPreviewContainer" style="min-height: 400px; max-height: 90vh; overflow: auto"></div>
    </a-spin>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { generateArchivalFile } from './archive.api';
  import { renderAsync } from 'docx-preview';
  const previewVisible = ref(false);
  const wordPreviewContainer = ref<HTMLElement | null>(null);
  let currentBlob = null; // 保存当前blob用于下载
  const spinning = ref(false);
  //表单赋值
  const [registerDrawer] = useDrawerInner(async (data) => {
    spinning.value = true;
    generateArchivalFile(data.record)
      .then((res) => {
        previewWord(res);
      })
      .finally(() => {
        spinning.value = false;
      });
  });
  async function previewWord(res) {
    try {
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
    }
  }

  function downloadWord() {
    if (!currentBlob) return;
    const url = window.URL.createObjectURL(currentBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '档案文档.docx';
    a.click();
    window.URL.revokeObjectURL(url);
  }
</script>
