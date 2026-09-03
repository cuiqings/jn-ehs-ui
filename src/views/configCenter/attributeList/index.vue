<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button type="primary"> <a :href="download" download style="color: #fff">下载导入模版</a></a-button>
        <a-button @click="sendGateway" type="primary">发送网关</a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete"> 批量删除</a-button>
      </template>
      <template #enableFlag="{ record }">
        <a-tag color="#f50" v-if="record.enableFlag == 0">停用</a-tag>
        <a-tag color="#87d068" v-if="record.enableFlag == 1">启用</a-tag>
      </template>
      <template #sendGatewayStatus="{ text, record }">
        {{ text == '1' ? '上传中' : text == '2' ? '上传成功' : '上传失败：' + record.sendGatewayErrorInfo }}
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <AttributeModal @register="registerModal" @success="publishSuccess" />
  </div>
</template>
    <script lang="ts" name="attribute-list" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal, BasicModal } from '/@/components/Modal';
import AttributeModal from './AttributeModal.vue';
import { columns, searchFormSchema } from './attribute.data';
import { getList, deleteRecord, batchDeleteRecord, sendPointJsonToGateway, getExportUrl, getImportUrl } from './attribute.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { useMethods } from '/@/hooks/system/useMethods';
import { dateFormat } from '/@/utils/common/compUtils';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
const { createConfirm, createMessage } = useMessage();
const [registerModal, { openModal }] = useModal();
const download = getFileAccessHttpUrl('excel_template/点位属性导入模板-OPC-UA.xls');

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
    name: '属性列表-' + dateFormat(new Date(), 'yyyy-MM-dd'),
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
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
function sendGateway() {
  sendPointJsonToGateway({ id: null }).then((res) => {
   reload();
  });
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