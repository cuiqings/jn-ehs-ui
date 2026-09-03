<template>
  <div class="p-1">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" v-auth="'highRiskLedger:remind:add'" preIcon="ant-design:plus-outlined" @click="add">新增</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #frequency="{ record }">每 {{ record.frequency }} 小时一次</template>
      <template #upgrade="{ record }">{{ record.upgrade == 1 ? '是' : '否' }}</template>
    </BasicTable>
    <CheckModal @register="registerCheckModal" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="occupationalHealth-files" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import CheckModal from './checkModal.vue';
  const {
    registerTable,
    getTableAction,
    add,
    registerCheckModal,
    reload
  } = useContent();

  const submitSuccess = () => {
    reload();
  };

</script>
<style lang="less" scoped>
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
    .item:nth-child(2),
    .item:nth-child(3) {
      color: #15803d;
    }
  }
</style>
