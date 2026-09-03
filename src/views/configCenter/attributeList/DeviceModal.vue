<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="设备选择列表" width="1000px" @cancel="handleCancel" @ok="handleSubmit">
    <BasicTable ref="tableRef" @register="registerTable" :rowSelection="rowSelection" style="padding: 2px" />
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, unref, toRaw, onMounted, onUnmounted } from 'vue';
import { BasicModal, useModalInner } from '/src/components/Modal';
import { BasicTable, useTable, TableAction } from '/src/components/Table';
import { deviceColumns, searchDeviceFormSchema } from './attribute.data';
import { getDeviceList } from './attribute.api';
import { useListPage } from '/@/hooks/system/useListPage';
const emit = defineEmits(['select', 'register']);
const timer = ref();
const tableRef = ref();
const isUpdate = ref(false);
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'device-list',
  tableProps: {
    api: getDeviceList,
    rowKey: 'id',
    columns: deviceColumns,
    formConfig: {
      labelWidth: 60,
      schemas: searchDeviceFormSchema,
    },
    useSearchForm: true,
    showIndexColumn: false,
    showActionColumn: false,
    rowSelection: {
      type: 'radio',
      columnWidth: 5,
    },
  },
});
const deviceId = ref(null);
const [registerTable, { reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
  console.log('useModalInner data', data);
  deviceId.value = data.deviceId;
  timer.value = setTimeout(() => {
    selectedRowKeys.value.push(deviceId.value);
  }, 300);
});

//先创建一个定时器
onMounted(() => {
  console.log('onMounted', deviceId.value);
});

//在页面销毁之前先销毁定时器
onUnmounted(() => {
  clearTimeout(timer.value);
});

/**
 * 选择事件
 */
// function onSelectChange(selectedRowKeys: (string | number)[], selectRows: any[]) {
//   console.log('onSelectChange', selectedRowKeys, selectRows);
//   checkedKeys.value = selectedRowKeys;
//   checkedRows.value = selectRows;
// }
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
  //刷新列表
  emit('select', toRaw(unref(selectedRows)));
  setModalProps({ confirmLoading: false });
  // 重置勾选
  selectedRowKeys.value = [];
}
</script>
