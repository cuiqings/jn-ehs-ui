<template>
  <div>
    <basic-table @register="registerTable">
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <DetailModal @register="registerDetailModal" />
  </div>
</template>
<script setup name="performanceAppraisal-list" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  import { list } from './api';
  import dayjs from 'dayjs';
  import DetailModal from './detail.vue';
  import { useModal } from '/@/components/Modal';
  const [registerDetailModal, { openModal: openDetailModal }] = useModal();
  const searchFormSchema: FormSchema[] = [
    {
      label: '考核时间',
      field: 'time',
      component: 'RangeDate',
      defaultValue: `${dayjs().startOf('year').format('YYYY-MM')},${dayjs().endOf('year').format('YYYY-MM')}`,
      componentProps: {
        valueFormat: 'YYYY-MM',
        picker: 'month',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '名称',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '考核时间',
      align: 'center',
      dataIndex: 'assessTime',
    },
    {
      title: '生成时间',
      align: 'center',
      dataIndex: 'createTime',
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'performanceAppraisal-performanceAppraisal-list',
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
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['assessTimeStart'] = time[0];
          params['assessTimeEnd'] = time[1];
          delete params['time'];
        }
        return params;
      },
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable] = tableContext;
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
    ];
  };
  const handleView = (data: any) => {
    openDetailModal(true, {
      id: data.id,
      name: data.name || '2025年5月份绩效考核',
    });
  };
</script>
<style lang="less" scoped></style>
