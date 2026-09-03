<template>
  <div class="p-1">
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="add"> 新增</a-button>
      </template>
      <template #annex="{ record }"><span style="color: #1890ff;" @click="handlePreview(record.annex)">{{
        record.annex }}</span></template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <AddForm @register="registerModal" @submitSuccess="reload" />
  </div>
</template>

<script lang="ts" name="emergency-ledger" setup>
import { picPreviewUrl, previewFile } from "/@/api/common/api";
import { BasicTable, TableAction } from '/@/components/Table';
import { useContent } from './hooks/useContent';
import AddForm from './components/addModal.vue'

const { registerTable, getTableAction, add, registerModal, reload } = useContent();


const handlePreview = async (file) => {
  previewFile(file).then((res) => {
    window.open(res, '_blank');
  });
};

</script>