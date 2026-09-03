<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
<!--        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增-->
<!--        </a-button>-->
        <a-button v-if="hasPermission('eia:baxx')" type="primary" @click="handleBaxx" preIcon=""> 备案信息
        </a-button>
        <a-button v-if="hasPermission('eia:htxx')" type="primary" @click="handleHtxx" preIcon=""> 合同信息
        </a-button>
        <a-button v-if="hasPermission('eia:hptz')" type="primary" @click="handleHptz" preIcon=""> 环评提资
        </a-button>
        <a-button v-if="hasPermission('eia:pwxk')" type="primary" @click="handlePwxk" preIcon=""> 申请排污许可
        </a-button>
        <a-button v-if="hasPermission('eia:sqys')" type="primary" @click="handleSqys" preIcon=""> 申请验收
        </a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('eia:del')" key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-if="hasPermission('eia:del')">批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"/>
      </template>
      <!--字段回显插槽-->
      <template #htmlSlot="{text}">
        <div v-html="text"></div>
      </template>
      <!--省市区字段回显插槽-->
      <template #pcaSlot="{text}">
        {{ getAreaTextByCode(text) }}
      </template>
      <template #fileSlot="{text}">
        <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined"
                  size="small" @click="downloadFile(text)">下载
        </a-button>
      </template>
    </BasicTable>
    <a-modal v-model:visible="visibleClose" title="关闭"  @ok="closeSubmit">
      <a-row>
        <div style="margin-left: 10px">
          <span style="color: red;">*</span><span>关闭原因：</span>
          <a-form-item label="" style="width:500px;">
            <a-textarea :maxlength="300" :rows="5" showCount="true" v-model:value="reason" placeholder="请输入关闭原因"/>
          </a-form-item>
        </div>
      </a-row>
    </a-modal>
    <!-- 表单区域 -->
    <EhsEiaInfoModal @register="registerModal" @success="handleSuccess"></EhsEiaInfoModal>
    <EhsEiaInfoApplyModal @register="registerApplyModal" @success="handleSuccess"></EhsEiaInfoApplyModal>
    <EhsEiaInfoDetailModal @register="registerDetailModal" @success="handleSuccess"></EhsEiaInfoDetailModal>
  </div>
</template>

<script lang="ts" name="eia-ehsEiaInfo" setup>
import {ref, computed, unref} from 'vue';
import {BasicTable, useTable, TableAction} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import EhsEiaInfoModal from './components/EhsEiaInfoModal.vue'
import EhsEiaInfoApplyModal from './components/EhsEiaInfoApplyModal.vue'
import EhsEiaInfoDetailModal from './components/EhsEiaInfoDetailModal.vue'
import {columns, searchFormSchema} from './EhsEiaInfo.data';
import {list, deleteOne, batchDelete, getImportUrl, getExportUrl, operate} from './EhsEiaInfo.api';
import {downloadFile} from '/@/utils/common/renderUtils';
import {useMessage} from "/@/hooks/web/useMessage";
import {usePermission} from "/@/hooks/web/usePermission";
import {useRouter} from "vue-router";
const router = useRouter();
const { currentRoute } = router;

const { hasPermission } = usePermission();
let searchInfo = {};
const checkedKeys = ref<Array<string | number>>([]);
//注册model
const [registerModal, {openModal}] = useModal();
const [registerApplyModal, {openModal: openApplyModal}] = useModal();
const [registerDetailModal, {openModal: openDetailModal}] = useModal();
const { createMessage, createConfirm, createSuccessModal, createInfoModal, createErrorModal, createWarningModal, notification } = useMessage();
const { info, success, warning, error } = createMessage;
const visibleClose = ref<boolean>(false);
const id = ref<string>("");
const reason = ref<string>("");


//注册table数据
const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    title: 'ehs_eia_info',
    api: list,
    columns,
    canResize: false,
    showIndexColumn: true,
    beforeFetch: (params) => {
      if(currentRoute.value.query.id){
        params['id'] = currentRoute.value.query.id;
      }
      return params;
    },
    handleSearchInfoFn(info) {
      // console.log('handleSearchInfoFn', info);
      searchInfo = Object.assign({}, info);
      if (info.startDt1) {
        // console.log('startDt1', info.startDt, info.startDt.split(','));
        let time = info.startDt1.split(',');
        searchInfo['startTimeS'] = time[0];
        searchInfo['endTimeS'] = time[1];
        delete searchInfo['startDt1'];
      }
      if (info.endDt1) {
        // console.log('endDt1', info.endDt, info.endDt1.split(','));
        let time = info.endDt1.split(',');
        searchInfo['startTimeE'] = time[0];
        searchInfo['endTimeE'] = time[1];
        delete searchInfo['endDt1'];
      }

      // console.log('handleSearchInfoFn param', searchInfo);
      return searchInfo;
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
      width: 190,
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
})

const [registerTable, {reload}, {rowSelection, selectedRowKeys,selectedRows}] = tableContext

/**
 * 新增事件
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}

/**
 * 编辑事件
 */
function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
}

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
 * 删除事件
 */
async function handleDelete(record) {
  createConfirm({
    iconType: 'warning',
    title: '删除',
    content: '确定要删除吗？',
    onOk: () => {
      deleteOne({id: record.id}, handleSuccess);
    },
    onCancel() {},
  });
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
      ifShow: () => hasPermission('eia:detail'),
    },
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
      ifShow: () => hasPermission('eia:edit'),
    },
    {
      label: '关闭',
      onClick: handleClose.bind(null, record),
      ifShow: () => {
        return (record.status === '1' || record.status === '2') && hasPermission('eia:close');
      },
    },
    {
      label: '删除',
      onClick: handleDelete.bind(null, record),
      ifShow: () => {
        return record.status === '0' && hasPermission('eia:del');
      },
    }
  ]
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
      ifShow: () => hasPermission('eia:edit'),
    },
    {
      label: '关闭',
      // popConfirm: {
      //   title: '是否确认关闭',
      //   confirm: handleClose.bind(null, record),
      // }
      onClick: handleClose.bind(null, record),
      ifShow: () => hasPermission('eia:close'),
    },
    {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
      },
      ifShow: () => hasPermission('eia:del'),
    }
  ]
}

function handleClose(record: Recordable) {
  visibleClose.value = true;
  reason.value = "";
  id.value = record.id;
}

function closeSubmit() {
  if(reason.value.length<=0){
    createInfoModal({ title: '提示', content: '请填写关闭原因！' });
    return;
  }
  operate({
    id: id.value,
    eiaType: '0',
    closeReason:reason.value,
  },handleSuccess);
  visibleClose.value = false;
}



function handleBaxx(record: Recordable) {
  if(selectedRowKeys.value.length<=0){
    createInfoModal({ title: '提示', content: '请选择项目！' });
    return;
  }

  for(let i=0;i<selectedRows.value.length;i++){
    if(!(selectedRows.value[i].status=="1"||selectedRows.value[i].status=="2"||selectedRows.value[i].status=="4")){
      createInfoModal({ title: '提示', content: '所选项目不符合要求！' });
      return;
    }
  }

  record.eiaType = '1';
  record.ids = selectedRowKeys.value;
  openApplyModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    item: selectedRows.value,
  });
}

function handleHtxx(record: Recordable) {
  if(selectedRowKeys.value.length<=0){
    createInfoModal({ title: '提示', content: '请选择项目！' });
    return;
  }
  for(let i=0;i<selectedRows.value.length;i++){
    if(!(selectedRows.value[i].status=="0"
      ||selectedRows.value[i].status=="1"
      ||selectedRows.value[i].status=="2"
      ||selectedRows.value[i].status=="3")){
      createInfoModal({ title: '提示', content: '所选项目不符合要求！' });
      return;
    }
  }
  record.eiaType = '2';
  record.ids = selectedRowKeys.value;
  openApplyModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    item: selectedRows.value,
  });
}

function handleHptz(record: Recordable) {
  if(selectedRowKeys.value.length<=0){
    createInfoModal({ title: '提示', content: '请选择项目！' });
    return;
  }
  for(let i=0;i<selectedRows.value.length;i++){
    if(selectedRows.value[i].orgCode==""||selectedRows.value[i].orgCode==null){
      createInfoModal({ title: '提示', content: '请添加所属机构：'+ selectedRows.value[i].projectName});
      return;
    }
    if(!(selectedRows.value[i].status=="0"
      ||selectedRows.value[i].status=="1"
      ||selectedRows.value[i].status=="2"
      ||selectedRows.value[i].status=="3"
      ||selectedRows.value[i].status=="4")){
      createInfoModal({ title: '提示', content: '所选项目不符合要求！' });
      return;
    }
  }
  record.eiaType = '3';
  record.ids = selectedRowKeys.value;
  openApplyModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    item: selectedRows.value,
  });
}

function handlePwxk(record: Recordable) {
  if(selectedRowKeys.value.length<=0){
    createInfoModal({ title: '提示', content: '请选择项目！' });
    return;
  }
  let applyId = selectedRows.value[0].applyId;
  for(let i=0;i<selectedRows.value.length;i++){
    if(selectedRows.value[i].status!="6"){
      createInfoModal({ title: '提示', content: '所选项目不符合要求！' });
      return;
    }
    if(selectedRows.value[i].pollutionDischargeStatus=="2"){
      createInfoModal({ title: '提示', content: '所选项目不符合要求！' });
      return;
    }
    if(selectedRows.value[i].applyId!=applyId){
      createInfoModal({ title: '提示', content: '所选项目存在不同的批次，请检查！' });
      return;
    }
  }
  record.eiaType = '4';
  record.ids = selectedRowKeys.value;
  openApplyModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    item: selectedRows.value,
  });
}

function handleSqys(record: Recordable) {
  if(selectedRowKeys.value.length<=0){
    createInfoModal({ title: '提示', content: '请选择项目！' });
    return;
  }
  let applyId = selectedRows.value[0].applyId;
  for(let i=0;i<selectedRows.value.length;i++){
    if(selectedRows.value[i].pollutionDischargeStatus!="2"){
      createInfoModal({ title: '提示', content: '所选项目不符合要求！' });
      return;
    }
    if(selectedRows.value[i].applyId!=applyId){
      createInfoModal({ title: '提示', content: '所选项目存在不同的批次，请检查！' });
      return;
    }
  }
  record.eiaType = '5';
  record.ids = selectedRowKeys.value;
  openApplyModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    item: selectedRows.value,
  });
}

</script>

<style scoped>

</style>
