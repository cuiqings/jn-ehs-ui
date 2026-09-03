<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="已填报人员列表" :width="800" :canFullscreen="false" :footer="null">
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看问卷',
              onClick: handleView.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';

  const emit = defineEmits(['view-detail']);

  const [registerModal] = useModalInner(async (data) => {
    console.log(data, 11);
    loadMockData();
  });

  const [registerTable, { setTableData }] = useTable({
    columns: [
      { title: '所属单位', dataIndex: 'unit' },
      { title: '人员姓名', dataIndex: 'name' },
      { title: '工号', dataIndex: 'empId' },
    ],
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
    pagination: false,
    dataSource: [],
  });

  const loadMockData = () => {
    const data = [
      { id: 1, unit: '炼铁厂', name: '张三', empId: '1001' },
      { id: 2, unit: '炼钢厂', name: '李四', empId: '1002' },
      { id: 3, unit: '轧钢厂', name: '王五', empId: '1003' },
      { id: 4, unit: '动力厂', name: '赵六', empId: '1004' },
      { id: 5, unit: '炼铁厂', name: '钱七', empId: '1005' },
    ];
    setTableData(data);
  };

  const handleView = (record: any) => {
    emit('view-detail', record);
  };
</script>
