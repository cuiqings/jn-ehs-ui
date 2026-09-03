<template>
  <div class="personnelList">
    <div class="custom-tabs">
      <div class="custom-tabs-nav">
        <div class="flex-align_center">
          <div
            v-for="item in tabsArr"
            :key="item.keys"
            :class="['custom-tab', { active: activeKey === item.keys }]"
            @click="handleTabChange(item.keys)"
            >{{ item.title }}</div
          >
        </div>
      </div>
      <div class="custom-tabs-content">
        <basic-table @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button v-show="['1', '2'].includes(activeKey)" v-auth="'conference:mine:add'" preIcon="ant-design:plus-outlined" type="primary" @click="onAdd">预定会议 </a-button>
            <a-button preIcon="ant-design:delete-outlined" v-auth="'personnelList:del'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
              批量删除</a-button
            >
          </template>
          <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'signStatus'">
                <a-tag v-if="record.signStatus == true" color="green">已签到</a-tag>
                <a-tag v-else color="orange">未签到</a-tag>
              </template>
              <template v-if="column.dataIndex === 'startDate'">
                {{ record.startDate }}~{{ record.endDate }}
              </template>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" :drop-down-actions="getDropDownAction(record)" />
          </template>
        </basic-table>
      </div>
    </div>
    <personnel-drawer @register="registerDrawer" @success="handleSuccess" />
    <signIn @register="registerModal" @success="handleSuccess" />
    <uploadFile @register="registerUploadModal" @success="handleSuccess" />
  </div>
  <detailModal @register="detailRegisterModal" />
  <assessmentModal @register="registerAssessment" @success="handleSuccess" />
  <qrcodeModal @register="registerQrcode" />
</template>
<script lang="ts" name="conferenceManage-mine" setup>
  import { useContent } from './hooks/useContent';
  import personnelDrawer from './drawer.vue';
  import signIn from './signIn.vue';
  import uploadFile from './uploadFile.vue'
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useRoute } from 'vue-router';
  import detailModal from './detailModal.vue';
  import qrcodeModal from './qrcodeModal.vue';

  const route = useRoute();
  const {
    registerTable,
    onAdd,
    getActions,
    handleSuccess,
    registerDrawer,
    registerModal,
    registerUploadModal,
    activeKey,
    handleTabChange,
    tabsArr,
    registerAssessment,
    registerQrcode,
    rowSelection,
    selectedRowKeys,
    batchHandleDelete,
    getDropDownAction,
    detailRegisterModal
  } = useContent(route);
</script>
<style lang="less" scoped>
  .personnelList {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
    padding: 15px;
  }
  .personnelList-total {
    padding: 15px 0;
    margin: 10px;
    background: #fff;
    & > div {
      margin: 0 10px;
      padding: 15px 0;
      border-radius: 8px;
      background-color: rgb(238, 248, 254);
      .flex-align_center {
        display: flex;
        align-items: center;
        & > div {
          padding: 0 25px;
          div {
            text-align: center;
          }
          & > div {
            & > div:nth-child(1) {
              font-size: 20px;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
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
</style>
