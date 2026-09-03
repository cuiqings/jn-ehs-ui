<template>
  <div class="risk-controlList">
    <div class="query-form_code">
      <a-form ref="formRef" :model="queryParams">
        <a-row>
          <a-col :md="6">
            <a-form-item label="所属单位：" style="margin-bottom: 0">
              <a-select
                v-model:value="queryParams.orgCode"
                :options="orgOptions"
                label-field="departName"
                value-field="orgCode"
                placeholder="请选择"
                :disabled="orgOptions.length === 1"
                allow-clear
                @change="changeOrg"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="risk-controlList-total">
      <div>
        <span>风险分级管控</span>
        <div class="flex-align_center">
          <div class="flex-align_center border-right">
            <div>
              <div>{{ controlCount.yfb }}</div>
              <div>已发布</div>
            </div>
          </div>
          <div class="flex-align_center">
            <div>
              <div style="color: rgb(200, 0, 22)">{{ controlCount.zdfx }}</div>
              <div>重大风险</div>
            </div>
            <div>
              <div style="color: rgb(236, 115, 14)">{{ controlCount.jdfx }}</div>
              <div>较大风险</div>
            </div>
            <div>
              <div style="color: rgb(220, 228, 15)">{{ controlCount.ybfx }}</div>
              <div>一般风险</div>
            </div>
            <div>
              <div style="color: rgb(52, 138, 252)">{{ controlCount.dfx }}</div>
              <div>低风险</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:export-outlined" type="primary" v-auth="'controlList:export'" @click="onExportXls"> 导出</a-button>
        <a-button type="primary" v-auth="'controlList:unpublish'" v-if="selectedRowKeys.length > 0" @click="batchHandleUnpublish">
          批量撤销发布</a-button
        >
        <a-button type="primary" v-auth="'controlList:becomeHuman'" v-if="selectedRowKeys.length > 0" @click="handleBecomeHuman">
          批量变更管控责任人</a-button
        >
        <a-button type="primary" v-auth="'controlList:sync'" :loading="syncLoading" @click="batchHandleSync">同步本厂数据至隐患排查清单</a-button>
      </template>

      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #riskLevel="{ record }">
        <div
          style="color: #fff"
          :class="
            record.riskLevel === '1'
              ? 'major'
              : record.riskLevel === '2'
              ? 'larger'
              : record.riskLevel === '3'
              ? 'generally'
              : record.riskLevel === '4'
              ? 'low'
              : ''
          "
          >{{ record.riskLevel === '1' ? '重大风险' : record.riskLevel === '2' ? '较大风险' : record.riskLevel === '3' ? '一般风险' : '低风险' }}</div
        >
      </template>
      <template #orgName="{ record, text }">
        <div style="display: flex; align-items: center; justify-content: center"
          ><a-tag style="margin-right: 5px" v-if="record.specialFlag === '2'" color="#f50">专项</a-tag>{{ text }}</div
        >
      </template>
    </basic-table>
  </div>
  <control-modal @register="registerControlModal" @success="handleSuccess" />
  <becomeHumanModal @register="registerBecomeHumanModal" @success="handleSuccess" />
</template>
<script setup name="risk-controlList" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import controlModal from '../processChecklist/controlModal.vue';
  import becomeHumanModal from './becomeHumanModal.vue';
  const {
    registerTable,
    getActions,
    rowSelection,
    onExportXls,
    queryParams,
    orgOptions,
    changeOrg,
    selectedRowKeys,
    handleSuccess,
    registerControlModal,
    controlCount,
    batchHandleUnpublish,
    batchHandleSync,
    syncLoading,
    handleBecomeHuman,
    registerBecomeHumanModal,
  } = useMainContent();
</script>
<style lang="less" scoped>
  .query-form_code {
    margin: 10px 10px 0 10px;
    border-radius: 2px;
    background-color: #ffffff;
    padding: 10px 12px 20px 12px;
    :deep(.ant-col-md-6) {
      padding-right: 6px;
    }
    :deep(.ant-form-item-label > label) {
      font-size: 13px;
    }
    :deep(.ant-form-item .ant-select) {
      font-size: 13px;
    }
    :deep(.ant-select-item-option-selected) {
      font-size: 13px;
    }
    :deep(.ant-select-item-option-content) {
      font-size: 13px;
    }
    :deep(.ant-form-item-label) {
      width: 120px;
    }
  }
  .risk-controlList {
    .jeecg-basic-table-form-container {
      padding-top: 0;
    }
    .risk-controlList-total {
      margin: 0 10px;
      padding-bottom: 15px;
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
            padding: 0 27px;
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
  .major {
    background: rgb(200, 0, 22);
  }
  .larger {
    background: rgb(236, 115, 14);
  }
  .generally {
    background: rgb(220, 228, 15);
  }
  .low {
    background: rgb(29, 209, 255);
  }
</style>
