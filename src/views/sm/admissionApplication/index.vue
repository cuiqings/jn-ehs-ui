<template>
  <div>
    <basic-table @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" v-auth="'adap:filings'" @click="onAdd('入场申请')">首次入场申请</a-button>
        <a-button type="primary" v-auth="'adap:person:exchange'" @click="onAdd('新增人员')">新增人员申请</a-button>
      </template>
      <template #scoreScreenshot="{ record }">
        <img
          v-if="record.scoreScreenshot"
          :src="fmtImg(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record)"
        />
        <span v-if="!record.scoreScreenshot">无</span>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <filingDrawer @register="registerDrawer" @success="handleSuccess" />
    <project-drawer @register="viewDrawer" />
  </div>
</template>
<script setup name="sm-admissionApplication" lang="ts">
  import { useContent } from './hooks/useContent';
  import filingDrawer from './drawer.vue';
  import ProjectDrawer from '../components/ProjectDrawer.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  const { registerTable, onAdd, getActions, handleSuccess, registerDrawer, fmtImg, openImg, viewDrawer } = useContent();
</script>
<style lang="less"></style>
