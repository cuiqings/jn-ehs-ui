<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1800" title="风险信息" destroyOnClose>
      <basic-table @register="registerTable" />
      <template #footer>
        <div>
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="risk-modal-info" setup>
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { nextTick } from 'vue';
  const columns: any = [
    {
      title: '风险ID',
      width: 200,
      align: 'center',
      dataIndex: 'uniqueCode',
    },
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgCode_dictText',
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departCode_dictText',
    },
    {
      title: '区域位置（单元）',
      width: 200,
      align: 'center',
      dataIndex: 'areaId_dictText',
    },
    {
      title: '类别',
      width: 150,
      align: 'center',
      dataIndex: 'category_dictText',
    },
    {
      title: '名称',
      width: 150,
      align: 'center',
      dataIndex: 'riskName',
    },
    {
      title: '设备编号',
      width: 150,
      align: 'center',
      dataIndex: 'deviceNumber',
    },
    {
      title: '规格',
      width: 200,
      dataIndex: 'specification',
    },
    {
      title: '动力分类',
      width: 150,
      dataIndex: 'impetusType',
    },
    {
      title: '在用状态',
      width: 100,
      dataIndex: 'useStatus_dictText',
    },
    {
      title: '是否特种设备',
      width: 150,
      dataIndex: 'specialEquipment',
      customRender: ({ text }) => {
        return text === '1' ? '是' : '否';
      },
    },
    {
      title: '备注',
      width: 200,
      dataIndex: 'remark',
    },
  ];
  const columns1: any = [
    {
      title: '风险ID',
      width: 200,
      align: 'center',
      dataIndex: 'uniqueCode',
    },
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgCode_dictText',
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departCode_dictText',
    },
    {
      title: '区域位置（单元）',
      width: 200,
      align: 'center',
      dataIndex: 'areaId_dictText',
    },
    {
      title: '作业活动名称',
      width: 200,
      align: 'center',
      dataIndex: 'riskName',
    },
    {
      title: '作业内容',
      width: 200,
      align: 'center',
      dataIndex: 'workContent',
    },
    {
      title: '是否为危险作业',
      width: 150,
      align: 'center',
      dataIndex: 'dangerWork',
      customRender: ({ text }) => {
        return text === '1' ? '是' : '否';
      },
    },
    {
      title: '作业频率',
      width: 150,
      dataIndex: 'frequency_dictText',
    },
    {
      title: '备注',
      width: 200,
      dataIndex: 'remark',
    },
  ];
  const { tableContext } = useListPage({
    tableProps: {
      dataSource: [],
      useSearchForm: false,
      showActionColumn: false,
      columns: columns,
      pagination: false,
      indexColumnProps: {
        fixed: 'left',
      },
    },
  });
  const [registerTable, { setColumns, setTableData }] = tableContext;
  const [registerModal, { closeModal }] = useModalInner((data) => {
    nextTick(() => {
      setTableData([data.data]);
      setColumns(data.activeKey === '0' ? columns : columns1);
    });
  });
  const close = () => {
    closeModal();
  };
</script>
