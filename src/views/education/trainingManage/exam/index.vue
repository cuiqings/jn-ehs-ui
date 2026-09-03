<template>
  <div class="newsUserTraining">
    <basic-table @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'examTask:add'" @click="handleAdd">新增</a-button>
        <!-- <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'examTask:import'" @click="onImportXls">
          导入</j-upload-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'examTask:import'" @click="onExportTemplateXls">
          导入模版
        </a-button> -->
      </template>
      <template #examPaperName="{ record }">
        <span>{{ record.examPaperName }}</span>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <addModal @register="registerAddDrawer" @success="handleSuccess" />
  <detailModal @register="registerDetailDrawer" />
  <a-modal v-model:visible="visible" :width="600" title="离厂" @ok="handleSubmit" @cancel="() => (visible = false)">
    <a-form :model="info" ref="infoReturnRef" label-wrap :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" autocomplete="off" style="margin: 20px">
      <a-row>
        <a-col>
          <a-form-item label="离厂原因" name="reviewRecord" :rules="[{ required: true, message: '离厂原因为必填项！' }]">
            <a-textarea v-model:value="info.reason" placeholder="请输入" :rows="3" :maxlength="200" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
  <QrCodeModal @register="registerModal" />
</template>
<script setup name="trainingManage-exam" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import addModal from './addModal.vue';
  import detailModal from './detailModal.vue';
  import { ref, onMounted } from 'vue';
  import QrCodeModal from './qrCodeModal.vue';
  const tableRef = ref();
  const {
    registerTable,
    registerModal,
    getActions,
    rowSelection,
    handleAdd,
    handleSuccess,
    registerAddDrawer,
    registerDetailDrawer,
    visible,
    handleSubmit,
    info,
  } = useMainContent(tableRef);
  
</script>
<style lang="less" scoped>
  .newsUserTraining {
  }
</style>
