<template>
  <a-card>
    <div>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">发生单位： </a-col>
        <a-col :sm="21"> {{ info.orgCode }} </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">事件结果： </a-col>
        <a-col :sm="21"> {{ renderDict(info.result, 'event_result') }} </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">事件类型： </a-col>
        <a-col :sm="21"> {{ renderDict(info.type, 'event_type') }} </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">事件描述： </a-col>
        <a-col :sm="21"> {{ info.description }} </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">发生时间： </a-col>
        <a-col :sm="21"> {{ info.eventTime }} </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">事件地点： </a-col>
        <a-col :sm="21"> {{ info.address }} </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">临时处置措施： </a-col>
        <a-col :sm="21"> {{ info.interimMeasures }} </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]">
        <a-col :sm="3" align="right">现场照片： </a-col>
        <a-col :sm="21" class="ant-col-sm-21-none"> <JImageUpload disabled text="" :value="info.photo" /> </a-col>
      </a-row>
    </div>
    <div v-if="info.status === 0">
      <div style="display: flex; justify-content: space-evenly; margin-bottom: 15px" v-if="hasPermission('incidentExpress:ctiar')">
        <a-button @click="onRepeat">重复上报</a-button>
        <a-button type="primary" @click="nonAccidentClose">非事故关闭</a-button>
        <a-button
          type="primary"
          :loading="accidentLoading"
          v-auth="'incidentExpress:ctiar'"
          style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1)"
          @click="confirmAccident"
          >确认事故并上报</a-button
        >
      </div>
      <div v-else>
        <div style="display: flex; justify-content: space-evenly; margin-bottom: 15px">
          <a-button @click="onRepeat" style="width: 120px">重复上报</a-button>
          <a-button type="primary" style="width: 120px" @click="nonAccidentClose">非事故关闭</a-button>
        </div>
        <div style="display: flex; justify-content: space-evenly; margin-bottom: 15px">
          <a-button
            style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1); width: 120px"
            type="primary"
            v-auth="'incidentExpress:cactc'"
            @click="confirmAndCtc"
            >确认并结案</a-button
          >
          <a-button
            style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1); width: 120px"
            type="primary"
            :loading="investigationLoading"
            v-auth="'incidentExpress:cai'"
            @click="confirmAndInvestigation"
            >确认并调查</a-button
          >
        </div>
      </div>
    </div>
    <div v-if="info.status === 3 && hasPermission('incidentExpress:cactc')" style="display: flex; justify-content: space-evenly; margin-bottom: 15px">
      <a-button style="width: 150px; height: auto; border-radius: 5px" type="primary" @click="confirmAndCtc"
        >确认并结案<br /><span style="font-size: 11px">不需要调查报告</span></a-button
      >
      <a-button
        type="primary"
        :loading="investigationLoading"
        style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1); width: 150px; height: auto; border-radius: 5px"
        @click="confirmAndInvestigation"
        >确认并调查<br />
        <span style="font-size: 11px">需要调上传查报告</span></a-button
      >
    </div>
  </a-card>
  <van-dialog
    v-model:show="show"
    title="非事故/事件关闭"
    :before-close="beforeClose"
    show-cancel-button
    :lazy-render="false"
    @confirm="remarkConfirm"
  >
    <van-field type="textarea" v-model="closeInfo" rows="3" autosize autofocus maxlength="200" placeholder="请输入" show-word-limit />
  </van-dialog>
</template>
<script setup name="app-incident-task" lang="ts">
  import { JImageUpload } from '/@/components/Form';
  import { useTask } from './hooks/useTask';
  const {
    info,
    renderDict,
    onRepeat,
    nonAccidentClose,
    confirmAccident,
    show,
    remarkConfirm,
    closeInfo,
    beforeClose,
    confirmAndCtc,
    confirmAndInvestigation,
    hasPermission,
    accidentLoading,
    investigationLoading,
  } = useTask();
</script>
<style lang="less" scoped>
  /deep/.ant-card-body {
    padding: 10px 15px 0;
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
    border: 1px solid rgba(215, 215, 215, 1);
    border-radius: 4px;
    padding: 0 5px;
    height: auto;
    line-height: 30px;
  }
  /deep/ .ant-row {
    margin-bottom: 10px;
  }
  .ant-col-sm-21-none {
    border: none;
  }
  /deep/.ant-upload-list-item {
    padding: 0;
    border: none;
  }
  /deep/ .ant-upload-list-picture-card-container {
    margin: 0 8px 0 0;
  }
  /deep/ .ant-upload-list-picture-card-container {
    height: 90px !important;
    width: 90px !important;
  }
</style>
