<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="添加属性" width="1300px" @cancel="handleCancel" @ok="handleSubmit">
    <BasicTable ref="tableRef" @register="registerTable" :rowSelection="rowSelection" style="padding: 2px">
      <template #enableFlag="{ text, record }">
        <a-tag color="#f50" v-if="text == 0">停用</a-tag>
        <a-tag color="#87d068" v-if="text == 1">启用</a-tag>
      </template>
      <template #sendGatewayStatus="{ text, record }">
        {{ text == '1' ? '上传中' : text == '2' ? '上传成功' : '上传失败：' + record.sendGatewayErrorInfo }}
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, unref, toRaw, onMounted, onUnmounted } from 'vue';
import { BasicModal, useModalInner } from '/src/components/Modal';
import { BasicTable, useTable, TableAction } from '/src/components/Table';
import { attributeListColumns, searchAttributeFormSchema } from './list.data';
import { getAttributeList } from './list.api';
import { useListPage } from '/@/hooks/system/useListPage';
const emit = defineEmits(['select', 'register']);
const timer = ref();
const tableRef = ref();
const isUpdate = ref(false);
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'device-attribute-list',
  tableProps: {
    api: getAttributeList,
    rowKey: 'pointId',
    columns: attributeListColumns,
    formConfig: {
      labelWidth: 60,
      schemas: searchAttributeFormSchema,
    },
    useSearchForm: true,
    showIndexColumn: false,
    showActionColumn: false,
  },
});
const deviceId = ref([]);
const [registerTable, { reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  await reload();
  deviceId.value = data.deviceId;
  timer.value = setTimeout(() => {
    selectedRowKeys.value = deviceId.value;
  }, 1000);
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
 * 选择列配置
 */
// const rowSelection = {
//   type: 'checkbox',
//   columnWidth: 20,
//   selectedRowKeys: checkedKeys,
//   onChange: onSelectChange,
// };
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
