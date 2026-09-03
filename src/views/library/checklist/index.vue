<template>
  <div>
    <basic-table @register="registerTable">
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <checklistDrawer @register="registerDrawer" />
  </div>
</template>

<script setup name="checklist" lang="ts">
  import checklistDrawer from './drawer.vue';
  import { BasicTable, TableAction, BasicColumn, FormSchema } from '/@/components/Table';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { list } from './url/index';
  import { useDrawer } from '/@/components/Drawer';
  import { useListPage } from '/@/hooks/system/useListPage';
  import dayjs from 'dayjs';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const searchFormSchema = <FormSchema[]>[
    {
      label: '检查表名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '检查表名称',
      dataIndex: 'name',
      align: 'left',
    },
    {
      title: '检查内容（项）',
      dataIndex: 'count',
      width: 300,
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '详情',
        onClick: handlerView.bind(null, record),
      },
      {
        label: '下载',
        onClick: handlerDownload.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'checklist-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable] = tableContext;
  const handlerView = (record: any) => {
    openDrawer(true, record);
  };
  const handlerDownload = (record: any) => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx(`${dayjs(new Date()).format('YYYYMMDD')}${record.name}`, '/base.library/bsCheckListLib/exportXls', {
      id: record.id,
    });
  };
</script>
<style scoped lang="less">
  /deep/.ant-table-title {
    min-height: 0 !important;
  }
</style>
