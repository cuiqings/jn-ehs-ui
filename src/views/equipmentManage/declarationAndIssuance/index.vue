<template>
  <div>
    <basic-table @register="registerTable">
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
</template>

<script setup name="equipmentManage-declarationAndIssuance" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  import { list } from './api';
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  // 搜索表单配置
  const searchFormSchema: FormSchema[] = [
    {
      field: 'dateRange',
      label: '时间',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM',
        placeholder: ['开始月份', '结束月份'],
        picker: 'month',
      },
      colProps: { span: 6 },
      defaultValue: [`${new Date().getFullYear()}-01`, `${new Date().getFullYear()}-12`],
    },
  ];

  // 表格列配置
  const columns: BasicColumn[] = [
    {
      title: '名称',
      dataIndex: 'title',
      align: 'center',
    },
    {
      title: '生成时间',
      dataIndex: 'generateTime',
      align: 'center',
    },
  ];

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'equipmentManage-declarationAndIssuance-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      beforeFetch: (params) => {
        if (params.dateRange) {
          params.generateTimeStart = params.dateRange.split(',')[0];
          params.generateTimeEnd = params.dateRange.split(',')[1];
          delete params.dateRange;
        }
        return params;
      },
      actionColumn: {
        width: 150,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });

  const [registerTable, { reload }] = tableContext;

  // 操作按钮配置
  const getActions = (record: any) => {
    return [
      {
        label: '去处理',
        auth: ['declarationAndIssuance:dealWith'],
        onClick: handleProcess.bind(null, record),
      },
    ];
  };

  // 处理申报
  const handleProcess = (record: any) => {
    router.push({
      path: '/declarationAndIssuance/processing',
      query: {
        id: record.id,
        generateTime: record.generateTime,
        title: record.title,
      },
    });
  };

  onMounted(() => {
    reload();
  });
</script>

<style lang="less" scoped>
  :deep(.ant-table-title) {
    display: none !important;
  }
</style>
