<template>
  <div class="poll-show">
    <div class="left">
      <a-tree
        v-if="gData.length > 0"
        class="dep-tree"
        :showIcon="false"
        :multiple="false"
        :defaultExpandedKeys="expandedKeys"
        :tree-data="gData"
        @select="onSelect"
      />
      <a-empty v-if="!gData.length" />
    </div>
    <div class="right">
      <div style="padding-bottom: 10px">
        <a-button preIcon="ant-design:export-outlined" type="primary" @click="exportTopo()" :disabled="!curRecord.pageContentOne">导出</a-button>
      </div>
      <div class="poll-topo">
        <topo-preview v-if="curRecord.pageContentOne" ref="topoRef" :showApv="false" />
        <span v-else class="nodata">未配置</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" name="pollutantNodes-pollShow" setup>
  import { ref, nextTick } from 'vue';
  import TopoPreview from '/@/components/AntdvTopo/preview.vue';
  import { getQueryById } from './api';
  import { defHttp } from '/@/utils/http/axios';
  const gData: any = ref([]);
  const expandedKeys = ref<any>([]);
  const curRecord: any = ref({});
  const topoRef = ref();

  // 获取部门列表
  getDeptList();
  function getDeptList() {
    const params = {
      departName: '',
    };
    defHttp.get({ url: '/pollutionDischarge/jnPollutionPageSetup/getOrganizationWithProcess', params }).then((res) => {
      gData.value = res;
      expandedKeys.value = res.map((v) => v.key);
    });
  }
  // 部门树 选中
  const onSelect = (info: any, event: any) => {
    console.log(info, '===ppp');
    console.log(event, '===ppp333');
    const { selectedNodes } = event;
    if (info.length > 0) {
      // 判断点击的是工序
      if (selectedNodes[0].isProcess) {
        renderTopo(info[0]);
      }
    }
  };
  function renderTopo(id: string) {
    curRecord.value = {};
    getQueryById({ id }).then((res: any) => {
      if (res.status == 3) {
        curRecord.value = res || {};
        nextTick(() => {
          topoRef.value.initGraph(JSON.parse(res.pageContentOne));
        });
      }
    });
  }

  function exportTopo() {
    topoRef.value.handleExport();
  }
</script>
<style lang="less" scoped>
  .poll-show {
    padding: 20px;
    display: flex;
    height: 100%;
    .left {
      width: 300px;
      background-color: #fff;
      height: 100%;
      margin-right: 16px;
      padding: 16px;
    }
    .right {
      height: 100%;
      flex: 1;
      background-color: #fff;
      min-height: 200px;
      padding: 16px;
      overflow: auto;
      .poll-topo {
        text-align: center;
        background-color: #eee;
        min-height: 400px;
        line-height: 400px;
        .nodata {
          color: #999;
        }
      }
    }
  }
</style>
