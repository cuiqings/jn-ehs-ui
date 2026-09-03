<template>
  <div class="p-1">
    <div class="tabs">
      <div class="tab-wrap">
        <div class="inner">
          <div class="tab" @click="tabClick('0')" :class="{active: tabActive == '0'}">正常</div>
          <div class="tab" @click="tabClick('1')" :class="{active: tabActive == '1'}">封存</div>
        </div>
      </div>
    </div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #headerTop>
        <div class="hd">
          <div class="item">
            <span>{{ statisticsData.joinCount }}</span>
            <div>接害人数</div>
          </div>
          <div class="item">
            <span>{{ statisticsData.entryCount }}</span>
            <div>检测结果录入人数</div>
          </div>
          <div class="item">
            <span>{{ statisticsData.entryRatio }}%</span>
            <div>录入比例</div>
          </div>
        </div>
      </template>
      <template #tableTitle>
        <a-button type="primary" v-auth="'occupationalHealth:files:add'" preIcon="ant-design:plus-outlined" @click="add">新增</a-button>
        <a-button
          type="primary"
          v-show="selectedRowKeys.length > 0"
          v-auth="'occupationalHealth:files:batchdel'"
          preIcon="ant-design:export-outlined"
          @click="batchDel"
          :loading="loading"
          >批量删除</a-button
        >
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'occupationalHealth:files:import'" @click="onImportXls"
          >导入人员信息</j-upload-button
        >
        <a-button type="primary" v-auth="'occupationalHealth:files:temp'" preIcon="ant-design:download-outlined" @click="onExportTemplateXls"
          >导入模板下载</a-button
        >
        <a-button
          type="primary"
          v-auth="'occupationalHealth:files:export'"
          preIcon="ant-design:export-outlined"
          @click="downloadZip"
          :loading="loading"
          >导出监护档案</a-button
        >
        <a-button
          type="primary"
          v-auth="'occupationalHealth:files:detectionEntryDownload'"
          preIcon="ant-design:export-outlined"
          @click="onDetectionEntryTemplateXls"
          :loading="loading"
          >检测录入模板下载</a-button
        >
        <a-button
          type="primary"
          v-auth="'occupationalHealth:files:detectionEntryImport'"
          preIcon="ant-design:export-outlined"
          @click="detectionEntryOpen"
          :loading="loading"
          >检测录入</a-button
        >
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :drop-down-actions="getDropDownAction(record)" />
      </template>
      <template #status="{ record }">{{ record.status == 1 ? '完成' : '未完成' }}</template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submitSuccess="submitSuccess" />
    <CheckInDrawer @register="registerCheckIn" @submitSuccess="submitSuccess" />
    <CheckModal @register="registerCheckModal" @submitSuccess="submitSuccess" />
  </div>

  <div>
    <a-modal v-model:visible="detectionEntryVisible" :title="'检测录入'" :footer="null" @cancel="detectionEntryVisible = false">
      <a-card>
        <a-upload-dragger :fileList="fileList" name="file" :multiple="false" :before-upload="beforeUpload" @remove="handleRemove">
          <p>
            <Icon style="font-size: 48px; padding-right: 5px" icon="vscode-icons:file-type-excel" />
          </p>
          单击或拖动文件到此区域以上传
        </a-upload-dragger>
        <div style="text-align: right; padding-top: 20px">
          <a-button :loading="loading" type="primary" @click="detectionEntryImportFile"> 上传文件 </a-button>
        </div>
      </a-card>
    </a-modal>
  </div>
</template>

<script lang="ts" name="occupationalHealth-files" setup>
  import { detectionEntryImport } from '/@/views/occupationalHealth/api';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { downloadFileAll } from '/@/api/common/api';
  import CheckInDrawer from './checkInDrawer.vue';
  import { useContent } from './hooks/useContent';
  import { UploadProps } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import CheckModal from './checkModal.vue';
  import Icon from '/@/components/Icon';
  import DrawerView from './drawer.vue';
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  
  const detectionEntryVisible = ref(false);
  const fileList = ref([]);
  const {
    registerTable,
    getTableAction,
    add,
    tabActive,
    registerDrawer,
    registerCheckModal,
    reload,
    onExportXls,
    getDropDownAction,
    onImportXls,
    registerCheckIn,
    rowSelection,
    selectedRowKeys,
    batchDel,
    statisticsData,
  } = useContent();

  const tabClick = (tab) => {
    tabActive.value = tab;
    reload();
  };

  const submitSuccess = () => {
    reload();
  };

  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('职业健康监护档案', '/archives/importTemplate', params);
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
    if (!fileList.value || fileList.value.length == 0) {
      message.warning('请选择文件');
      return;
    }
    loading.value = true;
    const formData = new FormData();
    formData.append('file', fileList.value[0]);
    detectionEntryImport(formData).then((code) => {
      if (code == '导入成功') {
        fileList.value = [];
        detectionEntryVisible.value = false;
        reload();
      }
    }).finally(() => {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    });
  };
</script>
<style lang="less" scoped>
  .jeecg-basic-table{
    padding: 0 10px;
    :deep(.ant-form){
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }
  .tabs{
    width: 100%;
    height: 55px;
    padding: 0 10px;
    box-sizing: border-box;
    .tab-wrap{
      width: 100%;
      height: 100%;
      padding: 0 10px;
      background-color: #ffffff;
    }
    .inner{
      width: 100%;
      height: 100%;
      display: flex;
      border-bottom: 1px solid #dcdfe6;
    }
    .tab{
      padding: 0 16px;
      line-height: 55px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .active{
      color: #1890ff;
      border-bottom: 2px solid #1890ff;
    }
  }
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
