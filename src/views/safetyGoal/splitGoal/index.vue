<template>
  <div class="p-1">
    <BasicTable @register="registerTable">
      <template #headerTop>
        <div class="hd">
          <div class="item">
            <span>{{ statisticsData.totalGoal }}</span>
            <div>总目标</div>
          </div>
          <div class="item">
            <span>{{ statisticsData.decompose }}</span>
            <div>已分解</div>
          </div>
          <div class="item">
            <span>{{ statisticsData.notDecompose }}</span>
            <div>待分解</div>
          </div>
          <div class="item">
            <span>{{ statisticsData.goalWarning }}</span>
            <div>目标预警</div>
          </div>
        </div>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #type="{ record }">{{ setType(record) }}</template>
      <template #status="{ record }">{{ { 1: '已发布', 2: '草稿', 3: '完成' }[record.status] }}</template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submit-success="submitSuccess" />
  </div>
</template>

<script lang="ts" name="safetyGoal-splitGoal" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import DrawerView from './drawer.vue';
  const {
    registerTable,
    getTableAction,
    registerDrawer,
    rowSelection,
    submitSuccess,
    statisticsData,
    tabActive,
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
