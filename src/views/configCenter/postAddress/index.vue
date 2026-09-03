<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">新增</a-button>
        <!-- <a-button preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'taskManagement:jn_publish:exportXls'"> 导出</a-button> -->
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete"> 批量删除</a-button>
      </template>
      <template #enableFlag="{ record }">
        <a-tag color="#f50" v-if="record.enableFlag == 0">停用</a-tag>
        <a-tag color="#87d068" v-if="record.enableFlag == 1">启用</a-tag>
      </template>
      <template #name="{ record }"></template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <PostModal @register="registerModal" @success="publishSuccess" />
  </div>
</template>
    <script lang="ts" name="post-address" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal, BasicModal } from '/@/components/Modal';
import PostModal from './PostModal.vue';
import { columns, searchFormSchema } from './post.data';
import { getList, deleteRecord, batchDeleteRecord } from './post.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { dateFormat } from '/@/utils/common/compUtils';
const { createConfirm } = useMessage();
const [registerModal, { openModal }] = useModal();

// const queryParam = ref({});
let searchInfo = {};

// 列表页面公共参数、方法
const { tableContext, doRequest } = useListPage({
  designScope: 'postAttribute-template',
  tableProps: {
    title: '任务发布列表',
    api: getList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
      // alwaysShowLines: 2,
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
});

const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

/**
 * 新增事件-任务发布
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
function handleEdit(record) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
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
      deleteRecord({ ids: record.id }, reload);
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