<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"/>
<!--                     :dropDownActions="getDropDownAction(record)"-->
      </template>
      <!--   环评报告   -->
      <template #eiaEndAttachIdPath="{ record }">
        <span v-if="record.eiaEndAttachId" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.eiaEndAttachId)">{{
          record.eiaEndAttachFileName
        }}</span>
      </template>
      <!--   排污许可证   -->
      <template #pollutionDischargeAttachPath="{ record }">
        <span v-if="record.pollutionDischargeAttach" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.pollutionDischargeAttach)">{{
          record.pollutionDischargeAttachName
        }}</span>
      </template>
      <!--   验收报告   -->
      <template #acceptanceEndAttachIdPath="{ record }">
        <span v-if="record.acceptanceEndAttachId" style="color: #0091ff; cursor: pointer" @click="handlePreview(record.acceptanceEndAttachId)">{{
          record.acceptanceEndAttachName
        }}</span>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
<!--    <EhsEiaInfoModal @register="registerModal" @success="handleSuccess"></EhsEiaInfoModal>-->
    <EhsEiaSeachDetailModal @register="registerDetailModal" @success="handleSuccess"></EhsEiaSeachDetailModal>
  </div>
</template>

<script lang="ts" name="eia-ehsEiaInfo" setup>
import {ref, computed, unref} from 'vue';
import {BasicTable, useTable, TableAction} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import EhsEiaSeachDetailModal from './components/EhsEiaSeachDetailModal.vue'
import {columns, searchFormSchema} from './EhsEiaSeach.data';
import {list, deleteOne, batchDelete, getImportUrl, getExportUrl, operate} from './EhsEiaSeach.api';
import {downloadFile} from '/@/utils/common/renderUtils';
import {useMessage} from "/@/hooks/web/useMessage";
import {picPreviewUrl, previewFile} from "/@/api/common/api";

let searchInfo = {};
const checkedKeys = ref<Array<string | number>>([]);
//注册model
const [registerDetailModal, {openModal: openDetailModal}] = useModal();
const { createMessage, createConfirm, createSuccessModal, createInfoModal, createErrorModal, createWarningModal, notification } = useMessage();
const { info, success, warning, error } = createMessage;

//注册table数据
const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    api: list,
    columns,
    canResize: false,
    showIndexColumn: true,
    handleSearchInfoFn(info) {
      console.log('handleSearchInfoFn', info);
      searchInfo = Object.assign({}, info);

      if(info.orgCode!=undefined&&info.orgCode.indexOf("~|~")!=-1){
        var orgInfoArry = info.orgCode.split("~|~");
        searchInfo['orgCode'] = orgInfoArry[0];
      }
      console.log('handleSearchInfoFn param', searchInfo);
      return searchInfo;
    },
    afterFetch(result){
      result.forEach(e=>{
        // let saveName = e.eiaEndAttachId.split('/').slice(-1)[0] .substr(0,e.eiaEndAttachId.lastIndexOf('.'));
        // let realPreName = saveName.substr(0,saveName.length-20);
        // let realSufName = '.' + e.eiaEndAttachId.split('.').slice(-1)[0];
        let reg = /_\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}_\d{1,2}\1\d{1,2}\1\d{1,2}/g;
        e.eiaEndAttachFileName = e.eiaEndAttachId == null ? '' : e.eiaEndAttachId.replace(reg,'').split('/').slice(-1)[0];
        e.pollutionDischargeAttachName = e.pollutionDischargeAttach == null ? '' : e.pollutionDischargeAttach.replace(reg,'').split('/').slice(-1)[0];
        e.acceptanceEndAttachName = e.acceptanceEndAttachId == null ? '' : e.acceptanceEndAttachId.replace(reg,'').split('/').slice(-1)[0];
      });
      return result;
    },
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 120,
      fixed: 'right'
    },
  },
  exportConfig: {
    name: "ehs_eia_info",
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
});

const [registerTable, {reload}, {rowSelection, selectedRowKeys,selectedRows}] = tableContext;

/**
 * 详情
 */
function handleDetail(record: Recordable) {
  openDetailModal(true, {
    record,
    isUpdate: true,
    showFooter: false,
  });
}

/**
 * 预览
 */
function handlePreview(filePathParam) {
  if (filePathParam) {
    previewFile(filePathParam).then((res) => {
      window.open(res, '_blank');
    });
  }
}

/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteOne({id: record.id}, handleSuccess);
}

/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}

/**
 * 成功回调
 */
function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

/**
 * 操作栏
 */
function getTableAction(record) {
  return [
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
  ]
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return [
    {
      label: '关闭',
      popConfirm: {
        title: '是否确认关闭',
        confirm: handleClose.bind(null, record),
      }
    },
    {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
      }
    }
  ]
}

function handleClose(record: Recordable) {
  operate({
    id: record.id,
    eiaType: '0',
  },handleSuccess);
}

</script>

<style scoped>

</style>
