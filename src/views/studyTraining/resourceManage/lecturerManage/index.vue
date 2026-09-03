<template>
  <div class="newsUserTraining">
    <basic-table @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'lecture:add'" @click="handleAdd">新增</a-button>
        <!-- <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'examTask:import'" @click="onImportXls">
          导入</j-upload-button
        > -->
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'lecture:batchdel'" @click="handleBatchDel"> 批量删除 </a-button>
      </template>
      <template #examPaperName="{ record }">
        <span>{{ record.examPaperName }}</span>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <addModal @register="registerAddModal" @success="handleSuccess" />
  <detailModal @register="registerDetailModal" />
</template>
<script setup name="studyTraining-lecturerManage" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import addModal from './addModal.vue';
  import detailModal from './detailModal.vue';
  import { ref } from 'vue';
  const tableRef = ref();
  const { registerTable, getActions, rowSelection, handleAdd, handleSuccess, registerAddModal, registerDetailModal, handleBatchDel } =
    useMainContent(tableRef);
</script>
<style lang="less" scoped>
  .newsUserTraining {
  }
</style>
