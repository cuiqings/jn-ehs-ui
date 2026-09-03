<template>
    <BasicModal v-bind="$attrs" @register="registerModal" title="风险管控信息台账添加" width="1300px" @ok="handleSubmit" destroy-on-close>
      <BasicTable @register="registerTable" :rowSelection="rowSelection" style="padding: 2px" />
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { nextTick, ref } from 'vue';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { BasicTable } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { riskLibraryColumns, searchCheckLibraryFormSchema } from './task.data';
    import { getRiskLibraryList } from './task.api';
    const emit = defineEmits(['select', 'register']);
    const dataParams = ref({});
    const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
      console.log('useModalInner data', data);
      dataParams.value = data;
    //   selectedRows.value = data.data;
    });
    //注册table数据
    const { tableContext } = useListPage({
      tableProps: {
        api: getRiskLibraryList,
        columns: riskLibraryColumns,
        formConfig: {
          labelWidth: 90,
          schemas: searchCheckLibraryFormSchema,
        },
        useSearchForm: false,
        beforeFetch: (info: Record<string, any>) => {
          info['orgCodeRange'] = dataParams.value.orgCodeRange.join(',');
          return info;
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
    //   const data = JSON.parse(JSON.stringify(selectedRows.value));
    //   const data1 = data.map((item) => {
    //     item.itemId = item.id
    //     item.errorFlag2 = false;
    //     return item;
    //   });
      emit('select', {
        // data: data1,
        selectedRowKeys: selectedRowKeys.value,
      });
    //   selectedRowKeys.value = [];
      setModalProps({ confirmLoading: false });
    }
  </script>
  