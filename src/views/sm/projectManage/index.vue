<template>
  <div>
    <basic-table @register="registerTable">
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <project-drawer @register="registerDrawer" />
  </div>
</template>
<script setup name="sm-projectManage" lang="ts">
  import ProjectDrawer from '../components/ProjectDrawer.vue';
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  const { registerTable, getActions, registerDrawer } = useContent();
</script>
<style lang="less" scoped>
  .blue {
    color: #1890ff;
    text-decoration: underline;
    cursor: pointer;
  }
  :deep(.ant-table-title) {
    display: none;
  }
  :deep(.bg-red) {
    color: red;
  }
</style>
