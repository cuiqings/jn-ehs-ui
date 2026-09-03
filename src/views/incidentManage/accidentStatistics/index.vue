<template>
  <div class="statistics statistics-form">
    <a-form
      ref="formRef"
      :model="queryParams"
      :label-col="{
        xs: { span: 12 },
        sm: { span: 5 },
      }"
      :wrapper-col="{
        xs: { span: 24 },
        sm: { span: 19 },
      }"
    >
      <a-row :gutter="24">
        <a-col :md="6" :sm="12">
          <a-form-item label="发生单位：">
            <a-select
              v-model:value="queryParams.orgCodes"
              mode="multiple"
              :options="orgOptions"
              label-field="departName"
              value-field="orgCode"
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-form-item label="发生时间：">
            <a-range-picker style="width: -webkit-fill-available" valueFormat="YYYY-MM-DD" v-model:value="queryParams.time" />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
          <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="statistics-content">
    <a-row :gutter="16" class="statistics-content_height">
      <a-col class="gutter-row" :span="12">
        <div class="gutter-box" ref="typeStatisticsRef"></div>
      </a-col>
      <a-col class="gutter-row" :span="12">
        <div class="gutter-box" ref="trendOccursRef"></div>
      </a-col>
    </a-row>
    <a-row :gutter="16" class="statistics-content_height">
      <a-col :span="12">
        <a-row :gutter="16" style="height: 100%">
          <a-col class="gutter-row" :span="11">
            <div class="gutter-box node-padding" ref="eventResultRef"></div>
          </a-col>
          <a-col class="gutter-row" :span="13">
            <div class="gutter-box node-padding" ref="occurUnitRef"></div>
          </a-col>
        </a-row>
      </a-col>
      <a-col class="gutter-row" style="padding: 10px 0" :span="12">
        <a-row :gutter="16" class="gutter-box" style="height: 100%; margin: 0 10px">
          <a-col :span="9">
            <div style="height: 100%" ref="lostDaysRef"></div>
          </a-col>
          <a-col :span="15">
            <div style="height: 100%" ref="lostDaysSectorRef"></div>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>
<script setup name="accident-statistics" lang="ts">
  import { useContent } from './hooks/useContent';
  import { ref } from 'vue';
  const typeStatisticsRef = ref(null);
  const trendOccursRef = ref(null);
  const eventResultRef = ref(null);
  const occurUnitRef = ref(null);
  const lostDaysRef = ref(null);
  const lostDaysSectorRef = ref(null);
  const { queryParams, searchQuery, searchReset, orgOptions } = useContent(
    typeStatisticsRef,
    trendOccursRef,
    eventResultRef,
    occurUnitRef,
    lostDaysRef,
    lostDaysSectorRef
  );
</script>
<style lang="less" scoped>
  .statistics {
    margin: 10px 10px 0;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .statistics-form {
    padding: 12px 10px 6px;
  }
  .statistics-content {
    margin: 0 10px;
    background-color: #ffffff;
    .statistics-content_height {
      height: calc((100vh - 176px) / 2);
      padding: 0 10px;
      .gutter-row {
        height: 100%;
        padding: 10px;
        .gutter-box {
          height: 100%;
          padding: 15px;
          border: 1px solid #d9d9d9;
          border-radius: 5px;
        }
        .node-padding {
          padding: 10px 0 0 10px;
        }
      }
    }
  }
  /deep/ .ant-form-item {
    margin-bottom: 8px !important;
  }
  /deep/.highcharts-legend-item rect {
    width: 15px;
    height: 10px;
    border-radius: 1px;
  }
</style>
