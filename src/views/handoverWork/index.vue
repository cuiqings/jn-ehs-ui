<template>
  <div class="p-1">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <!-- <a-button type="primary" v-auth="'handoverWork:export'" preIcon="ant-design:import-outlined" @click="onExportXls">导出</a-button> -->
      </template>
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'status'"> 
          <Tag v-if="text == 1" color="green">
            待交班
          </Tag>
          <Tag v-if="text == 2" color="green">
            待接班
          </Tag>
          <Tag v-if="text == 3" color="green">
            待签字
          </Tag>
          <Tag v-if="text == 4" color="green">
            已完成
          </Tag>
        </template>
        <template v-if="column.key == 'leadersUserName'">
          <a-image :height="35" :src="getFileAccessHttpUrl(text)" />
        </template>
       
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="safetyGoal-createGoal" setup>
import { BasicTable, TableAction } from '/@/components/Table';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { useContent } from './hooks/useContent';
import DrawerView from './drawer.vue';
import { Image } from 'ant-design-vue'
const AImage = Image;

const { 
  registerTable, getTableAction, registerDrawer, add, reload,
  rowSelection } = useContent();

const submitSuccess = () => {
  reload()
}
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
