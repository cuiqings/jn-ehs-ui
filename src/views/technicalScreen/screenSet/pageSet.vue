<template>
  <div class="screen-set">
    <antdv-topo v-model:value="tempObj" @handlePreview="handlePreview" @handleSave="handleSave" :showAnimation="true" />
  </div>
</template>


<script lang="ts" setup>
import { ref, unref } from 'vue';
// import { useMessage } from '/@/hooks/web/useMessage';
// const { createMessage } = useMessage();
import AntdvTopo from '../../../components/AntdvTopo/index.vue';
import { getQueryById, saveOrUpdate, getQueryByIdDevice, saveOrUpdatePoll } from './api';
import { useRouter } from 'vue-router';
const router = useRouter();
const { currentRoute } = router;
const pageIdPrarent = currentRoute.value?.query.id;
const pageId = ref(unref(pageIdPrarent));
const deviceId = currentRoute.value?.query.deviceId;
const pageName = currentRoute.value?.query.name;
console.log('currentRoute query', currentRoute.value, pageId.value, deviceId, name);
const tempObj = ref('');
init();
function init() {
  if (pageId.value) {
    getQueryById({ id: pageId.value }).then((res: any) => {
      console.log('getQueryById', res);
      tempObj.value = (res.result && res.result.pageContentOne) || '';
    });
  } else {
    getQueryByIdDevice({ deviceId: deviceId }).then((res: any) => {
      console.log('getQueryByIdDevice', res);
      if (res.result) tempObj.value = res.result.pageContentOne;
      pageId.value = res.result.id;
      console.log('getQueryByIdDevice', res, res.result.id, pageId.value);
    });
  }
  // tempObj.value = localStorage.getItem('graphCellNode') || ''
}
function handlePreview(val) {
  localStorage.setItem('graphCellNode', val);
  window.open(location.origin + `/technicalScreen/pagePreview?pageId=${pageId.value || ''}&deviceId=${deviceId || ''}`, '预览', 'noopener');
  // router.push({ path: '/screenSet/pagePreview', query: {id:pageId} })
}
function handleSave(val) {
  const { graphOpts } = JSON.parse(val);
  saveOrUpdate({
    id: pageId.value,
    pageName: pageName,
    deviceid: deviceId,
    pageContentOne: val,
    pageContentTwo: getApiParams(val),
    pictureUrl: graphOpts.background || '',
  }).then(() => {
    // if (res.success) {
    //   createMessage.success('保存成功')
    // }
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
    pageId,
    apiUrl,
    pageInfo,
  };
  // console.log(params,'params-------')
  return JSON.stringify(params);
}
</script>
<style scoped lang="less">
</style>
