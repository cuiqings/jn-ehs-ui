<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" v-auth="'questionBank:add'" @click="handleAdd"> 新增</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls"> 导入 </j-upload-button>
      <a-button v-if="selectedRowKeys.length > 0" preIcon="ant-design:delete-outlined" v-auth="'questionBank:delete'" @click="batchHandleDelete">
        批量删除</a-button
      >
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <!--编辑抽屉-->
  <HiddenDangerModal @register="registerModal" @success="reload" />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import HiddenDangerModal from './HiddenDangerModal.vue';
  import { columns, searchFormSchema } from './hiddenDanger.data';
  import { list, batchDelete, deleteById, getExportUrl, getImportUrl } from './hiddenDanger.api';
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
  const [registerModal, { openModal }] = useModal();
  // 列表页面公共参数、方法
  const { tableContext, onImportXls, onExportXls } = useListPage({
    tableProps: {
      title: '培训记录列表',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      actionColumn: {
        width: 180,
        fixed: 'right',
      },
      //自定义默认排序
      defSort: {
        column: 'id',
        order: 'desc',
      },
    },
    exportConfig: {
      url: getExportUrl,
      name: '隐患库列表',
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const [registerTable, { getForm, reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 新增
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
    });
  }
  /**
   * 编辑
   */
  function handleDetail(record) {
    openModal(true, {
      showFooter: false,
      isUpdate: true,
      record,
    });
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteById({ id: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value.join(',') }, reload);
  }
  // 编辑
  function handleEdit(record) {
    openModal(true, {
      isUpdate: true,
      showFooter: true,
      record,
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
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
        onClick: handleDelete.bind(null, record),
      },
    ];
  }
</script>
