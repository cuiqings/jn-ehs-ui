<template>
  <div class="p-1">
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div class="title">
          <div class="hd-left">
            <h3>{{curM}}月份工伤保险申报信息明细</h3>
            <a-date-picker :allowClear="false" style="width: 180px;" :disabled-date="disabledDate" placeholder="请选择" v-model:value="curM" @change="changeMonth" valueFormat="YYYY-MM" format="YYYY-MM"
              picker="month" />
              <span style="color: red;padding-left: 16px;" v-show="missingNum > 0">信息缺失：{{missingNum}}人</span>
              <span style="padding-left: 16px">参保单位：</span>
              <a-select @change="changeDept" v-model:value="departName" placeholder="请选择" style="width: 220px" :options="dList"></a-select>
          </div>
          <a-space :size="20">
            <a-button type="primary" v-auth="'insurance:declarationRecord:import'" preIcon="ant-design:export-outlined" @click="onImportXlsClick">导入</a-button>
<!--            <j-upload-button type="primary" v-auth="'insurance:declarationRecord:import'" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>-->
            <!-- <a-button type="primary" v-auth="'insurance:declarationRecord:temp'" preIcon="ant-design:export-outlined" @click="onExportTemplateXls">导入模板下载</a-button> -->
          </a-space>
        </div>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
          <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <AddForm @register="registerModal" @submitSuccess="reload" />
    <TempModal @register="register" @submitSuccess="submitSuccess" />
  </div>
</template>

<script lang="ts" name="inSafetyProduction-insurance-departRecord" setup>
import { BasicTable, TableAction } from '/@/components/Table';
import { useContent } from './hooks/useContent';
import { useModal } from '/@/components/Modal';
import { missingInfo } from '../api';
import AddForm from './components/addModal.vue';
import { ref } from 'vue';
import TempModal from "./components/tempModal.vue";

const dList = [
  {value: '敬业钢铁有限公司', label: '敬业钢铁有限公司'},
  {value: '河北敬业宽板科技有限公司', label: '河北敬业宽板科技有限公司'},
  {value: '平山县洁创环保科技有限公司', label: '平山县洁创环保科技有限公司'},
  {value: '河北敬业高品钢科技有限公司', label: '河北敬业高品钢科技有限公司'}
]
const changeMonth = (value: string) => {
  reload()
  pageInit(value)
}
const changeDept = (value: string) => {
  reload()
}
const missingNum = ref<number>(0);
const pageInit = (value: string) => {
  missingInfo({month: value}).then((res) => {
    missingNum.value = res;
  });
}
const { registerTable, disabledDate, registerModal, reload, onImportXls, curM, departName, getTableAction } = useContent(pageInit);
pageInit(curM.value)

const [register, { openModal }] = useModal();
const onImportXlsClick = () => {
  openModal(true);
}


</script>
<style scoped lang="less"> 
.title{
  width: 100%;
  display: flex;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  .hd-left{
    display: flex;
    align-items: center;
  }
  h3{
    margin: 0;
    padding: 0;
    font-weight: 600;
    font-size: 16px;
    margin-right: 16px;
  }
}
</style>
