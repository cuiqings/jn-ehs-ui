<template>
  <div class="p-2">
    <BasicTable @register="registerTable" :pagination="false">
      <template #tableTitle>
        <a-button v-auth="'workform:export'" type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.key === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.key === 'orgName'">
          <span v-if="record.orgName == '合计'">{{ record.orgName }}</span>
          <span v-else style="color: #1890ff;cursor: pointer;" @click="toDetail(record.orgCode)">{{ record.orgName }}</span>
        </template>
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable } from '/@/components/Table';
  import { useContent } from './hooks/useContent';

  const { registerTable, onExportXls, toDetail } = useContent();
  
</script>
<style lang="scss" scoped></style>
