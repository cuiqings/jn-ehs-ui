<template>
  <div class="p-1">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="add"> 登记</a-button>
        <a-button type="default" preIcon="ant-design:export-outlined" @click="onExportXls" style="margin-left: 8px;">导出</a-button>
        <a-button type="default" preIcon="ant-design:delete-outlined" @click="batchDelete" style="margin-left: 8px;"> 批量删除</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <AddDrawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="inSafetyProduction-useRecord" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import AddDrawer from './components/addModal.vue';

  const { registerTable, getTableAction, add, registerDrawer, reload, batchDelete, rowSelection, onExportXls } = useContent();

  const handleSuccess = () => {
    reload();
  };
</script>
