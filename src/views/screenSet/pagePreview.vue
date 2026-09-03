<template>
  <div class="pre-wrap">
    <!-- <button @click="exportPng()">sdsdsd</button> -->
    <topo-preview ref="topoPreview" :showApv="false" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import TopoPreview from '../../components/AntdvTopo/preview.vue';

  const topoPreview = ref();
  const apiData = ref([]);

  // 导出png
  // function exportPng() {
  //   topoPreview.value.handleExport()
  // }
  onMounted(() => {
    resetGraphData();
  });
  function resetGraphData() {
    const graphCellNode: any = localStorage.getItem('graphCellNode');
    const { graphOpts, cellsOpts } = JSON.parse(graphCellNode);
    // const {apiUrl = ''} = graphOpts || {}
    // console.log(cellsOpts, '0000000')
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
    topoPreview.value.initGraph({
      graphOpts,
      cellsOpts: jsonTemp,
    });
  }
</script>

<style scoped lang="less">
  .pre-wrap {
    background-color: #fff;
    height: 100vh;
  }
</style>
