<template>
  <div class="device-image">
    <div class="form-wrap">
      <a-button type="primary" @click="goEdit">编辑页面</a-button>
      <a-button type="primary" style="margin-left: 20px" @click="copyRealScene">复制设备实景</a-button>
    </div>
    <div class="topo-wrap">
      <topo-preview v-if="tempObj" ref="topoPagePreview" :showApv="false" />
    </div>
    <div v-if="!tempObj" class="no-data">未配置</div>
  </div>
  <copy-real-scene-modal @register="registerModal" @success="onSuccess" />
</template>
<script lang="ts" name="device-screen" setup>
  import { onUnmounted, ref, onMounted } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import TopoPreview from '/@/components/AntdvTopo/preview.vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useRoute } from 'vue-router';
  import { router } from '/@/router';
  import { getQueryByIdDevice } from '../../pageSet/api';
  import copyRealSceneModal from './copyRealSceneModal.vue';
  import { useModal } from '/@/components/Modal';
  const [registerModal, { openModal }] = useModal();
  const route = useRoute();
  const tempObj = ref(null);
  const pageId = ref('');
  const queryData = ref(route.query);
  const apiData = ref([]);
  const timer = ref();
  const topoPagePreview = ref();
  // 组件接收参数
  const props = defineProps({
    params: propTypes.object.def({}),
  });
  onMounted(() => {
    init();
  });
  function init() {
    tempObj.value = null;
    getQueryByIdDevice({ deviceId: queryData.value.deviceId }).then((res: any) => {
      if (res.result) {
        tempObj.value = res.result.pageContentOne;
        pageId.value = res.result.id;
        if (tempObj.value) {
          getData();
          loop();
        }
      }
    });
  }
  function getData() {
    const params = {
      deviceId: queryData.value.deviceId,
    };
    defHttp.get({ url: '/deviceConfiguration/getAssembly', params }).then((res) => {
      apiData.value = res || [];
      resetGraphData();
    });
  }
  function resetGraphData() {
    let graphCellNode: any = tempObj.value;
    const { graphOpts, cellsOpts } = JSON.parse(graphCellNode);
    const jsonTemp = cellsOpts.map((item) => {
      const { type, limit, maxLimit, minLimit, lessLimit, moreLimit } = item.data || {};
      const curData: any = apiData.value.filter((v: any) => v.compId === item.id)[0] || '';
      const maxVal = limit + maxLimit;
      const minVal = limit - minLimit;
      if (curData) {
        item.data.apiData = curData;
        switch (type) {
          case 'pathImage':
            if (Number(curData.value) >= maxVal || Number(curData.value) <= minVal) {
              item.attrs.body.fill = moreLimit;
            } else {
              item.attrs.body.fill = lessLimit;
            }
            item.attrs.body.style.cursor = 'pointer';
            break;
          case 'textBlock':
            if (Number(curData.value) >= maxVal || Number(curData.value) <= minVal) {
              item.attrs.foreignObject.color = moreLimit;
            } else {
              item.attrs.foreignObject.color = lessLimit;
            }
            item.attrs.label.style.cursor = 'pointer';
            break;
          case 'textField':
            item.attrs.label.text = curData.value + curData.unit;
            if (Number(curData.value) >= maxVal || Number(curData.value) <= minVal) {
              item.attrs.foreignObject.color = moreLimit;
            } else {
              item.attrs.foreignObject.color = lessLimit;
            }
            item.attrs.label.style.cursor = 'pointer';
            break;
        }
      }
      return item;
    });
    topoPagePreview.value.initGraph({
      graphOpts,
      cellsOpts: jsonTemp,
    });
  }
  function loop() {
    clearInterval(timer.value);
    timer.value = setInterval(() => {
      getData();
    }, 30000);
  }
  function goEdit() {
    const { params } = props;
    console.log('goEdit params', params);
    router.push({
      path: '/device/pageSet/pageSet',
      query: {
        id: pageId.value,
        name: params.name,
        deviceId: params.deviceId,
      },
    });
  }
  // 复制设备实景
  const copyRealScene = () => {
    openModal(true, {
      deviceId: queryData.value.deviceId,
    });
  };
  const onSuccess = () => {
    init();
  };
  //在页面销毁之前先销毁定时器
  onUnmounted(() => {
    clearTimeout(timer.value);
  });
</script>
<style scoped lang="less">
  .device-image {
    padding: 16px 24px;
    overflow: auto;
    .form-wrap {
      padding-bottom: 16px;
    }
    .no-data {
      width: 1630px;
      background-color: #f2f2f2;
      text-align: center;
      line-height: 600px;
      height: 600px;
      color: #999;
    }
  }
</style>
