<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'device:list:add'" @click="handleAdd">新增</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'device:list:export'"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" v-auth="'device:list:import'" @click="onImportXls"> 导入 </j-upload-button>
      <a-button type="primary" v-auth="'device:list:download'"> <a target="blank" :href="downloadUrl" download style="color: #fff">下载导入模版</a></a-button>
      <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" v-auth="'device:list:deleteBatch'" @click="batchHandleDelete">
        批量删除</a-button
      >
    </template>
    <template #status="{ text, record }">
      <a-tag color="#999" v-if="text == 0">离线</a-tag>
      <a-tag color="#87d068" v-if="text == 1">正常</a-tag>
      <a-tag color="#f50" v-if="text == 2">报警</a-tag>
    </template>
    <template #enableFlag="{ text, record }">
      <a-tag color="#f50" v-if="text == 0">停用</a-tag>
      <a-tag color="#87d068" v-if="text == 1">启用</a-tag>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getActions(record)" />
    </template>
  </BasicTable>
  <DeviceModal @register="registerModal" @success="reload" />
</template>
    <script lang="ts" name="device-list" setup>
import { ref } from 'vue';
import type { Dayjs } from 'dayjs';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { columns, searchFormSchema } from './list.data';
import DeviceModal from './DeviceModal.vue';
import { getList, deleteRecord, batchDeleteRecord, getExportUrl, getImportUrl } from './list.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
const { createConfirm } = useMessage();
import { downloadFileAll, getOrgCodeList, getDepartmentList } from '/@/api/common/api';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { useMethods } from '/@/hooks/system/useMethods';
import { dateFormat } from '/@/utils/common/compUtils';
const downloadUrl = getFileAccessHttpUrl('excel_template/设备列表导入模版.xlsx');
const [registerModal, { openModal }] = useModal();
const checkedKeys = ref<Array<string | number>>([]);
// 列表页面公共参数、方法
const { tableContext, onExportXls, onImportXls, doRequest } = useListPage({
  tableProps: {
    title: '设备列表',
    api: getList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
    },
    showIndexColumn: true,
    rowKey: 'id',
    clickToRowSelect: false,
    actionColumn: {
      width: 200,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
  // 导出配置-导出接口地址
  exportConfig: {
    name: '设备列表-' + dateFormat(new Date(), 'yyyy-MM-dd'),
    url: getExportUrl,
  },
  // 导入配置-导入接口地址
  importConfig: {
    url: getImportUrl,
  },
});
const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
/**
 * 新增事件
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
    title: '新增',
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
    title: '编辑',
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
 * 选择事件
 */
function onSelectChange(selectedRowKeys: (string | number)[]) {
  console.log('selectedRowKeys------>', selectedRowKeys);
  checkedKeys.value = selectedRowKeys;
}
/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDeleteRecord({ ids: selectedRowKeys.value }, reload);
}
/**
 * 查看
 */
function handleDetail(record) {
  openModal(true, {
    isUpdate: true,
    showFooter: false,
    record: record,
    title: '查看',
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
      auth: ['device:list:edit'],
    },
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '删除',
      onClick: handleDelete.bind(null, record),
      auth: ['device:list:delete'],
    },
  ];
}
</script>
<style lang="less" scoped>
.jeecg-basic-table-form-container {
  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }
}
</style>