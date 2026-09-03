<template>
  <div class="p-1">
    <a-tabs v-model:activeKey="tabActive" @change="tabChange">
      <a-tab-pane key="1" tab="检测录入">
        <BasicTable @register="registerTableCheckIn">
          <template #headerTop>
            <div class="hd">
              <div class="item">
                <span>{{ statisticsDataCheckIn.total }}</span>
                <div>接害人数</div>
              </div>
              <div class="item">
                <span>{{ statisticsDataCheckIn.finish }}</span>
                <div>检测结果录入人数</div>
              </div>
              <div class="item">
                <span>{{ statisticsDataCheckIn.rate }}</span>
                <div>录入比例</div>
              </div>
            </div>
          </template>
          <template #tableTitle>
            <a-button
              type="primary"
              v-auth="'occupationalHealth:checkup:batchdel'"
              preIcon="ant-design:export-outlined"
              @click="onExportXlsCheckIn"
              >导出</a-button
            >
          </template>
          <!--操作栏-->
          <template #action="{ record }">
            <TableAction :actions="getTableActionCheckIn(record)" />
          </template>
          <template #type="{ record }">{{ { 1: '岗前', 2: '在岗', 3: '离职' }[record.type] }}</template>
          <template #status="{ record }">{{ { 1: '待危害因素检测', 2: '完成', 3: '待体检', 4: '复查' }[record.status] }}</template>
          <template #checkResult="{ record }">{{
            { 1: '未见异常', 2: '疑似职业病', 3: '禁忌证', 4: '其他疾患', 5: '复查' }[record.checkResult]
          }}</template>
        </BasicTable>
      </a-tab-pane>
      <a-tab-pane key="2" tab="职业健康体检" force-render>
        <BasicTable @register="registerTable">
          <template #headerTop>
            <div class="hd">
              <div class="item">
                <span>{{ statisticsData.total }}</span>
                <div>人数</div>
              </div>
              <div class="item">
                <span>{{ statisticsData.finish }}</span>
                <div>已体检人数</div>
              </div>
              <div class="item">
                <span>{{ statisticsData.rate }}</span>
                <div>体检比例</div>
              </div>
            </div>
          </template>
          <template #tableTitle>
            <a-button
              type="primary"
              v-auth="'occupationalHealth:checkup:batchdel'"
              preIcon="ant-design:export-outlined"
              @click="onExportXls"
              >导出</a-button
            >
          </template>
          <!--操作栏-->
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" />
          </template>
        </BasicTable>
      </a-tab-pane>
    </a-tabs>

    <DrawerView @register="registerDrawer" />
    <CheckInDrawer @register="registerDrawerDetail" />
  </div>
</template>

<script lang="ts" name="occupationalHealth-checkup" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import { useContent as checkInUseContent } from './hooks/checkInUseContent';
  import DrawerView from './drawer.vue';
  import CheckInDrawer from './checkInDrawer.vue';
  const {
    reload,
    onExportXls,
    registerTable,
    getTableAction,
    registerDrawer,
    statisticsData
  } = useContent();
  const tabActive = ref('1');
  const tabChange = () => {
    console.log(tabActive.value);
    if(tabActive.value == '1') {
      checkInReload();
    } else {
      reload();
    }
  }
  const {
    checkInReload,
    getTableActionCheckIn,
    onExportXlsCheckIn,
    registerTableCheckIn,
    statisticsDataCheckIn,
    registerDrawerDetail
  } = checkInUseContent();
</script>
<style lang="less" scoped>
  .p-1{
    padding: 10px;
    background-color: #ffffff;
  }
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
