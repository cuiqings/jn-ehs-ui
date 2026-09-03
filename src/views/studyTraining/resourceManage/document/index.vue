<template>
  <div style="height: 100%">
    <a-row type="flex" style="height: calc(100vh - 98px)">
      <a-col :md="5" :sm="24" style="overflow: auto; height: 100%">
        <div style="margin: 10px 0 10px 10px; height: calc(100% - 20px)">
          <a-directory-tree
            style="margin: 15px"
            selectable
            draggable
            :treeData="treeData"
            :selectedKeys="selectedKeys"
            check-strictly
            v-model:expandedKeys="expandedKeys"
            @select="onSelect"
          >
            <template #icon="{ expanded, isLeaf }">
              <template v-if="expanded && !isLeaf">
                <FolderOpenOutlined />
              </template>
              <template v-else>
                <FolderOutlined />
              </template>
            </template>
          </a-directory-tree>
        </div>
      </a-col>
      <a-col :md="19" :sm="24">
        <basic-table @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'rsDocument:add'" @click="handleAdd">上传文档</a-button>
            <a-button
              preIcon="ant-design:delete-outlined"
              v-auth="'rsDocument:batchDel'"
              v-if="selectedRowKeys.length > 0"
              @click="batchHandleDelete"
            >
              批量删除</a-button
            >
            <a-button type="primary" v-if="selectedRowKeys.length > 0" v-auth="'rsDocument:batchEdit'" @click="handleBatchEdit">批量编辑</a-button>
          </template>
          <template #name="{ record }">
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; word-break: keep-all" :title="record.name">
              <Icon icon="vscode-icons:file-type-word" v-if="record.fileType == 'doc' || record.fileType == 'docx'" />
              <Icon icon="bi:file-earmark-pdf" :style="{ color: 'red' }" v-else-if="record.fileType == 'pdf'" />
              <Icon icon="icon-park-outline:file-pdf" :style="{ color: 'red' }" v-else-if="record.fileType == 'ppt' || record.fileType == 'pptx'" />
              {{ record.name }}
            </div>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" />
          </template>
        </basic-table>
      </a-col>
    </a-row>
  </div>
  <draggerModal
    uploadText="将文档拖拽到此处上传"
    uploadHint="支持一次上传多个/支持word、ppt、pdf格式文档，大小在200MB以内。"
    title="上传文档"
    file-type="DOCUMENT"
    name="文档"
    :fileSize="200"
    :category="selectedKeys[0]"
    @register="registerModal"
    @success="handleSuccess"
  />
  <editModal labelText="文档" @register="registerEditModal" @success="handleSuccess" />
  <a-modal v-model:visible="visible" :body-style="{ margin: '20px' }" title="设置" @ok="handleReturnOk">
    <template #footer>
      <a-button key="back" @click="() => (visible = false)">取消</a-button>
      <a-button key="submit" type="primary" @click="handleReturnOk">确认</a-button>
    </template>
    <a-form :model="info" ref="infoRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
      <a-form-item label="最少观看时间" name="duration" :rules="[{ required: true, message: '最少观看时间为必填项！' }]">
        <a-input-number
          style="width: 100%"
          addon-after="分"
          v-model:value="info.duration"
          placeholder="请输入"
          :controls="false"
          :precision="0"
          :min="0"
        />
      </a-form-item>
    </a-form>
  </a-modal>
  <batchEditModal labelText="文档" @register="registerBatchEditModal" @success="handleSuccess" />
</template>
<script setup name="resourceManage-document" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import draggerModal from '../components/draggerModal.vue';
  import editModal from '../components/editModal.vue';
  import batchEditModal from '../components/batchEditModal.vue';
  import Icon from '/@/components/Icon';
  import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons-vue';
  import { ref } from 'vue';
  const infoRef = ref();
  const {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    selectedRowKeys,
    batchHandleDelete,
    registerModal,
    handleSuccess,
    registerEditModal,
    treeData,
    selectedKeys,
    expandedKeys,
    onSelect,
    visible,
    handleReturnOk,
    info,
    registerBatchEditModal,
    handleBatchEdit,
  } = useMainContent(infoRef);
</script>
<style scoped lang="less">
  :deep(.ant-tree) {
    height: 100%;
    overflow-y: auto;
  }
</style>
