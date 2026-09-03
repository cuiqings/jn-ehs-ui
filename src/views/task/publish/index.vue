<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'taskManagement:jn_publish:publish'">任务发布</a-button>
        <a-button preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'taskManagement:jn_publish:exportXls'"> 导出</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete" v-auth="'taskManagement:jn_publish:deleteBatch'">
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <PublishModal @register="registerModal" @success="publishSuccess" />
    <ApplyExtensionModal @register="registerExtensionModal" @success="applyExtensionSuccess" />
    <CloseTaskModal @register="registerCloseModal" @success="closeTaskSuccess" />
  </div>
</template>
  <script lang="ts" name="system-notice" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal, BasicModal } from '/@/components/Modal';
import PublishModal from './PublishModal.vue';
import ApplyExtensionModal from './ApplyExtensionModal.vue';
import CloseTaskModal from './CloseTaskModal.vue';
import { columns, searchFormSchema } from './publish.data';
import { getList, deleteRecord, batchDeleteRecord, getExportUrl } from './publish.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { dateFormat } from '/@/utils/common/compUtils';
const { createConfirm } = useMessage();
const [registerModal, { openModal }] = useModal();
  const [registerCloseModal, { openModal: openCloseModal }] = useModal();
const [registerExtensionModal, { closeModal, openModal: openExtensionModal }] = useModal();

// const queryParam = ref({});
let searchInfo = {};

// 列表页面公共参数、方法
const { tableContext, onExportXls, doRequest } = useListPage({
  designScope: 'publish-template',
  tableProps: {
    title: '任务发布列表',
    api: getList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
      // alwaysShowLines: 2,
    },
    handleSearchInfoFn(info) {
      console.log('handleSearchInfoFn', info);
      searchInfo = Object.assign({}, info);
      console.log('handleSearchInfoFn param', searchInfo);
      return searchInfo;
    },
    beforeFetch: (params) => {
      // params.column = 'updateTime';
      if (params.publishTime) {
        const publishTime = params.publishTime.split(',');
        params['publishTime_begin'] = publishTime[0];
        params['publishTime_end'] = publishTime[1];
        // delete params['publishTime'];
      }
      if (params.completeTimeLimit) {
        const completeTimeLimit = params.completeTimeLimit.split(',');
        params['completeTimeLimit_begin'] = completeTimeLimit[0];
        params['completeTimeLimit_end'] = completeTimeLimit[1];
        // delete params['completeTimeLimit'];
      }
      return params;
    },
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
    name: '任务发布-' + dateFormat(new Date(), 'yyyy-MM-dd'),
    url: getExportUrl,
  },
});

const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

/**
 * 新增事件-任务发布
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
    type: '0', // 任务发布
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
  doRequest(() => batchDeleteRecord({ ids: selectedRowKeys.value }));
}
/**
 * 查看
 */
function handleDetail(record) {
  openModal(true, {
    isUpdate: true,
    showFooter: false,
    record: record,
    type: '3', // 查看
  });
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: '关闭',
      onClick: handleEnd.bind(null, record),
      ifShow: record.status !== '3'&&record.status !== '2'&&record.ifPublishPeople=='1',
    },
    {
      label: '延期',
      onClick: handleExtension.bind(null, record),
      ifShow: record.status === '1' || record.status === '0'&&record.ifPublishPeople=='1',
      auth: 'taskManagement:jn_publish:delay',
    },

    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '删除',
      auth: 'taskManagement:jn_publish:delete',
      onClick: handleDelete.bind(null, record),
    },
  ];
}
// 申请延期
function handleExtension(record: any) {
  openExtensionModal(true, {
    isUpdate: false,
    record: record,
  });
}
// 关闭
function handleEnd(record: any) {
  console.log('handleEnd', record);
  openCloseModal(true, {
    isUpdate: false,
    record: record,
  });
}
function applyExtensionSuccess() {
  reload();
}
function closeTaskSuccess() {
  reload();
}
async function publishSuccess() {
  await reload();
}
</script>
  <style scoped lang="less">
.apc-main {
  text-align: center;
  display: flex;
  justify-content: space-around;
  padding: 80px 50px;
}
</style>