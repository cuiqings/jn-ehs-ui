<template>
  <div class="p-1">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" v-auth="'occupationalHealth:taboo:add'" preIcon="ant-design:plus-outlined"
          @click="add">新增</a-button>
        <a-button type="primary" v-show="selectedRowKeys.length > 0" v-auth="'occupationalHealth:taboo:batchdel'" preIcon="ant-design:export-outlined"
          @click="batchDel">批量删除</a-button>
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'occupationalHealth:taboo:import'"
          @click="onImportXls">导入</j-upload-button>
        <a-button type="primary" v-auth="'occupationalHealth:taboo:export'" preIcon="ant-design:export-outlined"
          @click="onExportXls">导出</a-button>
        <a-button type="primary" v-auth="'occupationalHealth:taboo:temp'" preIcon="ant-design:download-outlined"
          @click="onExportTemplateXls">导入模板下载</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #status="{ record }">{{ record.status == 1 ? '完成' : '待危害因素检测' }}</template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submitSuccess="submitSuccess" />
    <CheckInDrawer @register="registerCheckIn" @submitSuccess="submitSuccess" />
    <CheckModal @register="registerCheckModal" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="occupationalHealth-taboo" setup>
import { BasicTable, TableAction } from '/@/components/Table';
import { useMethods } from '/@/hooks/system/useMethods';
import CheckInDrawer from './checkInDrawer.vue';
import { useContent } from './hooks/useContent';
import CheckModal from './checkModal.vue';
import DrawerView from './drawer.vue'

const {
  registerTable, getTableAction, add,
  registerDrawer, registerCheckModal,
  selectedRowKeys, batchDel,
  reload, onExportXls, onImportXls, registerCheckIn,
  rowSelection } = useContent();

const submitSuccess = () => {
  reload()
}


//导入模版下载
function onExportTemplateXls() {
  const { handleExportXls } = useMethods();
  let params = {};
  handleExportXls('职业禁忌症', '/contraindications/importTemplate', params);
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