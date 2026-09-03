<template>
  <div class="risk-identify">
    <div class="query-form_code">
      <a-form ref="formRef" :model="queryParams">
        <a-row>
          <a-col :md="6">
            <a-form-item label="所属单位：" style="margin-bottom: 0">
              <a-select
                v-model:value="queryParams.orgCode"
                :disabled="orgOptions.length === 1"
                :filterOption="(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                :options="orgOptions"
                allow-clear
                label-field="departName"
                placeholder="请选择"
                showSearch
                value-field="orgCode"
                @change="changeOrg"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="risk-tabs">
      <div>
        <div :class="activeKey === '1' ? 'active' : ''" @click="handleTabChange('1')">设备设施（ {{ facilityCount }} ） </div>
        <div :class="activeKey === '2' ? 'active' : ''" @click="handleTabChange('2')">作业活动（ {{ activityCount }} ） </div>
      </div>
    </div>
    <basic-table ref="tableRef" :rowSelection="rowSelection" @register="registerTable">
      <template #tableTitle>
        <a-button v-auth="'riskPointManagement:add'" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">新增 </a-button>
        <j-upload-button v-auth="'riskPointManagement:import'" preIcon="ant-design:import-outlined" type="primary" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button v-auth="'riskPointManagement:export'" preIcon="ant-design:export-outlined" type="primary" @click="onExportXls"> 导出 </a-button>
        <a-button v-auth="'riskPointManagement:template'" preIcon="ant-design:export-outlined" type="primary" @click="onExportTemplateXls">
          导入模版
        </a-button>
        <a-button
          v-if="selectedRowKeys.length > 0"
          v-auth="'riskPointManagement:batchDel'"
          preIcon="ant-design:delete-outlined"
          @click="batchHandleDelete"
        >
          批量删除
        </a-button>
        <a-button
          v-if="selectedRowKeys.length > 0 && activeKey === '2'"
          v-auth="'riskPointManagement:executeFlag'"
          type="primary"
          @click="handleExecuteFlag"
        >
          批量更改是否巡检项
        </a-button>
      </template>
      <template #riskLevel="{ record }">
        <div
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
          style="color: #fff"
        >
          {{ record.riskLevel === '1' ? '重大风险' : record.riskLevel === '2' ? '较大风险' : record.riskLevel === '3' ? '一般风险' : '低风险' }}
        </div>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <risk-identify-drawer @register="registerDrawer" @success="handleSuccess" />
  <!-- 添加物料弹框 -->
  <a-modal
    :body-style="{ padding: '25px' }"
    :confirmLoading="confirmLoading"
    :visible="visible"
    title="批量更改是否巡检项"
    @cancel="() => (visible = false)"
    @ok="handleOk"
  >
    <a-form ref="fromRef" :model="from" :rules="fromRules">
      <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="是否巡检项" name="executeFlag">
        <a-select
          v-model:value="from.executeFlag"
          :options="[
            { label: '是', value: '1' },
            { label: '否', value: '2' },
          ]"
          allowClear
          placeholder="请选择"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" name="risk-riskPointManagement" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import riskIdentifyDrawer from './drawer.vue';
  import { ref } from 'vue';

  const tableRef = ref();
  const fromRef = ref();
  const {
    registerTable,
    getActions,
    rowSelection,
    onExportXls,
    handleAdd,
    onImportXls,
    selectedRowKeys,
    batchHandleDelete,
    activeKey,
    queryParams,
    orgOptions,
    handleTabChange,
    changeOrg,
    handleSuccess,
    registerDrawer,
    facilityCount,
    activityCount,
    onExportTemplateXls,
    handleExecuteFlag,
    visible,
    from,
    confirmLoading,
    fromRules,
    handleOk,
  } = useMainContent(tableRef, fromRef);
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

  :deep(.ant-tabs-nav) {
    margin: 0 10px;
    background-color: #ffffff;
    padding-right: 20px;
    height: 50px;
  }

  .risk-identify {
    :deep(.ant-tabs-tab) {
      border-radius: 10px 10px 0 0 !important;
      background-color: rgb(239, 239, 239);
      padding: 0 35px;
      font-size: 16px;

      .ant-tabs-tab-btn {
        color: #666;
      }
    }

    :deep(.ant-tabs-tab-active) {
      background-color: #1890ff;

      .ant-tabs-tab-btn {
        color: #fff;
        font-weight: normal !important;
      }
    }

    :deep(.ant-tabs-extra-content) {
      & > div {
        span {
          font-size: 16px;
        }

        b {
          font-size: 20px;
        }
      }
    }

    .jeecg-basic-table-form-container {
      padding-top: 0;
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
