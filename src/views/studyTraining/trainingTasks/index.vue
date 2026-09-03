<template>
  <div>
    <a-spin tip="Loading..." :spinning="spinning">
      <basic-table @register="registerTable" :rowSelection="rowSelection">
        <template #tableTitle>
          <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'trainingTasks:add'" @click="onAdd">新增</a-button>
          <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'trainingTasks:userEdit'" @click="onUserAdd">任务状态</a-button>
          <a-button preIcon="ant-design:delete-outlined" v-auth="'trainingTasks:del'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
            批量删除</a-button
          >
        </template>
        <template #action="{ record }">
          <table-action :actions="getActions(record)" />
        </template>
      </basic-table>
      <personnel-drawer @register="registerDrawer" @success="handleSuccess" />
      <view-modal @register="registerViewModal" @success="handleSuccess" />
    </a-spin>
  </div>
</template>
<script setup name="studyTraining-trainingTasks" lang="ts">
  import { useContent } from './hooks/useContent';
  import personnelDrawer from './drawer.vue';
  import viewModal from './viewModal.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const {
    registerTable,
    onAdd,
    getActions,
    handleSuccess,
    registerDrawer,
    registerViewModal,
    selectedRowKeys,
    batchHandleDelete,
    rowSelection,
    spinning,
  } = useContent();
</script>
<style lang="less"></style>
