<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <!-- v-auth="'healthNotification:add'" -->
        <a-button v-auth="'healthNotification:add'" preIcon="ant-design:plus-outlined" type="primary" @click="onAdd">新增</a-button>
        <!-- <j-upload-button v-auth="'healthNotification:import'" type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button v-auth="'healthNotification:export'" preIcon="ant-design:vertical-align-bottom-outlined" type="primary" @click="onExportXls">导出</a-button>
        <a-button v-auth="'healthNotification:tmp'" preIcon="ant-design:vertical-align-bottom-outlined" type="primary"
          @click="onImportTemplate">导入模板下载</a-button> -->

        <a-button v-auth="'healthNotification:batchdel'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
          <Icon icon="ant-design:delete-outlined"></Icon>批量删除
        </a-button>
      </template>
      <template #safetySign="{ record }">
        <img v-if="record.safetySign" :src="fmtImg(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px; object-fit: contain"
          @click="openImg(record)" />
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #markFlag="{ record }">
        <span v-if="!record.markFlag">未标记</span>
        <a-button type="primary" v-else @click="handleMarkModal(record)">已标记</a-button>
      </template>
    </basic-table>
    <personnel-drawer @register="registerDrawer" @success="handleSuccess" />
    <grid-modal @register="registerMarkModal" />
  </div>
</template>
<script setup name="limitSpace" lang="ts">
import { ref } from 'vue';
import personnelDrawer from './drawer.vue';
import { useContent } from './hooks/useContent';
import { BasicTable, TableAction } from '/@/components/Table';
import gridModal from '../components/gridModal.vue';

const infoRef = ref();
const { registerTable, registerMarkModal, handleMarkModal, onExportXls, onImportXls, onImportTemplate, selectedRowKeys, batchDelete, onAdd, rowSelection, getActions, handleSuccess, registerDrawer, fmtImg, openImg, } = useContent(infoRef);

/**
   * 批量删除事件
   */
async function batchHandleDelete() {
  await batchDelete(selectedRowKeys.value); // 将字符串传递给 batchDelete 方法
}

</script>
<style lang="less"></style>
