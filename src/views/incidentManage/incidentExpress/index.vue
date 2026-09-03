<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'incidentExpress:add'" @click="accidentReport">事故快报</a-button>
        <a-button preIcon="ant-design:export-outlined" v-auth="'incidentExpress:export'" @click="onExportXls"> 导出</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete"> 批量删除</a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <replenish-material @register="registerModal" />
    <accident-report-drawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script setup name="incident-express" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import ReplenishMaterial from './component/ReplenishMaterial.vue';
  import { useMainContent } from './hooks/useMainContent';
  import AccidentReportDrawer from './component/AccidentReportDrawer.vue';
  const {
    registerTable,
    selectedRowKeys,
    batchHandleDelete,
    onExportXls,
    getActions,
    rowSelection,
    registerModal,
    accidentReport,
    registerDrawer,
    handleSuccess,
  } = useMainContent();
</script>
<style lang="less" scoped>
  /deep/.ant-select-selection-placeholder {
    color: #bfbfbf !important;
  }
</style>
