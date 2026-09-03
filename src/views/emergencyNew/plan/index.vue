<template>
  <div class="p-1">
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="add"> 新增</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @success="handleSuccess" />
    <PlanDrawer @register="registerDrawerDetail" @success="handleSuccess"  />
  </div>
</template>

<script lang="ts" name="emergency-plan-createPlan" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import PlanDrawer from '../approval/drawer.vue';
  import DrawerView from './drawer.vue'

  const { registerTable, getTableAction, add, registerDrawer, registerDrawerDetail, reload } = useContent();
  
  const handleSuccess = () => {
    reload();
  };
</script>