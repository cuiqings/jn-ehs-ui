<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <PlanModal @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" name="system-notice" setup>
// import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import PlanModal from './PlanModal.vue';
// import DetailModal from './DetailModal.vue';
import { columns } from './plan.data';
import { getList} from './plan.api';
import { useListPage } from '/@/hooks/system/useListPage';
// import { useMessage } from '/@/hooks/web/useMessage';
// const { createConfirm } = useMessage();
const [registerModal, { openModal }] = useModal();

// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'periodic-template',
  tableProps: {
    title: '',
    api: getList,
    columns: columns,
    showIndexColumn: true,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
    useSearchForm: false
  }
});

const [registerTable, { reload }] = tableContext;

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
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: '修改',
      onClick: handleEdit.bind(null, record),
      auth: 'periodicPlan:edit'
      // ifShow: record.sendStatus == 0,
    },
  ];
}


</script>
