<template>
  <div class="autonomous">
    <div class="custom-tabs">
      <div class="custom-tabs-nav">
        <div class="flex-align_center">
          <div
            v-for="item in tabsArr"
            :key="item.keys"
            :class="['custom-tab', { active: activeKey === item.keys }]"
            @click="handleTabChange(item.keys)"
            >{{ item.title }}</div
          >
        </div>
      </div>
      <div class="custom-tabs-content" v-show="activeKey === '1'">
        <basic-table @register="registerTable">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'autonomous:add'" @click="handleAdd">新增</a-button>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" />
          </template>
          <template #file="{ record }">
            <span style="cursor: pointer; color: #1890ff" @click="onPreview(record.file)">{{ trimFileName(record.file) }}</span>
          </template>
        </basic-table>
        <ReviewModal @register="registerModal" @success="handleSuccess" />
        <AddModal @register="registerAddModal" @success="handleSuccess" />
      </div>
      <div class="custom-tabs-content" v-show="activeKey === '2'">
        <basic-table @register="registerTable1">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="onAssessment">新增考核 </a-button>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions1(record)" />
          </template>
        </basic-table>
        <assessmentAddModal @register="registerAssessmentAddModal" @success="handleSuccess" />
      </div>
    </div>
  </div>
</template>
<script setup name="sm-autonomous" lang="ts">
  import ReviewModal from './reviewModal.vue';
  import AddModal from './addModal.vue';
  import assessmentAddModal from './assessmentAddModal.vue';
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  const {
    registerTable,
    getActions,
    registerModal,
    handleSuccess,
    onPreview,
    trimFileName,
    handleAdd,
    registerAddModal,
    tabsArr,
    activeKey,
    handleTabChange,
    onAssessment,
    getActions1,
    registerTable1,
    registerAssessmentAddModal,
  } = useContent();
</script>
<style lang="less" scoped>
  .autonomous {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
    padding: 15px;
    .custom-tabs {
      .custom-tabs-nav {
        display: flex;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 16px;
        align-items: center;
        justify-content: space-between;
        .flex-align_center {
          display: flex;
          align-items: center;
        }
        .custom-tab {
          padding: 12px 24px;
          cursor: pointer;
          font-size: 16px;
          color: #333;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          &.active {
            color: #1890ff;
            border-bottom: 2px solid #1890ff;
            background: #fff;
          }
          &:not(.active):hover {
            color: #40a9ff;
          }
        }
      }
    }
  }
</style>
