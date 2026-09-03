<template>
  <div class="screen-set">
    <antdv-topo v-model:value="tempObj" :showAnimation="true" @handle-preview="handlePreview" @handle-save="handleSave" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import AntdvTopo from '/@/components/AntdvTopo/index.vue';
  import { getQueryById, saveOrUpdate, getQueryByIdDevice } from './api';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const { currentRoute } = router;
  const pageIdPrarent = currentRoute.value?.query.id;
  const pageId = ref(unref(pageIdPrarent));
  const deviceId = currentRoute.value?.query.deviceId;
  const name = currentRoute.value?.query.name;
  const tempObj = ref('');
  init();
  function init() {
    if (pageId.value) {
      getQueryById({ id: pageId.value }).then((res: any) => {
        tempObj.value = (res.result && res.result.pageContentOne) || '';
      });
    } else {
      getQueryByIdDevice({ deviceId: deviceId }).then((res: any) => {
        console.log('getQueryByIdDevice', res);
        if (res.result) tempObj.value = res.result.pageContentOne;
        pageId.value = res.result ? res.result.id : '';
        console.log('getQueryByIdDevice', res, res.id, pageId.value);
      });
    }
  }
  function handlePreview(val) {
    localStorage.setItem('graphCellNode', val);
    window.open(location.origin + `/device/pageSet/pagePreview?id=${pageId.value || ''}&deviceId=${deviceId || ''}`, '预览', 'noopener');
  }
  function handleSave(val) {
    const { graphOpts } = JSON.parse(val);
    console.log('handleSave pageId', pageId.value);
    saveOrUpdate({
      id: pageId.value,
      deviceId: deviceId,
      pageName: name,
      pageContentOne: val,
      pageContentTwo: getApiParams(val),
      pictureUrl: graphOpts.background || '',
    }).then((res) => {
      if (res) {
        init();
      }
    });
  }
  // 筛选api需要的动态组件
  function getApiParams(graphCellNode) {
    const { graphOpts, cellsOpts } = JSON.parse(graphCellNode);
    const { apiUrl = '' } = graphOpts || {};
    let pageInfo: any = [];
    cellsOpts.forEach((item) => {
      if (!apiUrl) {
        if (item.data && item.data.device && item.data.field) {
          const { device = '', field } = item.data || {};
          pageInfo.push({
            deviceId: device,
            pointId: field,
            compId: item.id,
          });
        }
      }
    });
    const params = {
      pageId: pageId.value,
      apiUrl,
      pageInfo,
    };
    return JSON.stringify(params);
  }
</script>
<style scoped lang="less"></style>
