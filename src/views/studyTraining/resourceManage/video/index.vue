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
            <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'rsVideo:add'" @click="handleAdd">上传视频</a-button>
            <a-button preIcon="ant-design:delete-outlined" v-auth="'rsVideo:batchDel'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
              批量删除</a-button
            >
            <a-button type="primary" v-if="selectedRowKeys.length > 0" v-auth="'rsVideo:batchEdit'" @click="handleBatchEdit">批量编辑</a-button>
          </template>
          <template #name="{ record }">
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; word-break: keep-all" :title="record.name">
              <Icon icon="fluent:video-clip-28-filled" style="color: #1890ff" />
              {{ record.name }}
            </div>
          </template>
          <template #transcodingStatus="{ record }">
            <a-tag v-if="record.transcodingStatus === '0'" color="default">等待转码</a-tag>
            <a-tag v-if="record.transcodingStatus === '1'" color="success">已转码</a-tag>
            <a-tag v-if="record.transcodingStatus === '2'" color="processing">转码中</a-tag>
            <a-tag v-if="record.transcodingStatus === '3'" color="error">转码失败</a-tag>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" />
          </template>
        </basic-table>
      </a-col>
    </a-row>
  </div>
  <uploadDraggerModal
    uploadText="将视频拖拽到此处上传"
    uploadHint="支持500MB以内的mp4文件。"
    title="上传视频"
    accept=".mp4"
    :category="selectedKeys[0]"
    @register="registerModal"
    @success="handleSuccess"
  />
  <playerModal @register="registerPlayerModal" />
  <editModal labelText="视频" @register="registerEditModal" @success="handleSuccess" />
  <testQuestionsModal @register="registerQuestionsModal" />
  <batchEditModal labelText="视频" @register="registerBatchEditModal" @success="handleSuccess" />
</template>
<script setup name="resourceManage-video" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import uploadDraggerModal from './uploadDraggerModal.vue';
  import playerModal from './playedu-player/playerModal.vue';
  import editModal from '../components/editModal.vue';
  import testQuestionsModal from './testQuestionsModal.vue';
  import batchEditModal from '../components/batchEditModal.vue';
  import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons-vue';
  const {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    selectedRowKeys,
    batchHandleDelete,
    registerModal,
    handleSuccess,
    registerPlayerModal,
    registerEditModal,
    treeData,
    selectedKeys,
    expandedKeys,
    onSelect,
    registerQuestionsModal,
    registerBatchEditModal,
    handleBatchEdit,
  } = useMainContent();
</script>
<style scoped lang="less">
  :deep(.ant-tree) {
    height: 100%;
    overflow-y: auto;
  }
</style>
