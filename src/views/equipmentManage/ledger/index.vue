<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'equipmentManage-ledger:add'" @click="handleAdd">新增</a-button>
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'equipmentManage-ledger:import'" @click="onImportXls">
          导入</j-upload-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'equipmentManage-ledger:export'" @click="onExportXls"> 导出</a-button>
        <a-button preIcon="ant-design:download-outlined" type="primary" v-auth="'equipmentManage-ledger:download'" @click="onDownload">
          导入模版下载</a-button
        >
        <a-button
          preIcon="ant-design:delete-outlined"
          v-auth="'equipmentManage-ledger:del'"
          v-if="selectedRowKeys.length > 0"
          @click="batchHandleDelete"
        >
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <equipment-manage-ledger-drawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup name="equipmentManage-ledger" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import equipmentManageLedgerDrawer from './drawer.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { list, del, deleteBatch } from './api';
  import { dateFormat } from '/@/utils/common/compUtils';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const searchFormSchema: FormSchema[] = [
    {
      label: '物料分类',
      field: 'type',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'lb_supply_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '物料名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '生产厂家',
      field: 'manufacturer',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '物料编码',
      field: 'code',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '物料分类',
      width: 150,
      align: 'center',
      dataIndex: 'type_dictText',
    },
    {
      title: '物料名称',
      width: 150,
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '规格型号',
      width: 150,
      align: 'center',
      dataIndex: 'model',
    },
    {
      title: '物料编码',
      width: 130,
      align: 'center',
      dataIndex: 'code',
    },
    {
      title: '单位',
      width: 100,
      dataIndex: 'unit',
    },
    {
      title: '单价',
      width: 100,
      dataIndex: 'price',
    },
    {
      title: '生产厂家',
      width: 150,
      dataIndex: 'manufacturer',
    },
    {
      title: '备注',
      width: 200,
      dataIndex: 'remark',
    },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, onImportXls, onExportXls, operateRequest } = useListPage({
    designScope: 'equipmentManage-ledger-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
      },
      showIndexColumn: true,
      rowSelection: {
        fixed: 'left',
      },
      actionColumn: {
        width: 160,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/lb/lbSupply/importExcel',
      success: handleSuccess,
    },
    exportConfig: {
      name: '劳保物料台账-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/lb/lbSupply/exportXls',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['equipmentManage-ledger:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['equipmentManage-ledger:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openDrawer(true, {
      type: 'add',
      title: '新增',
      showOkBtn: true,
      showFooter: true,
    });
  };
  const handleView = (data: any) => {
    openDrawer(true, {
      type: 'view',
      title: '查看',
      showOkBtn: false,
      showFooter: true,
      data,
    });
  };
  const handleEdit = (data: any) => {
    openDrawer(true, {
      type: 'edit',
      title: '编辑',
      showOkBtn: true,
      showFooter: true,
      data,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(() => deleteBatch({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(() => del({ id: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  const onDownload = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('劳保物料台账-模板', '/lb/lbSupply/downloadImportTemplate');
  };
</script>
<style lang="less" scoped></style>
