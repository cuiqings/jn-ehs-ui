<template>
  <div class="blacklist">
    <div class="blacklist-tabs">
      <div>
        <div :class="activeKey === '0' ? 'active' : ''" @click="handleTabChange('0')">企业黑名单（ {{ companyCount }} ）</div>
        <div :class="activeKey === '1' ? 'active' : ''" @click="handleTabChange('1')">用工黑名单（ {{ personCount }} ）</div>
      </div>
    </div>
    <basic-table @register="registerTable" v-if="activeKey === '0'">
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <basic-table @register="registerUserTable" v-if="activeKey === '1'">
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
      <template #yhNumber="{ record }">
        <div v-if="record.yhNumber === 0 || !record.yhNumber">{{ 0 }}</div>
        <div v-else style="color: red; cursor: pointer" @click="handleYhNumber(record)">
          {{ record.yhNumber }}
        </div>
      </template>
    </basic-table>
  </div>
  <add-or-edit @register="registerModal" />
  <personnel-drawer @register="registerDrawer" />
</template>
<script setup name="sm-blacklist" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMainContent } from './hooks/useMainContent';
  import addOrEdit from '../enterpriseList/addOrEdit.vue';
  import personnelDrawer from '../personnelList/drawer.vue';
  const {
    registerTable,
    getActions,
    activeKey,
    handleTabChange,
    companyCount,
    personCount,
    registerUserTable,
    registerModal,
    registerDrawer,
    handleYhNumber,
  } = useMainContent();
</script>
<style lang="less" scoped>
  .blacklist {
    .jeecg-basic-table-form-container {
      padding-top: 0;
    }
    .blacklist-tabs {
      display: flex;
      justify-content: space-between;
      margin: 10px 10px 0 10px;
      padding-top: 15px;
      background-color: #fff;
      & > div:nth-child(1) {
        display: flex;
        div {
          background-color: rgb(239, 239, 239);
          font-size: 16px;
          color: #666;
          padding: 10px 20px;
          border-radius: 10px 10px 0 0;
          cursor: pointer;
        }
        .active {
          background-color: #1890ff;
          color: #fff;
          font-weight: normal;
        }
        & > div:nth-child(1) {
          margin-right: 10px;
        }
      }
    }
  }
</style>
