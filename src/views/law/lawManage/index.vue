<template>
  <div>
    <basic-table @register="registerTable">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'lawManage:add'" @click="add">新增</a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <add-or-edit-drawer @register="registerDrawer" @success="handleSuccess" />
    <view-drawer @register="viewRegisterDrawer" @success="handleSuccess" />
  </div>
</template>
<script setup name="law-lawManage" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import addOrEditDrawer from './component/addOrEditDrawer.vue';
  import viewDrawer from './component/viewDrawer.vue';
  const { registerTable, getActions, add, registerDrawer, viewRegisterDrawer, handleSuccess } = useContent();
</script>
<style lang="less">
  .search-modal {
    .ant-modal {
      top: 0;
    }
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh);
      mark {
        background-color: #ebf07e;
        padding: 0;
      }
    }
    .ant-modal-body {
      .chat-bubble {
        width: 40px;
        height: 25px;
        background-color: #1890ff;
        color: #ffffff;
        border-radius: 8px;
        position: absolute;
        text-align: center;
        cursor: pointer;
        display: none;
      }
      .chat-bubble::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 10px;
        /* 实现三角形的关键 */
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-right: 10px solid #1890ff;
        border-left: 10px solid transparent;
        /* 调整角度 */
        transform: rotate(-90deg);
      }
    }
  }
  .full-modal {
    .ant-modal {
      max-width: 100%;
      top: 0;
      padding-bottom: 0;
      margin: 0;
    }
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh);
    }
    .ant-modal-body {
      flex: 1;
      .highlight {
        background-color: #ffffff;
        color: #1890ff;
        text-decoration: underline;
      }
      .chat-bubble,
      .chat-bubble1 {
        width: 40px;
        height: 25px;
        background-color: #1890ff;
        color: #ffffff;
        border-radius: 8px;
        position: absolute;
        text-align: center;
        cursor: pointer;
        display: none;
      }
      .chat-bubble1::before {
        content: '';
        position: absolute;
        top: -16px;
        left: 10px;
        /* 实现三角形的关键 */
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-right: 10px solid #1890ff;
        border-left: 10px solid transparent;
        /* 调整角度 */
        transform: rotate(90deg);
      }
      .chat-bubble::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 10px;
        /* 实现三角形的关键 */
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-right: 10px solid #1890ff;
        border-left: 10px solid transparent;
        /* 调整角度 */
        transform: rotate(-90deg);
      }
      .association,
      .association1 {
        border: 1px solid rgba(121, 121, 121, 1);
        border-radius: 5px;
        margin-bottom: 15px;
        position: relative;
        & > div:nth-child(1) {
          line-height: 60px;
          height: 60px;
          border-bottom: 1px solid rgba(121, 121, 121, 1);
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          padding: 0 15px;
        }
        & > div:nth-child(2) {
          padding: 0 15px;
          & > p {
            margin-top: 15px;
          }
          & > div {
            margin: 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .ant-select-selector {
              border: 1px solid rgba(121, 121, 121, 1) !important;
              border-radius: 5px !important;
            }
          }
          & > div:last-child {
            margin-left: 80px;
            text-decoration: underline;
            color: rgb(24, 144, 255);
            font-size: 12px;
            cursor: pointer;
          }
          & > .ant-input-affix-wrapper {
            border: 1px solid rgba(121, 121, 121, 1) !important;
            border-radius: 5px !important;
            .ant-input {
              border: none !important;
              border-radius: 5px !important;
            }
            .monica-writing-entry-btn {
              border: none !important;
            }
          }
        }
        & > div:last-child {
          margin: 0 15px 15px 0;
          text-align: right;
        }
      }
      .association1 {
        & > div:nth-child(2) {
          margin-top: 15px;
          text-align: left;
        }
      }
    }
  }
</style>
<style lang="less" scoped>
  /deep/.ant-select-selection-placeholder {
    color: #bfbfbf !important;
  }
</style>
