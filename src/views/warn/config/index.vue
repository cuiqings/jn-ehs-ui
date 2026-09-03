<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls"> 导入 </j-upload-button>
        <a-button type="primary"> <a :href="download" download style="color: #fff">下载导入模版</a></a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete"> 批量删除</a-button>
      </template>
      <template #warnStartStop="{ record }">
        <a-tag color="#f50" v-if="record.warnStartStop == 1">停用</a-tag>
        <a-tag color="#87d068" v-else>启用</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <ConfigModal @register="registerDrawer" @success="publishSuccess" />
  </div>
</template>
    <script lang="ts" name="warn-config" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useDrawer } from '/@/components/Drawer';
import ConfigModal from './ConfigModal.vue';
import { columns, searchFormSchema } from './config.data';
import { getList, deleteRecord, batchDeleteRecord, getExportUrl, getImportUrl,getDeviceList } from './config.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { useMethods } from '/@/hooks/system/useMethods';
import { dateFormat } from '/@/utils/common/compUtils';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { getOrgCodeList } from '/@/api/common/api';
const { createConfirm, createMessage } = useMessage();
const [registerDrawer, { openDrawer }] = useDrawer();
const download = getFileAccessHttpUrl('excel_template/报警配置导入模版.xlsx');
const orgOptions = ref([]);

// const queryParam = ref({});
let searchInfo = {};
// 列表页面公共参数、方法
const { tableContext, onExportXls, onImportXls, doRequest } = useListPage({
  designScope: 'postAttribute-template',
  tableProps: {
    title: '属性列表',
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
  exportConfig: {
    name: '报警配置-' + dateFormat(new Date(), 'yyyy-MM-dd'),
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
  },
});

const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

/**
 * 新增事件-任务发布
 */
function handleAdd() {
  openDrawer(true, {
    isUpdate: false,
    showFooter: true,
  });
}
/**
 * 编辑事件
 */
function handleEdit(record) {
  openDrawer(true, {
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
  openDrawer(true, {
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
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
    },
    {
      label: '删除',
      auth: 'warn:config:delete',
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