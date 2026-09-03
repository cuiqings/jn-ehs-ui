<template>
  <basic-table @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" v-auth="'teamInfo:synchronous'" :loading="loading" @click="handleSynchronous">手动同步班组</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" style="margin-left: 8px" @click="onExportXls">导出</a-button>
    </template>
    <template #action="{ record }">
      <table-action :actions="getActions(record)" />
    </template>
  </basic-table>
  <teamInfoDrawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup name="teamManagement-teamInfo" lang="ts">
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import teamInfoDrawer from './drawer.vue';
  const { registerTable, getActions, handleSuccess, registerDrawer, handleSynchronous, loading, onExportXls, rowSelection } = useContent();
</script>
<style lang="less"></style>
