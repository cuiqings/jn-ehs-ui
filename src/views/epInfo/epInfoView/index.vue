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
              expand-action="dblclick"
              @expand="onExpand"
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
              class="epInfoView-table"
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
  </page-wrapper>
</template>
<script lang="ts" name="epInfo-view" setup>
  import Icon from '/@/components/Icon';
  import { onMounted, onUnmounted } from 'vue';
  import { destroyContextMenu } from '/@/components/ContextMenu';
  import { Empty } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { useView } from './hooks/useView';
  import { useTree } from './hooks/useTree';
  import { useStatement } from './hooks/useStatement';
  const { dataSource, formInfo, treeLoading, tableLoading, fieldNames, nowChooseFile } = useStatement();
  const { selectedKeys, treeData, onTreeSelect, pageBreak, clickBread, expandedKeys, rTreeClick, menuId, onSearch, onExpandAll, onExpand, getTree } =
    useTree(dataSource, treeLoading, formInfo, nowChooseFile);
  const { columns, functionRightTable, getSize, getdateTime, getFileType } = useView(clickBread, menuId, nowChooseFile, getTree);
  onMounted(() => {
    document.addEventListener('contextmenu', handleDocumentClick);
  });
  onUnmounted(() => {
    document.removeEventListener('contextmenu', handleDocumentClick);
  });
  const handleDocumentClick = (event: any) => {
    const tableNode = document.getElementsByClassName('ant-table-row');
    let isTable = true;
    for (let i = 0; i < tableNode.length; i++) {
      if (tableNode[i].contains(event.target)) {
        isTable = false;
      }
    }
    if (isTable) destroyContextMenu();
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
  .epInfoView-table {
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
