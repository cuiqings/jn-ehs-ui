<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :expandedRowKeys="expandedRowKeys" :pagination="false">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
        <!-- <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button> -->
        <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button> -->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="ant-design:down-outlined"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!--字典弹窗-->
    <CategoryModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="system-category" setup>
//ts语法
import { ref } from 'vue';
import { BasicTable, useTable, TableAction } from '/src/components/Table';
import { useDrawer } from '/src/components/Drawer';
import CategoryModal from './components/DeviceCategoryModal.vue';
import { useModal } from '/src/components/Modal';
import { columns } from './deviceCategory.data';
import { list, deleteCategory, batchDeleteCategory } from './deviceCategory.api';
import { useListPage } from '/@/hooks/system/useListPage';

const expandedRowKeys = ref([]);
//字典model
const [registerModal, { openModal }] = useModal();
// 列表页面公共参数、方法
const { prefixCls, tableContext } = useListPage({
  designScope: 'category-template',
  tableProps: {
    title: '系统分类',
    api: list,
    columns: columns,
    actionColumn: {
      width: 220,
    },
    // formConfig: {
    //   schemas: searchFormSchema,
    // },
    isTreeTable: true,
    useSearchForm: false,
  },
});

//注册table数据
const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

/**
 * 新增事件
 */
function handleCreate() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}

/**
 * 编辑事件
 */
async function handleEdit(record) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
}

/**
 * 详情
 */
async function handleDetail(record) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: false,
  });
}

/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteCategory({ ids: record.id }, importSuccess);
}

/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  const ids = selectedRowKeys.value.filter((item) => !item.includes('loading'));
  await batchDeleteCategory({ ids: ids }, importSuccess);
}
/**
 * 导入
 */
function importSuccess() {
  //update-begin---author:wangshuai ---date:20220530  for：[issues/54]树字典，勾选，然后批量删除，系统错误------------
  (selectedRowKeys.value = []) && reload();
  //update-end---author:wangshuai ---date:20220530  for：[issues/54]树字典，勾选，然后批量删除，系统错误--------------
}
/**
 * 添加下级
 */
function handleAddSub(record) {
  openModal(true, {
    record,
    isUpdate: false,
    showFooter: true,
  });
}
/**
 * 成功回调
 */
async function handleSuccess({}) {
  reload();
}
/**
 * 操作栏
 */
function getTableAction(record) {
  return [
    {
      label: '添加下级',
      onClick: handleAddSub.bind(null, { pid: record.id }),
    },
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
    },
    {
      label: '删除',
      popConfirm: {
        title: '确定删除吗?',
        confirm: handleDelete.bind(null, record),
      },
    },
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
  ];
}
</script>

<style scoped></style>
