<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="报警管理记录" width="1200px" @cancel="handleCancel">
    <BasicTable ref="tableRef" @register="registerTable">
      <template #enableFlag="{ record }">
        <a-tag v-if="record.enableFlag == 1" color="#f50">停用</a-tag>
        <a-tag color="#87d068" v-else>启用</a-tag>
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/src/components/Modal';
import { BasicTable, useTable, TableAction } from '/src/components/Table';
import { warnHistoryColumns } from './device.data';
import { getWarnHistoryList } from './device.api';
import { useListPage } from '/@/hooks/system/useListPage';
const emit = defineEmits(['select', 'register']);
const timer = ref();
const tableRef = ref();
const isUpdate = ref(false);
let searchInfo = {};
const deviceId = ref(null);
const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
  console.log('useModalInner data', data);
  deviceId.value = data.record.deviceId;
  // 根据参数deviceId查询列表
  setProps({ searchInfo: { id: data.record.deviceId } });
  setModalProps({
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter,
    showOkBtn: !!data?.showFooter,
  });
  reload();
});
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'warn-history-list',
  tableProps: {
    api: getWarnHistoryList,
    rowKey: 'id',
    columns: warnHistoryColumns,
    useSearchForm: false,
    showIndexColumn: false,
    showActionColumn: false,
  },
});
const [registerTable, { reload, setProps }, {}] = tableContext;
const handleCancel = () => {
  closeModal();
};
</script>
