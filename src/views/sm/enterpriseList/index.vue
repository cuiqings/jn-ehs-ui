<template>
  <div>
    <basic-table @register="registerTable">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'enterpriseList:add'" @click="onAdd">新增</a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" :drop-down-actions="getDropDownAction(record)" />
      </template>
      <template #status="{ record }">
        <span v-if="record.status === '1'" class="text-green-500">合同内</span>
        <span v-else>合同外</span>
      </template>
      <template #companyName="{ record }">
        <div style="display: flex; align-items: center">
          <a-tag v-if="record.newFlag === '1'" color="#f40" style="margin-right: 5px">新</a-tag>
          <span :title="record.companyName" style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{
            record.companyName
          }}</span>
        </div>
      </template>
    </basic-table>
    <add-or-edit @register="registerAdd" @success="handleSuccess" />
    <blacklistModal @register="registerModal" @success="handleSuccess" />
    <assessmentModal @register="registerAssessment" @success="handleSuccess" />
    <changeOwner @register="registerChangeOwner" @success="handleSuccess" />
  </div>
</template>
<script setup name="sm-enterpriseList" lang="ts">
  import { useContent } from './hooks/useContent';
  import addOrEdit from './addOrEdit.vue';
  import blacklistModal from './blacklistModal.vue';
  import assessmentModal from './assessmentModal.vue';
  import changeOwner from './changeOwner.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  const { registerTable, onAdd, getActions, handleSuccess, registerAdd, registerModal, registerAssessment, registerChangeOwner, getDropDownAction } =
    useContent();
</script>
<style lang="less"></style>
