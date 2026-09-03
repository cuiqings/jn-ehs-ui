<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'cameraManage:add'" @click="accidentReport">添加摄像头</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-auth="'cameraManage:batchDel'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
          批量删除</a-button
        >
      </template>
      <template #alarmState="{ record }">
        <a-tag v-if="record.alarmState === '0'" color="#87d068">启用</a-tag>
        <a-tag v-else color="#f50">停用</a-tag>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <camera-manage-drawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script setup name="camera-manage" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import cameraManageDrawer from './drawer.vue';
  const { registerTable, selectedRowKeys, batchHandleDelete, getActions, rowSelection, accidentReport, registerDrawer, handleSuccess, onExportXls } =
    useMainContent();
</script>
<style lang="less" scoped>
  /deep/.ant-select-selection-placeholder {
    color: #bfbfbf !important;
  }
</style>
