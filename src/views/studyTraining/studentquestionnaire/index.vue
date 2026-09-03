<template>
  <basic-table @register="registerTable">
    <template #status="{ record }">
      <a-tag v-if="record.status == '0'">未开始</a-tag>
      <a-tag v-else-if="record.status == '1'" color="blue">进行中</a-tag>
      <a-tag v-else-if="record.status == '2'" color="green">已结束</a-tag>
    </template>
     <template #scope="{ record }">
      <a-tag v-if="record.status == '1'">全员</a-tag>
      <a-tag v-else-if="record.status == '2'" color="orange">指定人员</a-tag>
    </template>
    <template #alreadyNum="{ record }">
      <span style="color: #2db7f5; cursor: pointer" @click="handleFilledNum(record)">{{ record.alreadyNum }}</span>
    </template>
    <template #action="{ record }">
      <table-action :actions="getActions(record)" />
    </template>
  </basic-table>
  <FillModal @register="registerFillModal" @success="handleSuccess" />
  <FilledUsersModal @register="registerFilledUsersModal" @view-detail="handleViewFilled" />
</template>
<script setup name="studyTraining-questionnaire" lang="ts">
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import FillModal from './FillModal.vue';
  import FilledUsersModal from './FilledUsersModal.vue';
  const {
    registerTable,
    getActions,
    handleSuccess,
    handleFilledNum,
    registerFillModal,
    registerFilledUsersModal,
    handleViewFilled,
  } = useContent();
</script>
<style lang="less"></style>
