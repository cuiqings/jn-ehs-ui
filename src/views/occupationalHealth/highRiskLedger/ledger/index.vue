<template>
  <div class="p-1">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" v-auth="'highRiskLedger:ledger:add'" preIcon="ant-design:plus-outlined" @click="add">新增</a-button>
<!--        <a-button-->
<!--          type="primary"-->
<!--          danger-->
<!--          v-show="selectedRowKeys.length > 0"-->
<!--          v-auth="'highRiskLedger:ledger:batchdel'"-->
<!--          preIcon="ant-design:delete-outlined"-->
<!--          @click="batchDel"-->
<!--          :loading="loading"-->
<!--          >批量删除</a-button-->
<!--        >-->
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'highRiskLedger:ledger:import'" @click="onImportXls"
          >导入</j-upload-button
        >
        <a-button type="primary" v-auth="'highRiskLedger:ledger:temp'" preIcon="ant-design:download-outlined" @click="onExportTemplateXls"
          >导入模板下载</a-button
        >
        <!-- <a-button
          type="primary"
          v-auth="'highRiskLedger:ledger:export'"
          preIcon="ant-design:export-outlined"
          @click="downloadZip"
          :loading="loading"
          >导出</a-button
        > -->
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #status="{ record }">{{ record.status == 1 ? '正常' : '未检测' }}</template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submitSuccess="submitSuccess" />
    <CheckModal @register="registerCheckModal" @submitSuccess="submitSuccess" />
  </div>

  <div>
    <a-modal  v-model:visible="detectionEntryVisible" :title="'检测录入'" :footer="null"
              @cancel="detectionEntryVisible = false">
      <a-card>
        <a-upload-dragger :fileList="fileList" name="file" :multiple="false" :before-upload="beforeUpload" @remove="handleRemove">
          <p>
            <Icon style="font-size: 48px; padding-right: 5px" icon="vscode-icons:file-type-excel" />
          </p>
          单击或拖动文件到此区域以上传
        </a-upload-dragger>
        <div style="text-align: right; padding-top: 20px">
          <a-button type="primary" @click="detectionEntryImportFile"> 上传文件 </a-button>
        </div>
      </a-card>
    </a-modal>
  </div>
</template>

<script lang="ts" name="occupationalHealth-files" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { useContent } from './hooks/useContent';
  import CheckModal from './checkModal.vue';
  import DrawerView from './drawer.vue';
  import dayjs from 'dayjs';
  import { downloadFileAll } from '/@/api/common/api';
  import { ref } from 'vue';
  import { UploadProps } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { detectionEntryImport } from '/@/views/occupationalHealth/api';
  const detectionEntryVisible = ref(false);
  const fileList = ref([]);
  const {
    registerTable,
    getTableAction,
    add,
    registerDrawer,
    registerCheckModal,
    reload,
    onExportXls,
    onImportXls,
    registerCheckIn,
    rowSelection,
    selectedRowKeys,
    batchDel,
  } = useContent();

  const submitSuccess = () => {
    reload();
  };

  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('高危人员台账模板', '/riskPersonTent/downloadTemplate', params);
  }
  const loading = ref(false);
  function downloadZip() {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
    }, 2000);
    downloadFileAll(`/archives/export`, dayjs(new Date()).format('YYYYMMDD') + '职业健康监护档案.zip', {
      selections: selectedRowKeys.value.join(','),
    });
  }
  // 检测录入模板下载
  function onDetectionEntryTemplateXls() {
    const { handleExportXlsx } = useMethods();
    let params = {};
    handleExportXlsx('职业健康监护档案检测录入模板', '/archives/detectionEntryTemplate', params);
  }
  //检测录入弹窗
  function detectionEntryOpen() {
    fileList.value = [];
    detectionEntryVisible.value = true;
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    fileList.value = [];
    fileList.value.push(file);
    return false;
  };
  const handleRemove = () => {
    fileList.value = [];
  };
  const detectionEntryImportFile = () => {
    const formData = new FormData();
    formData.append('file', fileList.value[0]);
    detectionEntryImport(formData).then((code) => {
      if (code == '导入成功') {
        fileList.value = [];
        detectionEntryVisible.value = false;
        reload();
      }
    });
  };
</script>
<style lang="less" scoped>
  .hd {
    height: 70px;
    padding: 10px;
    display: flex;
    justify-content: space-around;
    text-align: center;
    background-color: #e6f7ff;
    span {
      font-size: 20px;
      font-weight: 600;
      line-height: 35px;
    }
    .item:nth-child(2),
    .item:nth-child(3) {
      color: #15803d;
    }
  }
</style>
