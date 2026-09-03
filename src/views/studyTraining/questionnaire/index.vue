<template>
  <basic-table @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" v-auth="'questionnaire:add'" @click="handleAdd">创建问卷</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" v-if="selectedRowKeys.length > 0" style="margin-left: 8px" @click="onExportXls">导出统计</a-button>
      <a-button preIcon="ant-design:delete-outlined" v-auth="'questionnaire:del'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
        批量删除
      </a-button>
    </template>
    <template #status="{ record }">
      <a-tag v-if="record.status == '0'">未开始</a-tag>
      <a-tag v-else-if="record.status == '1'" color="blue">进行中</a-tag>
      <a-tag v-else-if="record.status == '2'" color="green">已结束</a-tag>
    </template>
    <template #scope="{ record }">
      <span v-if="record.scope == '1'">全员</span>
      <span v-else="record.scope == '2'" color="orange">指定人员</span>
    </template>
    <template #alreadyNum="{ record }">
      <span style="color: #2db7f5; cursor: pointer" @click="handleFilledNum(record)">{{ record.alreadyNum }}</span>
    </template>
    <template #action="{ record }">
      <table-action :actions="getActions(record)" />
    </template>
  </basic-table>
  <add-modal @register="registerModal" @success="handleSuccess" />
  <StatisticsModal @register="registerStatisticsModal" />
  <RemindModal @register="registerRemindModal" />
  <FillModal @register="registerFillModal" />
  <FilledUsersModal @register="registerFilledUsersModal" @view-detail="handleViewFilled" />
</template>
<script setup name="studyTraining-questionnaire" lang="ts">
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import addModal from './addModal.vue';
  import StatisticsModal from './StatisticsModal.vue';
  import RemindModal from './RemindModal.vue';
  import FillModal from './FillModal.vue';
  import FilledUsersModal from './FilledUsersModal.vue';
  import { downloadFileAll } from '/@/api/common/api';
  const {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    handleSuccess,
    handleFilledNum,
    selectedRowKeys,
    batchHandleDelete,
    registerModal,
    registerStatisticsModal,
    registerRemindModal,
    registerFillModal,
    registerFilledUsersModal,
    handleViewFilled,
  } = useContent();
  const onExportXls = () => { 
    console.log(selectedRowKeys);
    downloadFileAll('/eduSurveyQues/export', '问卷调查统计.zip', { id: selectedRowKeys.value.join(',') });
  };
</script>
<style lang="less"></style>
