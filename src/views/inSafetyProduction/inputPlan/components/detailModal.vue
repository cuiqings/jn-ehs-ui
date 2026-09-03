<template>
  <BasicModal v-bind="$attrs" :can-fullscreen="false" defaultFullscreen :showOkBtn="false" :title="record.planName" @register="registerModal" @close="closeFn">
    <div class="main" v-if="detail" @click="handleViewFile"><a href="#">{{ detail.replace('temp/', '') }}</a></div>
    <iframe ref="sameOriginIframe" style="width: 100%; height: 100%" src="about:blank"></iframe>
  </BasicModal>
</template>
<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { inputPlanDetail } from '../api';
    import { previewFile } from '/@/api/common/api';
import { ref } from 'vue';
  const sameOriginIframe = ref<any>(null);
  const record = ref<any>({});
  const detail = ref<string>('');
  const [registerModal] = useModalInner((data) => {
      record.value = data.record;
      inputPlanDetail({ id: record.value.id }).then((res) => {
        detail.value = res.file;
        sameOriginIframe.value.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(res.html);
      });
  });
  const handleViewFile = () => {
    previewFile(detail.value).then((res) => {
      window.open(res, '_blank');
    });
  };
  const closeFn = () => {
    sameOriginIframe.value.src = 'about:blank';
    detail.value = '';
  };
</script>
