<template>
  <div class="statistics statistics-form">
    <a-row type="flex" :gutter="[0, 24]" style="margin-bottom: 20px">
      <a-col :sm="3" align="left">发生单位： </a-col>
      <a-col :sm="21">
        <a-select
          v-model:value="queryParams.orgCodes"
          style="width: 100%"
          mode="multiple"
          :options="orgOptions"
          label-field="departName"
          value-field="orgCode"
          placeholder="请选择"
        />
      </a-col>
    </a-row>
    <a-row type="flex" :gutter="[0, 24]" style="margin-bottom: 20px">
      <a-col :sm="3" align="left">发生时间： </a-col>
      <a-col :sm="21">
        <a-input class="time" v-model:value="queryParams.time" placeholder="请选择" allow-clear @click="show = true" />
      </a-col>
    </a-row>
    <a-row type="flex" :gutter="[0, 24]">
      <a-button type="primary" preIcon="ant-design:search-outlined" :loading="iconLoading" @click="searchQuery">查询</a-button>
      <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
    </a-row>
  </div>
  <a-spin :spinning="iconLoading">
    <div class="app-statistics-content">
      <div class="app-gutter-box" ref="typeStatisticsRef"></div>
      <div class="app-gutter-box" ref="trendOccursRef"></div>
      <div class="app-gutter-box" ref="eventResultRef"></div>
      <div class="app-gutter-box" ref="occurUnitRef"></div>
      <div class="app-gutter-box" ref="lostDaysRef"></div>
      <div class="app-gutter-box" ref="lostDaysSectorRef"></div>
    </div>
  </a-spin>
  <van-calendar v-model:show="show" :min-date="minDate" type="range" allow-same-day @confirm="onConfirm" />
</template>
<script setup name="app-accident-statistics" lang="ts">
  import { useContent } from './hooks/useContent';
  import { ref } from 'vue';
  const typeStatisticsRef = ref(null);
  const trendOccursRef = ref(null);
  const eventResultRef = ref(null);
  const occurUnitRef = ref(null);
  const lostDaysRef = ref(null);
  const lostDaysSectorRef = ref(null);
  const minDate = new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate());
  const { queryParams, searchQuery, searchReset, show, onConfirm, iconLoading, orgOptions } = useContent(
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
    border-radius: 2px;
    background-color: #ffffff;
  }
  .statistics-form {
    padding: 10px;
    .time {
      width: 100%;
      border-radius: 4px;
      border: 1px solid rgba(215, 215, 215, 1);
      border-radius: 2px;
      padding: 0 10px;
      height: 32px;
      line-height: 32px;
    }
  }
  .app-statistics-content {
    margin: 0 10px;
    padding-bottom: 20px;
    .app-gutter-box {
      height: 300px;
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
  /deep/ .ant-col-sm-3 {
    flex: 0 0 98px;
    max-width: 98px;
    height: 30px;
    line-height: 30px;
  }
  /deep/ .ant-col-sm-21 {
    flex: 0 0 calc(100% - 98px);
    max-width: calc(100% - 98px);
  }
</style>
