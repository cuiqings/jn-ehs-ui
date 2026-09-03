<template>
  <div>
    <!-- 这里渲染是根据registerTable类似注册表格信息 -->
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'exhaustPipe:add'" @click="onAdd">新增</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" v-auth="'exhaustPipe:import'" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button preIcon="ant-design:export-outlined" type="primary" v-auth="'exhaustPipe:export'" @click="onExportXls">导出</a-button>
        <a-button preIcon="ant-design:vertical-align-bottom-outlined" type="primary" v-auth="'exhaustPipe:tmp'" @click="onDownload"
          >导入模板下载</a-button
        >
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete" v-auth="'exhaustPipe:batchdel'">
          批量删除
        </a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #markFlag="{ record }">
        <span v-if="!record.markFlag">未标记</span>
        <a-button type="primary" v-else @click="handleMarkModal(record)">已标记</a-button>
      </template>
    </basic-table>
    <personnel-drawer @register="registerDrawer" @success="handleSuccess" />
    <markModal @register="registerModal" />
  </div>
</template>
<script setup name="exhaustPipe" lang="ts">
  import { useContent } from './hooks/useContent';
  import personnelDrawer from './drawer.vue';
  import markModal from '../components/markModal.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  const {
    registerTable,
    onExportXls,
    onImportXls,
    onAdd,
    batchDelete,
    rowSelection,
    selectedRowKeys,
    getActions,
    handleSuccess,
    registerDrawer,
    onDownload,
    handleMarkModal,
    registerModal,
  } = useContent();

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete(selectedRowKeys.value); // 将字符串传递给 batchDelete 方法
  }
</script>
