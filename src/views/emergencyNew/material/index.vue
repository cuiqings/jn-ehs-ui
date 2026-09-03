<template>
  <div class="p-1">
    <div class="header" v-loading="hdloading">
      <div class="head-inner">
        <div class="search">
          所属单位：<a-select :allowClear="departList.length > 1" style="width: 220px;" v-model:value="orgCode" :options="departList" @change="orgChange" placeholder="请选择"
            :fieldNames="{ label: 'departName', value: 'orgCode' }"></a-select>
        </div>
        <div class="main">
          <div class="item"><div class="name">{{ statisticsList.total }}</div>总数</div>
          <div class="item"><div class="name" style="color: #52c41a;">{{ statisticsList.normal }}</div>正常</div>
          <div class="item"><div class="name" style="color: #ff4d4f;">{{ statisticsList.overtime }}</div>过期</div>
          <div class="item item-start"></div>
          <div class="item" v-for="(item, idx) in statisticsList.items"><div class="name">{{ item.number }}</div>{{ item.name }}</div>
        </div>
      </div>
    </div>
    <!--定义表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" v-auth="'emergencyNew:material:add'" preIcon="ant-design:plus-outlined" @click="add">新增</a-button>
        <j-upload-button type="primary" v-auth="'emergencyNew:material:import'" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
        <a-button type="primary" v-auth="'emergencyNew:material:export'" preIcon="ant-design:export-outlined" @click="onExportXls">导出</a-button>
        <a-button type="primary" v-auth="'emergencyNew:material:exportmodal'" preIcon="ant-design:download-outlined" @click="onExportTemplateXls">导入模板下载</a-button>
        <a-button type="primary" v-auth="'emergencyNew:material:betchcheck'" preIcon="ant-design:check-square-outlined" @click="betchCheck">批量检验</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <DrawerView @register="registerDrawer" @submitSuccess="submitSuccess" />
    <CheckModal @register="registerCheckModal" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="emergency-material" setup>
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { BasicTable, TableAction } from '/@/components/Table';
import { useMethods } from '/@/hooks/system/useMethods';
import { useContent } from './hooks/useContent';
import { suppliesStatistics } from '../api'
import CheckModal from './checkModal.vue';
import { message } from 'ant-design-vue';
import DrawerView from './drawer.vue'
import { onMounted, ref } from 'vue';

const hdloading = ref(false);
const departList = ref<any[]>([]);
const statisticsList = ref<any>({});
const orgCode = ref(undefined);

const { 
  registerTable, getTableAction, add, 
  registerDrawer, registerCheckModal, 
  openModal, getSelectRows, init, 
  onExportXls, onImportXls, updateCode,
  rowSelection, getForm } = useContent();
const formInstence = ref<any>(null);
onMounted(async () => {
  formInstence.value = getForm();
  let orgList = await getDepart3ListWithSecurity();
  departList.value = orgList;
  if(orgList.length == 1) {
    orgCode.value = orgList[0].orgCode;
    formInstence.value.setFieldsValue({
      orgCode: orgCode.value
    });
    updateCode(orgCode.value)
  }
  let res = await selectDeptNew({orgCode: orgCode.value})
  formInstence.value.updateSchema({
    field: 'workshop',
    componentProps: {
      options: res,
      fieldNames: {
        label: 'departName',
        value: 'orgCode',
      },
    }
  })
  getStatistics(orgCode.value);
  init(orgCode.value);
});

const getStatistics = async (code=0) => {
  hdloading.value = true;
  statisticsList.value = await suppliesStatistics(code).catch(_ => hdloading.value = false)
  hdloading.value = false;
};

const orgChange = (value) => {
  getStatistics(value);
  init(orgCode.value);
};

const submitSuccess = () => {
  init(orgCode.value);
}

const betchCheck = () => {
  let data = getSelectRows();
  console.log(data);
  if(data.length == 0) {
    message.warning('请选择要检验的记录');
    return;
  }
  openModal(true, {count: 1, title: '批量检验', data});
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
