<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="设备选择列表" width="1300px" @cancel="handleCancel" @ok="handleSubmit" destroyOnClose>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" style="padding: 2px" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { deviceColumns, searchDeviceFormSchema, initOrgCode } from './check.data';
  import { getDeviceList } from './check.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  const emit = defineEmits(['select', 'register']);
  const dataSource: any = ref([]);
  const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
    dataSource.value = data.data;
    getForm().setFieldsValue({
      department: initOrgCode(),
    });
    nextTick(() => {
      selectedRowKeys.value = data.deviceId;
    });
  });
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'device-list',
    tableProps: {
      api: getDeviceList,
      rowKey: 'deviceId',
      columns: deviceColumns,
      formConfig: {
        labelWidth: 60,
        schemas: searchDeviceFormSchema,
      },
      useSearchForm: true,
      showIndexColumn: false,
      showActionColumn: false,
    },
  });
  const [registerTable, { getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const handleCancel = () => {
    closeModal();
    // 重置勾选
    selectedRowKeys.value = [];
  };
  //提交事件
  function handleSubmit() {
    setModalProps({ confirmLoading: true });
    //关闭弹窗
    closeModal();
    dataSource.value = dataSource.value.filter((item) => selectedRowKeys.value.includes(item.deviceId));
    dataSource.value = Array.from(new Map([...dataSource.value, ...selectedRows.value].map((item) => [item.deviceId, item])).values());
    //刷新列表
    emit('select', { selectedRowKeys: selectedRowKeys.value, dataSource: dataSource.value });
    setModalProps({ confirmLoading: false });
    // 重置勾选
    selectedRowKeys.value = [];
  }
</script>
