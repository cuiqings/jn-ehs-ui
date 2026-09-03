<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'rsCertificate:add'" @click="handleAdd">新建证书</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-auth="'rsCertificate:batchDel'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
          批量删除</a-button
        >
      </template>
      <template #userNum="{ record }">
        <div v-if="!record.userNum || record.userNum === 0" style="color: #1890ff"> 0 </div>
        <div v-else style="color: #1890ff; cursor: pointer" @click="handleUserNum(record)"> {{ record.userNum }}</div>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <addOrEdit @register="registerEditModal" @success="handleSuccess" />
  <userModal @register="registerUserModal" @success="handleSuccess" />
</template>
<script setup name="resourceManage-certificate" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import addOrEdit from './addOrEdit.vue';
  import userModal from './userModal.vue';
  const {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    selectedRowKeys,
    batchHandleDelete,
    handleSuccess,
    registerEditModal,
    handleUserNum,
    registerUserModal,
  } = useMainContent();
</script>
