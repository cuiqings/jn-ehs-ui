<template>
  <div>
    <basic-table @register="registerTable">
      <template #tableTitle>
        <div>检查计划：{{ planNum }}个，正常：{{ enableNum }}个，异常{{ abnormalNum }}个，停用{{ deactivateNum }}个</div>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <examine-record-drawer @register="registerDrawer" />
  </div>
</template>
<script setup name="examine-record" lang="ts">
  import { useContent } from './hooks/useContent';
  import examineRecordDrawer from './drawer.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  const { registerTable, getActions, registerDrawer, abnormalNum, deactivateNum, enableNum, planNum } = useContent();
</script>
<style lang="less"></style>
