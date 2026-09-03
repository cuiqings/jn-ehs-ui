<template>
  <div class="topo-wrap">
    <!-- <button @click="exportPng()">sdsdsd</button> -->
    <topo-preview v-if="tempObj" ref="topoPagePreview" :showApv="false" />
    <img v-if="!tempObj" class="nodata" src="../../../../assets/technical/nodata.png" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted, onUnmounted } from 'vue';
  import TopoPreview from '/@/components/AntdvTopo/preview.vue';
  import { getPageList, getDeviceConfiguration } from '../page.api';
  const graphData = ref({});
  const apiData = ref([]);
  const tempObj = ref(null);
  const pageId = ref('');
  const timer = ref();
  const topoPagePreview = ref();

  const props = defineProps({
    orgCode: {
      type: String,
      default: '',
    },
  });
  init();
  function init() {
    tempObj.value = null;
    let params = {
      orgCode: props.orgCode,
      status: '1',
    };
    getPageList(params).then((res: any) => {
      const resData = (res && res.records.length > 0 && res.records[0]) || {};
      tempObj.value = resData.pageContentOne;
      pageId.value = resData.id;
      initGetData();
    });
  }
  // 配置的字
  const initGetData = () => {
    if (tempObj.value) {
      getData();
    }
  };
  onMounted(() => {
    timer.value = setInterval(() => {
      initGetData();
    }, 5000);
  });
  //在页面销毁之前先销毁定时器
  onUnmounted(() => {
    clearInterval(timer.value);
  });
  function loop() {
    const graphCellNode: any = localStorage.getItem('graphCellNode');
    const { graphOpts } = JSON.parse(graphCellNode);
    const { loopStep = 3 } = graphOpts || {};
    clearInterval(timer.value);
    timer.value = setInterval(() => {
      init();
    }, loopStep * 1000);
  }
  async function getData() {
    let params = {
      pageId: pageId.value,
    };
    await getDeviceConfiguration(params).then((res: any) => {
      console.log('getDeviceConfiguration', res);
      apiData.value = res;
      if (apiData.value) {
        resetGraphData();
      }
    });
  }
  function resetGraphData() {
    const graphCellNode: any = tempObj.value;
    const { graphOpts, cellsOpts } = JSON.parse(graphCellNode);
    // const {apiUrl = ''} = graphOpts || {}
    console.log(graphOpts, cellsOpts, 'resetGraphData');
    const jsonTemp = cellsOpts.map((item) => {
      const { type, limit, maxLimit, minLimit, lessLimit, moreLimit } = item.data || {};
      // const field = 'attr'
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
    graphData.value = {
      graphOpts,
      cellsOpts: jsonTemp,
    };
    console.log(graphData.value, 'graphData');
    topoPagePreview.value.initGraph({
      graphOpts,
      cellsOpts: jsonTemp,
    });
  }
  watch(
    () => props.orgCode,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        init();
      }
    },
    { deep: true }
  );
</script>

<style scoped lang="less">
  .topo-wrap {
    height: 674px;
    line-height: 674px;
    text-align: center;
    .nodata {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 504px;
      height: 84px;
      margin-top: -42px;
      margin-left: -252px;
      z-index: 999;
    }
  }
</style>
