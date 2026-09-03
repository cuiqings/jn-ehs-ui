<template>
  <div class="newsUserTraining">
    <div class="newsUserTraining-total">
      <div>
        <span>新员工入职培训教育数据</span>
        <div class="flex-align_center">
          <div class="flex-align_center border-right">
            <div>
              <div style="color: rgb(200, 0, 22)">{{ statisticsInfo.notOrganized }}</div>
              <div>未组织</div>
            </div>
            <div>
              <div>{{ statisticsInfo.training }}</div>
              <div>培训中</div>
            </div>
          </div>
          <div class="flex-align_center">
            <div>
              <div style="color: rgb(200, 0, 22)">{{ statisticsInfo.timeoutNotCompleted }}</div>
              <div>培训任务超时未完成</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="newsUserTraining-tabs">
      <div>
        <div :class="activeKey === '1' ? 'active' : ''" @click="handleTabChange('1')">待组织（ {{ typeStatisticsInfo.notOrganized }} ）</div>
        <div :class="activeKey === '2' ? 'active' : ''" @click="handleTabChange('2')">进行中（ {{ typeStatisticsInfo.training }} ）</div>
        <div :class="activeKey === '3' ? 'active' : ''" @click="handleTabChange('3')">已结束（ {{ typeStatisticsInfo.finish }} ）</div>
      </div>
    </div>
    <basic-table @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
      <template #tableTitle v-if="activeKey === '1'">
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'newsUserTraining:add'" @click="handleAdd">新增</a-button>
        <a-button v-if="selectedRowKeys.length > 0" type="primary" v-auth="'newsUserTraining:batchTraining'" @click="handleTraining(selectedRows)"
          >组织培训</a-button
        >
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'newsUserTraining:import'" @click="onImportXls">
          导入</j-upload-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'newsUserTraining:template'" @click="onExportTemplateXls">
          导入模版
        </a-button>
      </template>
      <template #tableTitle v-if="activeKey === '3'">
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'newsUserTraining:template'" @click="onExportPerson">
          导出
        </a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <addModal @register="registerModal" @success="handleSuccess" />
  <a-modal v-model:visible="visible" :width="600" title="离厂" @ok="handleSubmit" @cancel="() => (visible = false)">
    <a-form :model="info" ref="infoReturnRef" label-wrap :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" autocomplete="off" style="margin: 20px">
      <a-row>
        <a-col>
          <a-form-item label="离厂原因" name="remark" :rules="[{ required: true, message: '离厂原因为必填项！' }]">
            <a-textarea v-model:value="info.remark" placeholder="请输入" :rows="5" :maxlength="300" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
  <training-drawer @register="registerDrawer" @success="handleSuccess" />
  <study-view-modal @register="registerViewModal" />
</template>
<script setup name="risk-identify" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import addModal from './addModal.vue';
  import trainingDrawer from '../trainingTasks/drawer.vue';
  import studyViewModal from '../trainingTasks/viewModal.vue';
  import { ref } from 'vue';
  const tableRef = ref();
  const infoReturnRef = ref();
  const {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onImportXls,
    activeKey,
    handleTabChange,
    handleSuccess,
    registerDrawer,
    onExportTemplateXls,
    handleTraining,
    selectedRowKeys,
    selectedRows,
    registerModal,
    statisticsInfo,
    typeStatisticsInfo,
    visible,
    handleSubmit,
    info,
    registerViewModal,
    onExportPerson
  } = useMainContent(tableRef, infoReturnRef);
</script>
<style lang="less" scoped>
  .newsUserTraining {
    .jeecg-basic-table-form-container {
      padding-top: 0;
    }
    .newsUserTraining-tabs {
      display: flex;
      justify-content: space-between;
      margin: 0 10px;
      background-color: #fff;
      & > div:nth-child(1) {
        display: flex;
        div {
          margin-right: 10px;
          background-color: rgb(239, 239, 239);
          font-size: 16px;
          color: #666;
          padding: 10px 20px;
          border-radius: 10px 10px 0 0;
          cursor: pointer;
        }
        .active {
          background-color: #1890ff;
          color: #fff;
          font-weight: normal;
        }
        & > div:nth-child(1) {
          margin-right: 10px;
        }
      }
    }
    .newsUserTraining-total {
      margin: 0 10px;
      margin-top: 10px;
      padding: 10px 0;
      background: #fff;
      & > div {
        margin: 0 10px;
        padding: 15px;
        border-radius: 8px;
        background-color: rgb(238, 248, 254);
        .flex-align_center {
          display: flex;
          align-items: center;
          & > div {
            padding: 0 20px;
            div {
              text-align: center;
            }
            & > div {
              & > div:nth-child(1) {
                font-size: 24px;
                font-weight: bold;
              }
            }
          }
          .border-right {
            border-right: 1px solid #eee;
          }
        }
      }
    }
  }
</style>
