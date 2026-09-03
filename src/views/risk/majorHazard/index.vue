<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">新增</a-button>
      <a-button
        preIcon="ant-design:delete-outlined"
        v-if="selectedRowKeys.length > 0"
        @click="batchHandleDelete"
      >
        批量删除
      </a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getActions(record)" />
    </template>
  </BasicTable>
  <MajorHazardModal @register="registerModal" @success="handleSuccess" />
  <MapMarkModal @register="registerMarkModal" @success="handleSuccess" />
</template>

<script lang="ts" name="risk-majorHazard" setup>
  import { nextTick } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { columns, searchFormSchema } from './majorHazard.data';
  import { getList, deleteRecord, batchDeleteRecord } from './majorHazard.api';
  import MajorHazardModal from './MajorHazardModal.vue';
  import MapMarkModal from './MapMarkModal.vue';

  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerMarkModal, { openModal: openMarkModal }] = useModal();

  const { tableContext } = useListPage({
    tableProps: {
      api: getList,
      columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      rowKey: 'id',
      clickToRowSelect: false,
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
      title: '新增',
    });
  }

  function handleEdit(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
      title: '编辑',
    });
  }

  function handleDelete(record) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        deleteRecord({ ids: record.id }, reload);
      },
    });
  }

  function handleMark(record) {
    openMarkModal(true, {
      record,
    });
  }

  async function batchHandleDelete() {
    await batchDeleteRecord({ ids: selectedRowKeys.value.join(',') }, handleSuccess);
  }

  function handleSuccess() {
    nextTick(() => {
      selectedRowKeys.value = [];
      reload();
    });
  }

  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
      },
      {
        label: '标记',
        onClick: handleMark.bind(null, record),
      },
    ];
  }
</script>
