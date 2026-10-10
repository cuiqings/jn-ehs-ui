<template>
  <div class="p-1">
    <div class="tabs">
      <div class="tab-wrap">
        <div class="inner">
          <div class="tab" @click="tabClick('1')" :class="{ active: tabActive == '1' }">需要体检</div>
          <div class="tab" @click="tabClick('2')" :class="{ active: tabActive == '2' }">无需体检</div>
          <div class="tab" @click="tabClick('3')" :class="{ active: tabActive == '3' }">待检测录入</div>
        </div>
      </div>
    </div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #headerTop>
        <div class="hd">
          <div class="item">
            <span>{{ statisticsData.total }}</span>
            <div>人数</div>
          </div>
          <div class="item">
            <span>{{ statisticsData.already }}</span>
            <div>已体检人数</div>
          </div>
          <div class="item">
            <span>{{ statisticsData.ratio }}%</span>
            <div>体检比例</div>
          </div>
          <div class="item" v-show="tabActive == '1'">
            <span>{{ statisticsData.wait }}</span>
            <div>待体检人数</div>
          </div>
        </div>
      </template>
      <template #tableTitle>
        <a-button
          type="primary"
          v-show="selectedRowKeys.length > 0"
          v-auth="'occupationalHealth:checkup:batchdel'"
          preIcon="ant-design:export-outlined"
          @click="batchDel"
          >批量删除</a-button
        >
        <div>
          <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        </div>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #type="{ record }">{{ setType(record) }}</template>
      <template #status="{ record }">{{ { 1: '待危害因素检测', 2: '完成', 3: '待体检', 4: '复查' }[record.status] }}</template>
      <template #checkResult="{ record }">{{
        { 1: '未见异常', 2: '疑似职业病', 3: '禁忌证', 4: '其他疾患', 5: '复查' }[record.checkResult]
      }}</template>
      <template #annex="{ record }">
        <div v-if="getAnnexList(record.annex).length" style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px">
          <a v-for="(url, idx) in getAnnexList(record.annex)" :key="idx" :title="getFileName(url)" style="color: #1890ff" @click="handleAnnexClick(url)">{{
            getDisplayName(url)
          }}</a>
        </div>
        <span v-else>-</span>
      </template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submit-success="submitSuccess" />
    <a-modal v-model:visible="openNocheck" title="无需体检" @ok="noCheckOk" @cancel="noCheckCancel" :bodyStyle="{ padding: '16px' }" width="500">
      <a-form :model="formState" layout="vertical" autocomplete="off" ref="noCheckFormRef">
        <a-form-item label="原因" name="reason" :rules="[{ required: true, message: '请输入无需体检原因！' }]">
          <a-textarea placeholder="请输入无需体检原因" v-model:value="formState.reason" :auto-size="{ minRows: 2, maxRows: 5 }" />
        </a-form-item>
        <a-form-item label="上传附件" name="annex" :rules="[{ required: true, message: '请上传附件！' }]">
          <JUpload :maxCount="5" v-model:value="formState.annex" text="上传附件" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" name="occupationalHealth-checkup" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { previewFile } from '/@/api/common/api';
  import { createImgPreview } from '/@/components/Preview/index';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { useContent } from './hooks/useContent';
  import DrawerView from './drawer.vue';
  const {
    registerTable,
    getTableAction,
    registerDrawer,
    batchDel,
    selectedRowKeys,
    rowSelection,
    submitSuccess,
    statisticsData,
    tabActive,
    tabClick,
    openNocheck,
    formState,
    noCheckOk,
    noCheckCancel,
    noCheckFormRef,
    onExportXls,
  } = useContent();
  const setType = (record) => {
    const map = { 1: '岗前', 2: '在岗', 3: '离职' };
    let str = '';
    record.type &&
      record.type.split(',').forEach((item) => {
        str += map[item] + ',';
      });
    str = str.substring(0, str.length - 1);
    return str;
  };
  // 兼容后端返回的附件字段为字符串（逗号分隔）或数组的情况
  const getAnnexList = (annex) => {
    if (!annex) return [];
    if (Array.isArray(annex)) return annex.filter(Boolean);
    if (typeof annex === 'string') return annex.split(',').filter(Boolean);
    return [];
  };
  // 根据扩展名判断文件类型
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  const isImageFile = (url) => imageExts.includes(String(url).split('.').pop().toLowerCase());
  const isPdfFile = (url) => String(url).split('.').pop().toLowerCase() === 'pdf';
  // 从文件路径中提取文件名
  const getFileName = (path) => {
    let p = String(path).replace(/\\/g, '/');
    return p.substring(p.lastIndexOf('/') + 1);
  };
  // 文件名超过15个字符时截断显示省略号
  const getDisplayName = (url) => {
    const name = getFileName(url);
    return name.length > 15 ? name.slice(0, 12) + '...' : name;
  };
  // 附件点击：图片放大预览，pdf 在线预览，word/excel 下载
  const handleAnnexClick = (url) => {
    if (isImageFile(url)) {
      createImgPreview({ imageList: [getFileAccessHttpUrl(url)], maskClosable: true });
    } else if (isPdfFile(url)) {
      previewFile(url).then((res) => {
        window.open(res, '_blank');
      });
    } else {
      downloadFile(url, getFileName(url));
    }
  };
</script>
<style lang="less" scoped>
  .jeecg-basic-table {
    padding: 0 10px;
    :deep(.ant-form) {
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }
  .tabs {
    width: 100%;
    height: 55px;
    padding: 0 10px;
    box-sizing: border-box;
    .tab-wrap {
      width: 100%;
      height: 100%;
      padding: 0 10px;
      background-color: #ffffff;
    }
    .inner {
      width: 100%;
      height: 100%;
      display: flex;
      border-bottom: 1px solid #dcdfe6;
    }
    .tab {
      padding: 0 16px;
      line-height: 55px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .active {
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
    .item:nth-child(2) {
      color: #f7901a;
    }
    .item:nth-child(3),
    .item:nth-child(4) {
      color: #15803d;
    }
    .item:nth-child(5) {
      color: #f82020;
    }
  }
  .header {
    height: 158px;
    padding: 10px;

    .head-inner {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .search {
        padding: 10px 16px;
      }
      background-color: #ffffff;
      .main {
        flex: 1;
        background-color: #eef8fe;
        display: flex;
        align-items: center;
        justify-content: space-around;
        .item {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
        }
        .item-start {
          height: 60%;
          border-left: 1px solid #dcdcdc;
        }
      }
    }
  }
</style>
