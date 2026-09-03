<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'alarmConfig:add'" @click="accidentReport">新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-auth="'alarmConfig:batchDel'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
          批量删除</a-button
        >
      </template>
      <template #enable="{ record }">
        <a-tag v-if="record.enable === '0'" color="#87d068">启用</a-tag>
        <a-tag v-else color="#f50">停用</a-tag>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <config-modal @register="registerModal" @success="handleSuccess" />
</template>
<script setup name="alarm-config" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import configModal from './configModal.vue';
  import { useMainContent } from './hooks/useMainContent';
  const { registerTable, selectedRowKeys, batchHandleDelete, getActions, rowSelection, accidentReport, registerModal, handleSuccess, onExportXls } =
    useMainContent();
</script>
<style lang="less" scoped>
  /deep/.ant-select-selection-placeholder {
    color: #bfbfbf !important;
  }
</style>
