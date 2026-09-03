<template>
  <div class="home">
    <div class="home-content" v-if="isContent === 'content'">
      <a-row style="height: 100%">
        <a-col :span="6" style="height: 100%">
          <div class="home-content_tree">
            <div
              >主题分类（{{ count }}）<div>
                <a-tooltip>
                  <template #title>展开目录</template>
                  <a-button type="link" @click="onExpandAll">
                    <a-icon type="menu-fold" class="icon icon2" />
                  </a-button>
                </a-tooltip>
                <a-tooltip>
                  <template #title>关闭目录</template>
                  <a-button type="link" @click="onExpand">
                    <a-icon type="menu-unfold" class="icon icon2" />
                  </a-button>
                </a-tooltip> </div
            ></div>
            <a-spin :spinning="treeLoading">
              <a-tree
                v-if="treeData.length > 0"
                v-model:expandedKeys="expandedKeys"
                :tree-data="treeData"
                block-node
                @select="selectTree"
                :field-names="{
                  title: 'name',
                  key: 'name',
                  options: 'children',
                }"
              />
              <a-empty v-else description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </a-spin>
          </div>
        </a-col>
        <a-col :span="18" style="height: 100%">
          <div class="home-content_result">
            <basic-table @register="registerTable">
              <template #fileName="{ record }">
                <span style="cursor: pointer; color: #1890ff" @click="onView(record)">{{ record.fileName }}</span>
              </template>
            </basic-table>
          </div>
        </a-col>
      </a-row>
    </div>
    <home-view :list-obj="listObj" :breadcrumb-text="breadcrumbText" @success="onSuccess" v-if="isContent === 'view'" />
  </div>
</template>
<script lang="ts" name="law-collect" setup>
  import { useContent } from './hooks/useContent';
  import homeView from '../lawLaw/component/view.vue';
  import { BasicTable } from '/@/components/Table';
  import { Empty } from 'ant-design-vue';
  const {
    isContent,
    expandedKeys,
    treeData,
    count,
    selectTree,
    listObj,
    onSuccess,
    breadcrumbText,
    registerTable,
    onView,
    onExpandAll,
    onExpand,
    treeLoading,
  } = useContent();
</script>
<style lang="less" scoped>
  .home {
    background-color: rgba(251, 250, 250, 1);
    height: 100%;
  }
  .home-content {
    padding: 20px 0;
    width: 90%;
    margin: 0 auto;
    height: calc(100vh - 100px);
    .home-content_tree {
      margin-right: 15px;
      border: 1px solid rgb(215, 215, 215);
      border-radius: 5px;
      height: calc(100vh - 140px);
      & > div:nth-child(1) {
        height: 60px;
        line-height: 60px;
        background-color: rgb(242, 242, 242);
        font-size: 18px;
        text-align: center;
        border-radius: 5px 5px 0 0;
        position: relative;
        & > div {
          position: absolute;
          top: 0;
          right: 0;
        }
      }
    }
    .home-content_result {
      background-color: #ffffff;
      border: 1px solid rgb(215, 215, 215);
      border-radius: 5px;
      padding: 15px;
      height: 100%;
    }
  }
  /deep/ .ant-tree {
    height: 100%;
    overflow-y: auto;
    padding: 20px;
    font-size: 16px;
    border-radius: 0 0 5px 5px;
  }
  /deep/.ant-table-title {
    min-height: 0 !important;
  }
  /deep/ .ant-spin-nested-loading {
    height: calc(100% - 80px);
    .ant-spin-container {
      height: 100%;
    }
  }
</style>
