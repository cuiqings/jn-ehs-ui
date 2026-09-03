<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'limitSpace:add'" @click="handleAdd">新增</a-button>
        <a-button preIcon="ant-design:download-outlined" type="primary" v-auth="'limitSpace:templateDownload'" @click="onExportTemplateXls">
          导入模版下载</a-button
        >
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" v-auth="'limitSpace:import'" @click="onImportXls">导入</j-upload-button>
        <a-button preIcon="ant-design:delete-outlined" v-auth="'limitSpace:batch-del'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <limitSpace-drawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup name="risk-limitSpace" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import limitSpaceDrawer from './drawer.vue';
  import { useMainContent } from './hooks/useMainContent';
  const {
    registerTable,
    getActions,
    handleAdd,
    registerDrawer,
    handleSuccess,
    rowSelection,
    selectedRowKeys,
    batchHandleDelete,
    onImportXls,
    onExportTemplateXls,
  } = useMainContent();
</script>
<style lang="less" scoped>
  /deep/.ant-select-selection-placeholder {
    color: #bfbfbf !important;
  }
</style>
