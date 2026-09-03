<template>
  <div style="display: flex; margin: 10px">
    <a-card style="width: 280px; padding: 0; border-radius: 8px">
      <a-menu v-model:selectedKeys="selectedKeys" mode="inline" style="border: none" @select="handleMenuSelect">
        <a-menu-item v-for="item in fileCategoryData" :key="item.value">
          <div style="display: flex; justify-content: space-between">
            <a-tooltip>
              <template #title>{{ item.label }}</template>
              <span style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ item.label }}</span>
            </a-tooltip>
            <span>（{{ item.count }}）</span>
          </div>
        </a-menu-item>
      </a-menu>
    </a-card>
    <div class="ledger-content" style="background-color: #fff; border-radius: 8px; border: 1px solid #e5e7eb">
      <basic-table :rowSelection="rowSelection" @register="registerTable" :scroll="{ x: 1200 }">
        <template #tableTitle>
          <a-button v-auth="'knowledgeBase:add'" preIcon="ant-design:plus-outlined" type="primary" @click="add">新增 </a-button>
          <a-button v-if="selectedRowKeys.length > 0" v-auth="'knowledgeBase:del'" preIcon="ant-design:delete-outlined" @click="batchHandleDelete">
            批量删除
          </a-button>
        </template>
        <template #action="{ record }">
          <table-action :actions="getActions(record)" />
        </template>
        <template #fileUrl="{ record }">
          <div style="text-align: justify; word-break: break-all">
            <a class="a-hover-underline" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.fileUrl)">
              {{ record.fileUrl?.split('/')[1] }}
            </a>
          </div>
        </template>
      </basic-table>
    </div>
  </div>
  <add-or-edit-drawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script lang="ts" name="law-knowledgeBase" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import addOrEditDrawer from './addOrEditDrawer.vue';

  const {
    registerTable,
    getActions,
    add,
    registerDrawer,
    handleSuccess,
    handlePreview,
    rowSelection,
    selectedRowKeys,
    batchHandleDelete,
    fileCategoryData,
    selectedKeys,
    handleMenuSelect,
  } = useContent();
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-placeholder) {
    color: #bfbfbf !important;
  }

  .ledger-content {
    margin-left: 10px;
    width: calc(100% - 290px);

    :deep(.ant-card-body) {
      padding-bottom: 0 !important;
    }

    :deep(.ant-card-bordered) {
      border: none !important;
    }

    // 修复表格滚动条问题
    :deep(.ant-table-wrapper) {
      overflow: hidden;
      border-radius: 0 0 8px 8px;
      //max-height: calc(100vh - 400px);
    }

    //:deep(.ant-table) {
    //  overflow: auto;
    //}

    //:deep(.ant-table-body) {
    //  overflow-x: auto;
    //  overflow-y: auto;
    //  max-height: calc(100vh - 450px);
    //}
    // 空数据时隐藏多余的滚动条
    :deep(.ant-table-empty) {
      .ant-table-body {
        overflow: hidden;
        min-height: 200px;
      }
    }

    // 确保表格容器不会产生多余的滚动条
    :deep(.ant-table-container) {
      overflow: hidden;
    }
  }
</style>
