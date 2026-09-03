<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'periodicCleanPlan:add'">新增</a-button>
        <a-button preIcon="ant-design:export-outlined" @click="onExportXls"  v-auth="'periodicCleanPlan:export'"> 导出</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete" v-auth="'periodicCleanPlan:del'"> 批量删除</a-button>
        <a-button preIcon="ant-design:play-circle-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleStart" v-auth="'periodicCleanPlan:startOrStop'"> 批量启用</a-button>
        <a-button preIcon="ant-design:pause-circle-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleStop" v-auth="'periodicCleanPlan:startOrStop'"> 批量停用</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <PlanModal @register="registerModal" @success="reload" />
    <StatusModal @register="registerStatus" @success="reload" />
    <BasicModal 
      v-bind="$attrs"
      @register="registerChange" 
      title="申请变更" 
      width="500px"
      :showOkBtn="false"
    >
      <div class="apc-main">
        <a-button type="primary" size="large" @click="handleApplyStatus">
          申请{{curRecord.isEnable === '1'?'停':'启'}}用
        </a-button>
        <a-button type="primary" size="large" @click="handleApplyChange">计划内容变更</a-button>
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="periodicClean-plan" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal,BasicModal } from '/@/components/Modal';
import PlanModal from './PlanModal.vue';
import StatusModal from './StatusModal.vue';
// import DetailModal from './DetailModal.vue';
import { columns, searchFormSchema } from './plan.data';
import { getList, deleteRecord, batchDeleteRecord, getExportUrl, enableBatch, deactivateBatch, getOrganizationNew} from './plan.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { dateFormat } from '/@/utils/common/compUtils';
const { createConfirm } = useMessage();
const [registerModal, { openModal }] = useModal();
const [registerStatus, { openModal: openStatusModal }] = useModal();
const [registerChange, { closeModal, openModal: openChangeModal }] = useModal();
// const queryParam = ref({});
let searchInfo = {};
let organizationCode = undefined

// 列表页面公共参数、方法
const { tableContext, onExportXls } = useListPage({
  designScope: 'periodic-template',
  tableProps: {
    title: '清理维护计划列表',
    api: getList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
      // alwaysShowLines: 2,
    },
    handleSearchInfoFn(info) {
      console.log('handleSearchInfoFn', info);
      if(organizationCode) {
        info.organizationCode = organizationCode
        const searchForm = getForm();
        searchForm.setFieldsValue({
          organizationCode: organizationCode
        });
      }
      searchInfo = Object.assign({}, info);
      console.log('handleSearchInfoFn param', searchInfo);
      return searchInfo;
    },
    immediate: false,
    showIndexColumn: true,
    actionColumn: {
      width: 220,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
  exportConfig: {
    name: '清理维护计划-' + dateFormat(new Date(),'yyyy-MM-dd'),
    url: getExportUrl,
  }
});

const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

const curRecord = ref<any>({})

async function getOrgList() {
  getOrganizationNew().then( async (res) => {
    const orgOptions = res.map((item:any) => {
      return {
        label: item.departName,
        value: item.orgCode
      }
    })
    const searchForm = await getForm();
    searchForm.updateSchema({
      field: 'organizationCode',
      componentProps: {
        options: orgOptions,
        placeholder: '请选择',
        disabled: orgOptions.length === 1,
      }
    })
    if(orgOptions.length === 1) {
      searchForm.setFieldsValue({
        organizationCode: orgOptions[0]?.value
      });
      organizationCode = orgOptions[0]?.value
    }
    reload()
 })
}
getOrgList()

/**
 * 新增事件
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
    type: '0' // 新增
  });
}
/**
 * 编辑事件
 */
function handleEdit(record) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    type: '1' // 编辑
  });
}
/**
 * 删除事件
 */
function handleDelete(record) {
  createConfirm({
    iconType: 'warning',
    title: '删除',
    content: '确定要删除吗？',
    onOk: () => {
      deleteRecord({ id: record.id }, reload);
    },
    onCancel() {},
  });
}
/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  // doRequest(() => batchDeleteRecord({ ids: selectedRowKeys.value }));
  createConfirm({
    iconType: 'warning',
    title: '删除',
    content: '确定要删除吗？',
    onOk: () => {
      batchDeleteRecord({ ids: selectedRowKeys.value }, reload);
    },
    onCancel() {},
  });
}
// 批量启用
async function batchHandleStart() {
  createConfirm({
    iconType: 'warning',
    title: '启用',
    content: '确定要启用吗？',
    onOk: () => {
      enableBatch({ ids: selectedRowKeys.value }, reload);
    },
    onCancel() {},
  });
}
// 批量停用
async function batchHandleStop() {
  createConfirm({
    iconType: 'warning',
    title: '停用',
    content: '确定要停用吗？',
    onOk: () => {
      deactivateBatch({ ids: selectedRowKeys.value }, reload);
    },
    onCancel() {},
  });
}

/**
 * 查看
 */
function handleDetail(record) {
  openModal(true, {
    isUpdate: true,
    showFooter: false,
    record: record,
    type: '3' // 查看
  });
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
      ifShow: record.planStatus !== '1',
      auth: 'periodicCleanPlan:edit'
    },
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '申请变更',
      onClick: handleChange.bind(null, record),
      ifShow: record.planStatus === '1' && record.changeStatus !== '0',
      auth: 'periodicCleanPlan:change'
    },
    {
      label: '删除',
      onClick: handleDelete.bind(null, record),
      ifShow: record.planStatus !== '1',
      auth: 'periodicCleanPlan:del'
      // popConfirm: {
      //   title: '是否确认删除',
      //   confirm: handleDelete.bind(null, record),
      // },
    },
  ];
}
// 申请变更
function handleChange(record:any) {
  curRecord.value = record
  openChangeModal(true, {});
}
// 申请停用
function handleApplyStatus(){
  openStatusModal(true, {
    record: curRecord.value,
    type: '1' // 申请启用
  });
  closeModal()
}
// 计划内容变更
function handleApplyChange(){
  openModal(true, {
    record: curRecord.value,
    isUpdate: true,
    showFooter: true,
    type: '2' // 申请变更
  });
  closeModal()
}
// 导出
// function handleExcel() {
  
// }

</script>
<style scoped lang="less">
  .apc-main{
    text-align: center;
    display: flex;
    justify-content: space-around;
    padding: 80px 50px;
  }
</style>