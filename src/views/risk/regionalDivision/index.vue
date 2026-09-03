<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'regionalDivision:add'" @click="handleAdd">新增</a-button>
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'regionalDivision:import'" @click="onImportXls">
          导入</j-upload-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'regionalDivision:export'" @click="onExportXls"> 导出</a-button>
        <a-button preIcon="ant-design:download-outlined" type="primary" v-auth="'regionalDivision:download'" @click="onDownload">
          导入模版下载</a-button
        >
        <a-button
          preIcon="ant-design:delete-outlined"
          v-auth="'regionalDivision:batchDel'"
          v-if="selectedRowKeys.length > 0"
          @click="batchHandleDelete"
        >
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #riskLevel="{ record }">
        <div
          style="color: #fff"
          :class="
            record.riskLevel === '1'
              ? 'major'
              : record.riskLevel === '2'
              ? 'larger'
              : record.riskLevel === '3'
              ? 'generally'
              : record.riskLevel === '4'
              ? 'low'
              : ''
          "
          >{{
            record.riskLevel === '1'
              ? '重大风险'
              : record.riskLevel === '2'
              ? '较大风险'
              : record.riskLevel === '3'
              ? '一般风险'
              : record.riskLevel === '4'
              ? '低风险'
              : ''
          }}</div
        >
      </template>
      <template #markFlag="{ text }">
        <a-tag v-if="text === '1'" color="#108ee9">已标记</a-tag>
        <a-tag v-else color="default">未标记</a-tag>
      </template>
    </basic-table>
  </div>
  <regional-division-drawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup name="risk-regionalDivision" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import regionalDivisionDrawer from './drawer.vue';
  const {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onImportXls,
    onDownload,
    selectedRowKeys,
    batchHandleDelete,
    registerDrawer,
    handleSuccess,
    onExportXls,
  } = useMainContent();
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-placeholder) {
    color: #bfbfbf !important;
  }
  .major {
    background: rgb(200, 0, 22);
  }
  .larger {
    background: rgb(236, 115, 14);
  }
  .generally {
    background: rgb(220, 228, 15);
  }
  .low {
    background: rgb(29, 209, 255);
  }
</style>
