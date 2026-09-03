<template>
  <page-wrapper>
    <a-row type="flex" :gutter="15" style="height: 100%; height: calc(100vh - 130px)">
      <a-col :md="6" :sm="24" style="overflow: auto; height: 100%">
        <a-card style="min-height: 100%">
          <template #extra>
            <div style="display: flex">
              <a-tooltip>
                <template #title>展开目录</template>
                <a-button type="link" @click="onExpandAll()">
                  <a-icon type="menu-fold" class="icon icon2" />
                </a-button>
              </a-tooltip>
              <a-tooltip>
                <template #title>关闭目录</template>
                <a-button type="link" @click="onExpand([])">
                  <a-icon type="menu-unfold" class="icon icon2" />
                </a-button>
              </a-tooltip>
            </div>
          </template>
          <a-spin :spinning="treeLoading">
            <a-directory-tree
              :tree-data="treeData"
              selectable
              draggable
              :expanded-keys="expandedKeys"
              :field-names="fieldNames"
              :selected-keys="selectedKeys"
              @select="onTreeSelect"
              @dragenter="onDragEnter"
              @drop="onDrop"
              @expand="onExpand"
              expand-action="dblclick"
              @right-click="rTreeClick"
            />
            <a-empty v-if="treeData.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </a-spin>
        </a-card>
      </a-col>
      <a-col :md="18" :sm="24">
        <a-card style="height: 100%">
          <template #title>
            <a-breadcrumb separator=">">
              <a-breadcrumb-item v-for="(item, i) in pageBreak" :key="i">
                <a @click="clickBread(item.id)">{{ item.value }}</a>
              </a-breadcrumb-item>
            </a-breadcrumb>
          </template>
          <template #extra>
            <a-input-search style="width: 360px" v-model:value="formInfo.text" placeholder="搜索文件夹和文件资料" enter-button @search="onSearch" />
          </template>
          <a-spin :spinning="tableLoading">
            <a-table
              ref="table"
              class="epInfoManage-table"
              size="middle"
              row-key="id"
              :columns="columns"
              :data-source="dataSource"
              :custom-row="functionRightTable"
            >
              <template #fileName="{ record }">
                <Icon style="color: #11abff; padding-right: 5px" icon="ic:twotone-folder" v-if="record.type == 'folder'" />
                <Icon style="padding-right: 5px" icon="vscode-icons:file-type-word" v-else-if="record.type == 'doc'" />
                <Icon style="padding-right: 5px" icon="vscode-icons:file-type-excel" v-else-if="record.type == 'excel'" />
                <Icon style="color: red; padding-right: 5px" icon="bxs:image" v-else-if="record.type == 'image'" />
                <Icon style="padding-right: 5px" icon="flat-color-icons:document" v-else-if="record.type == 'text'" />
                <a-icon type="file-pdf" :style="{ color: 'red' }" v-else-if="record.type == 'pdf'" />
                <a-icon type="file-ppt" :style="{ color: 'red' }" v-else-if="record.type == 'pp'" />
                <Icon style="color: #11abff; padding-right: 5px" icon="ph:file" v-else-if="record.type == 'file'" />
                <Icon style="color: #11abff; padding-right: 5px" icon="ph:file" v-else />
                <a-tooltip>
                  <template #title>{{ record.value }}</template>
                  <span style="margin-left: 5px">{{ record.value }}</span>
                </a-tooltip>
              </template>
              <template #date="{ record }">
                <span>{{ getdateTime(record.date) }}</span>
              </template>
              <template #downCount="{ record }">
                <span v-if="record.type !== 'folder'">{{ record.downCount }}</span>
              </template>
              <template #readCount="{ record }">
                <span v-if="record.type !== 'folder'">{{ record.readCount }}</span>
              </template>
              <template #type="{ record }">
                <span>{{ getFileType(record.type) }}</span>
              </template>
              <template #size="{ record }">
                <span v-if="record.type !== 'folder'">{{ getSize(record.size) }}</span>
              </template>
            </a-table>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
    <!-- 新增修改tree -->
    <a-modal v-model:visible="visibleAdd" :body-style="{ margin: '20px' }" :title="treeTitle" ok-text="确定" cancel-text="取消" @ok="hideModal">
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item :label="treeFormItem" v-bind="validateInfos.title">
          <a-input v-model:value="fromInfo.title" :maxlength="30" placeholder="请输入" />
        </a-form-item>
      </a-form>
    </a-modal>
    <file-model ref="fileModelRef" @ok="getTree" />
    <log ref="logRef" />
    <authorize ref="authorizeRef" @ok="getTree" />
  </page-wrapper>
</template>
<script lang="ts" name="epInfo-manage" setup>
  import Icon from '/@/components/Icon';
  import { ref, onMounted, onUnmounted } from 'vue';
  import { destroyContextMenu } from '/@/components/ContextMenu';
  import { Empty } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import FileModel from './component/FileModel.vue';
  import Authorize from './component/Authorize.vue';
  import Log from './component/Log.vue';
  import { useManage } from './hooks/useManage';
  import { useTree } from './hooks/useTree';
  import { useStatement } from './hooks/useStatement';
  const { dataSource, formInfo, treeLoading, tableLoading, fieldNames, nowChooseFile, token } = useStatement();
  const fileModelRef = ref();
  const logRef = ref();
  const authorizeRef = ref();
  const {
    selectedKeys,
    treeData,
    onTreeSelect,
    onAddChild,
    onDelete,
    pageBreak,
    clickBread,
    expandedKeys,
    onDragEnter,
    onExpand,
    rTreeClick,
    visibleAdd,
    fromInfo,
    hideModal,
    validateInfos,
    treeTitle,
    treeFormItem,
    editMenuItem,
    uploadFile,
    getTree,
    menuId,
    onSearch,
    onExpandAll,
    onDrop,
    onAuthorize,
  } = useTree(dataSource, treeLoading, formInfo, fileModelRef, nowChooseFile, authorizeRef, token);
  const { columns, functionRightTable, getSize, getdateTime, getFileType } = useManage(
    clickBread,
    onDelete,
    uploadFile,
    editMenuItem,
    onAddChild,
    menuId,
    nowChooseFile,
    logRef,
    getTree,
    onAuthorize
  );
  onMounted(() => {
    document.addEventListener('contextmenu', handleDocumentClick);
  });
  onUnmounted(() => {
    document.removeEventListener('contextmenu', handleDocumentClick);
  });
  const handleDocumentClick = (event: any) => {
    const treeNode = document.getElementsByClassName('ant-tree-node-content-wrapper-open');
    const treeNode1 = document.getElementsByClassName('ant-tree-node-content-wrapper-close');
    const tableNode = document.getElementsByClassName('ant-table-row');
    let isTree = true;
    let isTable = true;
    for (let i = 0; i < treeNode.length; i++) {
      if (treeNode[i].contains(event.target)) {
        isTree = false;
      }
    }
    for (let i = 0; i < treeNode1.length; i++) {
      if (treeNode1[i].contains(event.target)) {
        isTree = false;
      }
    }
    for (let i = 0; i < tableNode.length; i++) {
      if (tableNode[i].contains(event.target)) {
        isTable = false;
      }
    }
    if (isTree && isTable) destroyContextMenu();
  };
</script>
<style lang="less" scoped>
  .dropdownIcon {
    padding-right: 10px;
  }
  /deep/.ant-tree {
    .tree-file {
      .ant-tree-switcher {
        display: none;
      }
      .ant-tree-node-content-wrapper {
        margin-left: 22px;
      }
    }
  }
  .epInfoManage-table {
    -moz-user-select: none; /*火狐*/
    -webkit-user-select: none; /*webkit浏览器*/
    -ms-user-select: none; /*IE10*/
    -khtml-user-select: none; /*早期浏览器*/
    user-select: none;
  }
  /deep/ .ant-tree-node-content-wrapper {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
