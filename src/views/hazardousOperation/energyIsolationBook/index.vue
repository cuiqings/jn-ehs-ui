<template>
  <div class="autonomous">
    <div class="custom-tabs">
        <basic-table @register="registerTable">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'autonomous:add'" @click="handleAdd">新增</a-button>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" />
          </template>
          <template #file="{ record }">
            <span style="cursor: pointer; color: #1890ff" @click="onPreview(record.file)">{{ trimFileName(record.file) }}</span>
          </template>
        </basic-table>
        <ReviewModal @register="registerModal" @success="handleSuccess" />
        <AddModal @register="registerAddModal" @success="handleSuccess" />
    </div>
  </div>
</template>
<script setup name="sm-autonomous" lang="ts">
  import ReviewModal from './reviewModal.vue';
  import AddModal from './addModal.vue';
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  const {
    registerTable,
    getActions,
    registerModal,
    handleSuccess,
    onPreview,
    trimFileName,
    handleAdd,
    registerAddModal,
  } = useContent();
</script>
<style lang="less" scoped>
  .autonomous {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
    padding: 15px;
    .custom-tabs {
      .custom-tabs-nav {
        display: flex;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 16px;
        align-items: center;
        justify-content: space-between;
        .flex-align_center {
          display: flex;
          align-items: center;
        }
        .custom-tab {
          padding: 12px 24px;
          cursor: pointer;
          font-size: 16px;
          color: #333;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          &.active {
            color: #1890ff;
            border-bottom: 2px solid #1890ff;
            background: #fff;
          }
          &:not(.active):hover {
            color: #40a9ff;
          }
        }
      }
    }
  }
</style>
