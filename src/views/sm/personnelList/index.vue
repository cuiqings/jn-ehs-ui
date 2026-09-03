<template>
  <div class="personnelList-total">
    <div>
      <div class="flex-align_center">
        <div class="flex-align_center">
          <div>
            <div>{{ controlCount.wjc }}</div>
            <div>未进场</div>
          </div>
          <div>
            <div style="color: rgb(200, 0, 22)">{{ controlCount.lc }}</div>
            <div style="color: rgb(200, 0, 22)">离场</div>
          </div>
          <div>
            <div style="color: #87d068">{{ controlCount.zc }}</div>
            <div style="color: #87d068">在厂</div>
          </div>
          <div>
            <div style="color: #87d068">{{ controlCount.zcc }}</div>
            <div style="color: #87d068">正常</div>
          </div>
          <div>
            <div style="color: rgb(200, 0, 22)">{{ controlCount.dq }}</div>
            <div style="color: rgb(200, 0, 22)">限制进厂</div>
          </div>
          <div>
            <div style="color: rgb(219, 173, 111)">{{ controlCount.jjdq }}</div>
            <div style="color: rgb(219, 173, 111)">即将到期</div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
        <a-button type="primary" @click="handleRecently">近7日更新</a-button>
      </div>
      <div class="custom-tabs-content">
        <basic-table @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button v-auth="'personnelList:add'" preIcon="ant-design:plus-outlined" type="primary" @click="onAdd">新增 </a-button>
            <j-upload-button v-auth="'personnelList:import'" preIcon="ant-design:import-outlined" type="primary" @click="onImportXls">
              导入
            </j-upload-button>
            <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
            <a-button v-auth="'personnelList:import'" type="primary" @click="download"> 下载导入模版 </a-button>
            <table-action v-if="selectedRowKeys.length > 0" class="batch-action" :drop-down-actions="getBatchHandleDropDownAction()">
              <template #more>
                <a-button type="primary">批量操作</a-button>
              </template>
            </table-action>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" :drop-down-actions="getDropDownAction(record)" />
          </template>
        </basic-table>
      </div>
    </div>
    <personnel-drawer @register="registerDrawer" @success="handleSuccess" />
    <blacklistModal @register="registerModal" @success="handleSuccess" />
  </div>
  <recentlyModal @register="recentlyRegisterModal" />
  <assessmentModal @register="registerAssessment" @success="handleSuccess" />
  <qrcodeModal @register="registerQrcode" />
</template>
<script lang="ts" name="sm-personnelList" setup>
  import { useContent } from './hooks/useContent';
  import personnelDrawer from './drawer.vue';
  import blacklistModal from './blacklistModal.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useRoute } from 'vue-router';
  import { useMethods } from '/@/hooks/system/useMethods';
  import recentlyModal from './recentlyModal.vue';
  import assessmentModal from './assessmentModal.vue';
  import qrcodeModal from './qrcodeModal.vue';
  const download = () => {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('人员导入模版', '/xgf/xgfPerson/downloadImportTemplate', params);
  };
  const route = useRoute();
  const {
    onImportXls,
    registerTable,
    onAdd,
    getActions,
    handleSuccess,
    registerDrawer,
    registerModal,
    getDropDownAction,
    activeKey,
    handleTabChange,
    tabsArr,
    controlCount,
    handleRecently,
    recentlyRegisterModal,
    registerAssessment,
    registerQrcode,
    rowSelection,
    onExportXls,
    selectedRowKeys,
    getBatchHandleDropDownAction,
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
  .batch-action {
    height: auto !important;
  }
</style>
