<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'checkPlan:add'" @click="onAdd">新增</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" v-auth="'checkPlan:batchDel'" @click="batchHandleDelete">
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <check-plan-drawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script setup name="check-plan" lang="ts">
  import { useContent } from './hooks/useContent';
  import checkPlanDrawer from './drawer.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  const { registerTable, selectedRowKeys, batchHandleDelete, onAdd, getActions, rowSelection, handleSuccess, registerDrawer } = useContent();
</script>
<style lang="less"></style>
