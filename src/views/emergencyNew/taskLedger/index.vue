<template>
  <div class="p-1">
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <DetailDrawer @register="registerDetailDrawer" @success="reload" />
  </div>
</template>

<script lang="ts" name="emergency-taskLedger" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import DetailDrawer from './detailDrawer.vue';

  const { registerTable, getTableAction, reload, registerDetailDrawer } = useContent();
</script>
