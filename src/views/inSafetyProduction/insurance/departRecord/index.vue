<template>
  <div class="p-1">
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div style="width: 100%">
          <div class="header" v-loading="hdloading">
            <div class="head-inner">
              <div class="main">
                <div class="item">
                  <div class="name" style="color: #1890ff">{{ statisticsList.monthlyNewCount }}</div
                  >本月预计新增
                </div>
                <div class="item-start"></div>
                <div class="item">
                  <div class="name" style="color: #1890ff">{{ statisticsList.monthlyReduceCount }}</div
                  >本月预计减员
                </div>
              </div>
            </div>
          </div>
          <a-space :size="20">
            <a-button type="primary" v-auth="'insurance:departRecord:add'" preIcon="ant-design:plus-outlined" @click="add">新增</a-button>
            <a-button
              type="primary"
              v-auth="'insurance:departRecord:betchcheck'"
              v-if="selectedRowKeys.length > 0"
              preIcon="ant-design:delete-outlined"
              @click="betchCheck"
              >批量删除</a-button
            ><DeleteOutlined />
          </a-space>
        </div>
      </template>
      <template #insuranceType="{ record }">
        <a-tag color="green" v-if="record.insuranceType == 1">正常参保</a-tag>
        <a-tag color="blue" v-if="record.insuranceType == 2">灵活用工</a-tag>
      </template>
      <template #changeType="{ record }">
        <span v-if="!record.changeType">-</span>
        <a-tag color="green" v-if="record.changeType == 1">新增</a-tag>
        <a-tag color="red" v-if="record.changeType == 2">减员</a-tag>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <DetailModal @register="registerModal" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="inSafetyProduction-insurance-departRecord" setup>
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { useContent } from './hooks/useContent';
  import { unitStatistics } from '../api';
  import DetailModal from './detailModal.vue';
  import { message } from 'ant-design-vue';
  import { onMounted, ref } from 'vue';

  const hdloading = ref(false);
  const departList = ref<any[]>([]);
  const orgCode = ref(undefined);

  const {
    registerTable,
    getTableAction,
    add,
    registerModal,
    handleBatchDel,
    getSelectRows,
    init,
    statisticsList,
    selectedRowKeys,
  } = useContent();
  onMounted(async () => {
    init();
  });

  const submitSuccess = () => {
    init();
  };

  const betchCheck = () => {
    let data = getSelectRows();
    if (data.length == 0) {
      message.warning('请选择要检验的记录');
      return;
    }
    handleBatchDel(data);
  };

  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('应急物资导入模板', '/emergencySupplies/downloadTemplate', params);
  }
</script>
<style lang="less" scoped>
  .header {
    height: 128px;
    padding: 10px 0;

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
          flex: 1;
          text-align: center;
          font-size: 16px;
          .name {
            font-size: 28px;
            font-weight: 600;
          }
        }

        .item-start {
          height: 60%;
          border-left: 1px solid #dcdcdc;
        }
      }
    }
  }
</style>
