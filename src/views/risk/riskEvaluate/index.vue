<template>
  <div class="risk-identify">
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
                allow-clear
                :disabled="orgOptions.length === 1"
                showSearch
                :filterOption="(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                @change="changeOrg"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="risk-identify-total">
      <div>
        <span>风险评价结果</span>
        <div class="flex-align_center">
          <div class="flex-align_center border-right">
            <div>
              <div>{{ evaluationResultsCount.zs }}</div>
              <div>总数</div>
            </div>
          </div>
          <div class="flex-align_center">
            <div>
              <div style="color: rgb(200, 0, 22)">{{ evaluationResultsCount.zdfx }}</div>
              <div>重大风险</div>
            </div>
            <div>
              <div style="color: rgb(236, 115, 14)">{{ evaluationResultsCount.jdfx }}</div>
              <div>较大风险</div>
            </div>
            <div>
              <div style="color: rgb(220, 228, 15)">{{ evaluationResultsCount.ybfx }}</div>
              <div>一般风险</div>
            </div>
            <div>
              <div style="color: rgb(29, 209, 255)">{{ evaluationResultsCount.dfx }}</div>
              <div>低风险</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="risk-tabs">
      <div>
        <div :class="activeKey === '1' ? 'active' : ''" @click="handleTabChange('1')">设备设施（ {{ facilityCount }} ）</div>
        <div :class="activeKey === '2' ? 'active' : ''" @click="handleTabChange('2')">作业活动（ {{ activityCount }} ）</div>
      </div>
    </div>
    <basic-table @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'riskEvaluate:add'" @click="handleAdd">新增</a-button>
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'riskEvaluate:import'" @click="onImportXls">
          导入</j-upload-button
        >
        <a-button preIcon="ant-design:export-outlined" type="primary" v-auth="'riskEvaluate:export'" @click="onExportXls"> 导出</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'riskEvaluate:template'" @click="onExportTemplateXls">
          导入模版
        </a-button>
        <a-button preIcon="ant-design:delete-outlined" v-auth="'riskEvaluate:batchDel'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
          批量删除</a-button
        >
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
    </basic-table>
  </div>
  <risk-evaluate-drawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup name="risk-riskEvaluate" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import { ref } from 'vue';
  import riskEvaluateDrawer from './drawer.vue';
  const tableRef = ref();
  const {
    registerTable,
    getActions,
    rowSelection,
    onExportXls,
    activeKey,
    queryParams,
    orgOptions,
    handleTabChange,
    changeOrg,
    handleSuccess,
    selectedRowKeys,
    onExportTemplateXls,
    facilityCount,
    activityCount,
    evaluationResultsCount,
    batchHandleDelete,
    handleAdd,
    onImportXls,
    registerDrawer,
  } = useMainContent(tableRef);
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
  .risk-tabs {
    display: flex;
    justify-content: space-between;
    margin: 0 10px;
    background-color: #fff;
    & > div:nth-child(1) {
      display: flex;
      div {
        margin-right: 15px;
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
    & > div:nth-child(2) {
      font-size: 16px;
      margin-right: 10px;
      b {
        font-size: 20px;
      }
    }
  }
  .risk-identify {
    .jeecg-basic-table-form-container {
      padding-top: 0;
    }
    .risk-identify-total {
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
