<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="从检查表库添加" width="1300px" @ok="handleSubmit" destroy-on-close>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" style="padding: 2px" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { checkLibraryColumns, searchCheckLibraryFormSchema } from './manage.data';
  import { getDeviceList } from './manage.api';
  const emit = defineEmits(['select', 'register']);
  const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
    nextTick(() => {
      selectedRowKeys.value = data.data.filter((item) => item.itemId).map((ite) => ite.itemId);
    });
  });
  //注册table数据
  const { tableContext } = useListPage({
    tableProps: {
      api: getDeviceList,
      columns: checkLibraryColumns,
      formConfig: {
        labelWidth: 90,
        schemas: searchCheckLibraryFormSchema,
      },
      showIndexColumn: true,
      rowKey: 'id',
      showActionColumn: false,
    },
  });
  const [registerTable, {}, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

  //提交事件
  function handleSubmit() {
    setModalProps({ confirmLoading: true });
    //关闭弹窗
    closeModal();
    //刷新列表
    const data = JSON.parse(JSON.stringify(selectedRows.value));
    const data1 = data.map((item) => {
      item.itemId = item.id;
      return item;
    });
    emit('select', {
      data: data1,
      selectedRowKeys: selectedRowKeys.value,
    });
    selectedRowKeys.value = [];
    setModalProps({ confirmLoading: false });
  }
</script>
