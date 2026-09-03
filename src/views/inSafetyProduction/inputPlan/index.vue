<template>
  <div class="p-1" v-loading="downloading">
    <!--定义表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-space>
          <a-button type="primary" preIcon="ant-design:plus-outlined" @click="add">创建计划</a-button>
          <a-button @click="handleBatchExport" type="primary" v-show="rowSelection.selectedRowKeys.length > 0">批量导出</a-button>
          <a-button @click="handleBatchDelete" type="primary" v-show="rowSelection.selectedRowKeys.length > 0">批量删除</a-button>
        </a-space>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <InputPlanDrawer @register="registerDrawer" @success="handleSuccess" />
    <UpdateSignModal @register="registerUpdateSignModal" @success="handleSuccess" />
    <DetailModal @register="registerDetailModal" />
  </div>
</template>

<script lang="ts" name="inSafetyProduction-inputPlan" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import UpdateSignModal from './components/updateSignModal.vue';
  import DetailModal from './components/detailModal.vue';
  import { useContent } from './hooks/useContent';
  import InputPlanDrawer from './drawer.vue';

  const {
    downloading,
    registerTable,
    rowSelection,
    getTableAction,
    add,
    registerDrawer,
    reload,
    handleBatchExport,
    handleBatchDelete,
    registerUpdateSignModal,
    registerDetailModal,
  } = useContent();

  const handleSuccess = () => {
    reload();
  };
</script>
