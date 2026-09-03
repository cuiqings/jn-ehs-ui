<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <!-- v-auth="'limitSpace:add'" -->
        <a-button v-auth="'limitspace:add'" preIcon="ant-design:plus-outlined" type="primary" @click="onAdd">新增</a-button>
        <j-upload-button  v-auth="'limitspace:import'" type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button v-auth="'limitspace:export'" preIcon="ant-design:vertical-align-bottom-outlined" type="primary" @click="onExportXls">导出</a-button>
        <a-button  v-auth="'limitspace:tmp'"  preIcon="ant-design:vertical-align-bottom-outlined" type="primary" @click="onExportTemplateXls">导入模板下载</a-button>
        <a-button  v-auth="'limitspace:batchdel'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
          <Icon icon="ant-design:delete-outlined"></Icon>批量删除
        </a-button>
      </template>
      <template #liveLocationPicture="{ record }">
        <img v-if="record.liveLocationPicture" :src="fmtImg(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px; object-fit: contain"
          @click="openImg(record)" />
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #markFlag="{ record }">
        <span v-if="!record.markFlag">未标记</span>
        <a-button type="primary" v-else @click="handleMarkModal(record)">已标记</a-button>
      </template>
    </basic-table>
    <personnel-drawer @register="registerDrawer" @success="handleSuccess" />
    <markModal @register="registerModal" />
  </div>
</template>
<script setup name="limitSpace" lang="ts">
import { ref } from 'vue';
import personnelDrawer from './drawer.vue';
import markModal from '../components/markModal.vue';
import { useContent } from './hooks/useContent';
import { useMethods } from '/@/hooks/system/useMethods';
import { BasicTable, TableAction } from '/@/components/Table';
const infoRef = ref();
const { registerTable, registerModal, handleMarkModal, onExportXls, onImportXls, onAdd, batchDelete, fmtImg, openImg, selectedRowKeys, rowSelection, getActions, handleSuccess, registerDrawer } = useContent(infoRef);
/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete(selectedRowKeys.value); // 将字符串传递给 batchDelete 方法
}

//导入模版下载
function onExportTemplateXls() {
  const { handleExportXls } = useMethods();
  let params = {};
  handleExportXls('有限空间台账模版', '/riskControl/jnRiskSpace/template', params);
}
</script>
<style lang="less"></style>
