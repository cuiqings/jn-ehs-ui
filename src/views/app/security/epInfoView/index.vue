<template>
  <a-card>
    <a-row :gutter="24">
      <a-col :span="24">
        <a-form-item>
          <a-input-search placeholder="搜索文件夹和文件资料" allowClear enter-button @search="onSearch" v-model="searchVal" />
        </a-form-item>
      </a-col>
    </a-row>
    <div>
      <a-breadcrumb>
        <a-breadcrumb-item>
          <a @click="getList">全部</a>
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="(item, index) in pageBreak" :key="item.id">
          <a @click="breadClick(item, index)">{{ item.value }}</a>
        </a-breadcrumb-item>
      </a-breadcrumb>
      <a-list item-layout="horizontal" :data-source="pageTree">
        <template #renderItem="{ item }">
          <a-list-item v-if="item?.isFolder === '1'" class="renderItemClass">
            <div class="pageList" @click="listItemClick(item)">
              <div style="margin-right: 10px">
                <!-- 图标 -->
                <a-avatar>
                  <template #icon>
                    <FolderOutlined />
                  </template>
                </a-avatar>
              </div>
              <div class="file-text">{{ item.value }}</div>
            </div>
          </a-list-item>
          <a-list-item v-else class="renderItemClass">
            <div class="pageList" @touchstart="listItemClick(item)">
              <div style="margin-right: 10px">
                <!-- 图标 -->
                <img class="file-img" v-if="!getIconType(item.type)" :src="getIcon(item.type)" />
                <a-avatar v-if="getIconType(item.type)">
                  <template #icon>
                    <FileUnknownOutlined />
                  </template>
                </a-avatar>
              </div>
              <div class="file-text">{{ item.value }}</div>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </a-card>
</template>
<script setup name="app-epInfo-list" lang="ts">
  import { useList } from './hooks/useList';
  import { FileUnknownOutlined, FolderOutlined } from '@ant-design/icons-vue';
  const { onSearch, searchVal, pageBreak, breadClick, getList, pageTree, listItemClick, getIconType, getIcon } = useList();
</script>
<style lang="less" scoped>
  .renderItemClass {
    display: block;
    .pageList {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      .file-img {
        width: 32px;
        height: 32px;
      }
      .file-text {
        width: calc(100% - 42px);
      }
    }
  }
</style>
