<template>
  <div class="screen-set">
    <antdv-topo
      v-model:value="tempObj"
      @handlePreview="handlePreview"
      @handleSave="handleSave"
    />
  </div>
</template>


<script lang="ts" setup>
import { ref } from 'vue';
// import { useMessage } from '/@/hooks/web/useMessage';
// const { createMessage } = useMessage();
import AntdvTopo from '../../components/AntdvTopo/index.vue'
import { getQueryById, saveOrUpdate, getQueryByIdPoll, saveOrUpdatePoll } from './api';
import { useRouter } from 'vue-router';
const router = useRouter();
const { currentRoute } = router;
const pageId = currentRoute.value?.query.id
const pageType = currentRoute.value?.query.type

const tempObj = ref('')
init()
function init(){
  if(pageType === 'poll') {
    getQueryByIdPoll({id: pageId}).then((res:any) => {
      tempObj.value = res.result && res.result.pageContentOne || ''
    })
  } else {
    getQueryById({id: pageId}).then((res:any) => {
      tempObj.value = res.result && res.result.pageContentOne || ''
    })
  }
  // tempObj.value = localStorage.getItem('graphCellNode') || ''
}
function handlePreview(val){
  localStorage.setItem('graphCellNode', val)
  window.open(
    location.origin + `/screenSet/pagePreview?id=${pageId || ''}`,
    '预览',
    'noopener'
  )
  // router.push({ path: '/screenSet/pagePreview', query: {id:pageId} })
}
function handleSave(val){
  const { graphOpts } = JSON.parse(val)
  if(pageType === 'poll') {
    saveOrUpdatePoll({
      id: pageId,
      pageContentOne: val,
      pageContentTwo: getApiParams(val),
      pictureUrl: graphOpts.background || ''
    }).then(() => {
      // if (res.success) {
      //   createMessage.success('保存成功')
      // }
    })
  } else {
    saveOrUpdate({
      id: pageId,
      pageContentOne: val,
      pageContentTwo: getApiParams(val),
      pictureUrl: graphOpts.background || ''
    }).then(() => {
      // if (res.success) {
      //   createMessage.success('保存成功')
      // }
    })
  }
  
}
// 筛选api需要的动态组件
function getApiParams(graphCellNode){
  const { graphOpts, cellsOpts } = JSON.parse(graphCellNode)
  const { apiUrl = '' } = graphOpts || {}
  let pageInfo:any = []
  cellsOpts.forEach(item => {
    if(!apiUrl) {
      if(item.data && item.data.device && item.data.field){
        const { device = '', field } = item.data || {}
        pageInfo.push({
          deviceId: device,
          pointId: field,
          compId: item.id
        })
      }
    }
  });
  const params = {
    pageId,
    apiUrl,
    pageInfo
  }
  // console.log(params,'params-------')
  return JSON.stringify(params)
}

</script>
<style scoped lang="less">

</style>
