<template>
  <div class="p-1">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" v-auth="'insurance:declaration:report'" preIcon="ant-design:plus-outlined" @click="add">上报</a-button>
        <a-button v-auth="'insurance:declaration:importbtn'" class="btn-template" @click="openModal">维护模板</a-button>
        <a-button
          :loading="downloading"
          v-show="selectedRowKeys.length > 0"
          v-auth="'insurance:declaration:download'"
          class="btn-template"
          @click="downloadFn"
          >批量下载</a-button
        >
      </template>
      <template #status="{ record }">
        <a-tag color="orange" v-if="record.status == 1">待审核</a-tag>
        <a-tag color="blue" v-if="record.status == 2">已上报</a-tag>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <TempModal @register="register" @submitSuccess="submitSuccess" />
    <CheckModal @register="registerCheckModal" @submitSuccess="submitSuccess" />
    <Drawer @register="registerDrawer" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="occupationalHealth-files" setup>
  import { downloadFileAll } from '/@/api/common/api';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useContent } from './hooks/useContent';
  import CheckModal from './components/checkModal.vue';
  import Drawer from './drawer.vue';
  import TempModal from './components/tempModal.vue';
  import { useModal } from '/@/components/Modal';
  import { ref } from 'vue';

  const [register, { openModal }] = useModal();

  const { registerTable, getTableAction, registerCheckModal, reload, registerDrawer, openDrawer, rowSelection, selectedRowKeys } = useContent();

  const submitSuccess = () => {
    reload();
  };

  const add = () => {
    console.log(selectedRowKeys.value);
    openDrawer(true, { title: '上报' });
  };
  const downloading = ref(false);
  const downloadFn = () => {
    console.log(selectedRowKeys);
    downloading.value = true;
    downloadFileAll('/declare/download', '增减申报.zip', { ids: selectedRowKeys.value.join(',') });
    setTimeout(() => {
      downloading.value = false;
    }, 2000);
  };
</script>
<style lang="less" scoped>
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
