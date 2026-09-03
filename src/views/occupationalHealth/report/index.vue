<template>
  <div class="p-1">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" v-auth="'occupationalHealth:report:add'" preIcon="ant-design:plus-outlined" @click="add">新增</a-button>
      </template>
      <template #fileUrl="{ record }"><span style="color: #1890ff;" @click="handlePreview(record.fileUrl)">{{ record.fileUrl }}</span></template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="occupationalHealth-report" setup>
import {picPreviewUrl, previewFile} from "/@/api/common/api";
import { BasicTable, TableAction } from '/@/components/Table';
import { useContent } from './hooks/useContent';
import DrawerView from './drawer.vue';

const { 
  registerTable, getTableAction, registerDrawer, add, reload,
  rowSelection } = useContent();

const submitSuccess = () => {
  reload()
}
const handlePreview = async (file) => {
    previewFile(file).then((res) => {
      window.open(res, '_blank');
    });
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
    .search{
      padding: 10px 16px;
    }
    background-color: #ffffff;
    .main{
      flex: 1;
      background-color: #eef8fe;
      display: flex;
      align-items: center;
      justify-content: space-around;
      .item{
        text-align: center;
        font-size: 18px;
        font-weight: 600;
      }
      .item-start{
        height: 60%;
        border-left: 1px solid #dcdcdc;
      }
    }
  }
}
</style>