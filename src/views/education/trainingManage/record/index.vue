<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" v-auth="'questionBank:add'" @click="handleAdd"> 上传线下记录 </a-button>
      <a-button v-if="selectedRowKeys.length > 0" preIcon="ant-design:delete-outlined" v-auth="'questionBank:delete'" @click="batchHandleDelete">
        批量删除</a-button
      >
    </template>
    <template #status="{ record }">
      <a-tag v-if="record.status == '正常'" color="success">正常</a-tag>
      <a-tag v-if="record.status == '超期'" color="error">超期</a-tag>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <!--编辑抽屉-->
  <RecordDrawer @register="registerDrawer" @success="reload" />
  <RecordOnlineDrawer @register="registerOnlineDrawer" @success="reload" />
</template>
  <script lang="ts" setup name="edu-train-record">
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useDrawer } from '/@/components/Drawer';
import RecordDrawer from './RecordDrawer.vue';
import RecordOnlineDrawer from './RecordOnlineDrawer.vue';
import { columns, searchFormSchema } from './record.data';
import { list, batchDelete } from './record.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermission } from '/@/hooks/web/usePermission';
import { getOrgCodeList } from '/@/api/common/api';
const { hasPermission } = usePermission();
const orgOptions: any = ref([]);
function getOrgList() {
  getOrgCodeList().then((res) => {
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
  console.log('options', orgOptions.value);
}
getOrgList();
const [registerDrawer, { openDrawer }] = useDrawer();
const [registerOnlineDrawer, { openDrawer: openOnlineDrawer }] = useDrawer();
// 列表页面公共参数、方法
const { prefixCls, tableContext, onImportXls, onExportXls } = useListPage({
  tableProps: {
    title: '培训记录列表',
    api: list,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
    },
    showIndexColumn: true,
    actionColumn: {
      width: 120,
    },
    //自定义默认排序
    defSort: {
      column: 'id',
      order: 'desc',
    },
  },
});
const [registerTable, { getForm, reload }, { rowSelection, selectedRowKeys }] = tableContext;

/**
 * 新增
 */
function handleAdd() {
  openDrawer(true, {
    showFooter: true,
  });
}
/**
 * 编辑
 */
function handleDetail(record) {
  if (record.type == '线下') {
    openDrawer(true, {
      showFooter: false,
      record,
    });
  } else {
    openOnlineDrawer(true, {
      showFooter: false,
      record,
    });
  }
}
/**
 * 删除事件
 */
async function handleDelete(record) {
  await batchDelete({ ids: record.id }, reload);
}
/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ ids: selectedRowKeys.value.join(',') }, reload);
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
    {
      label: '删除',
      onClick: handleDelete.bind(null, record),
      ifShow: () => hasPermission('questionBank:delete'),
    },
  ];
}
</script>