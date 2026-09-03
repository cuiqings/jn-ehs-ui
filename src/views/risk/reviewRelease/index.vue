<template>
  <div>
    <basic-table @register="registerTable">
      <template #status="{ record }">
        <span style="color: red" v-if="record.status === '1'">待评审</span>
        <span v-else-if="record.status === '2'">已评审</span>
        <span style="color: red" v-else-if="record.status === '3'">待审核</span>
        <span v-else-if="record.status === '4'">已审核</span>
        <span v-else></span>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <review-release-modal @register="registerModal" @success="handleSuccess" />
</template>
<script setup name="risk-reviewRelease" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import reviewReleaseModal from './reviewReleaseModal.vue';
  const { registerTable, getActions, registerModal, handleSuccess } = useMainContent();
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-placeholder) {
    color: #bfbfbf !important;
  }
</style>
