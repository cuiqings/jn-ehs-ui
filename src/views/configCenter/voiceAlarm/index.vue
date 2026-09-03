<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">新增</a-button>
        <!-- <a-button preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button> -->
        <!-- <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete"> 批量删除</a-button> -->
        <a-button @click="batchDestory" v-if="selectedRowKeys.length > 0" ghost type="primary" v-auth="'sound:batch'">一键消音 </a-button>
      </template>
      <template #enableFlag="{ record }">
        <a-tag color="#f50" v-if="record.enableFlag == 0">停用</a-tag>
        <a-tag color="#87d068" v-if="record.enableFlag == 1">启用</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <VoiceAlarmModal @register="registerModal" @success="publishSuccess" />
  </div>
</template>
  <script lang="ts" name="system-notice" setup>
import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal, BasicModal } from '/@/components/Modal';
import VoiceAlarmModal from './components/VoiceAlarmModal.vue';
import { columns, searchFormSchema } from './voiceAlarm.data';
import { getList, deleteRecord, closeSound, testSound, closeSoundBatch, getRelateWarn } from './voiceAlarm.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
const { createConfirm, createMessage } = useMessage();
const [registerModal, { openModal }] = useModal();

// const queryParam = ref({});
let searchInfo = {};

// 列表页面公共参数、方法
const { tableContext, doRequest } = useListPage({
  designScope: 'voiceAlarm-template',
  tableProps: {
    title: '语音报警列表',
    api: getList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
      // alwaysShowLines: 2,
    },
    showIndexColumn: true,
    actionColumn: {
      width: 220,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
});

const [registerTable, { reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;

/**
 * 新增事件-任务发布
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}
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
 * 删除事件
 */
function handleDelete(record) {
  getRelateWarn({ id: record.id }).then((res) => {
    if (res > 0) {
      createMessage.warning('该报警器已关联报警配置，请先解除关联！');
    } else {
      createConfirm({
        iconType: 'warning',
        title: '删除',
        content: '确定要删除吗？',
        onOk: () => {
          deleteRecord({ id: record.id }, reload);
        },
        onCancel() {},
      });
    }
  });
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
      //auth: 'sound:edit',
    },
    {
      label: '删除',
      onClick: handleDelete.bind(null, record),
      // auth: 'sound:delete',
    },
    {
      label: '消音',
      onClick: handleDestory.bind(null, record),
      //auth: 'sound:destory',
    },
    {
      label: '试音',
      onClick: handleTry.bind(null, record),
      //auth: 'sound:try',
    },
  ];
}
// 消音
function handleDestory(record) {
  createConfirm({
    iconType: 'warning',
    title: '消音',
    content: `已选声光报警器（1）：${record.name}`,
    onOk: () => {
      closeSound({ id: record.id }, reload);
    },
    onCancel() {},
  });
}
// 试音
function handleTry(record) {
  createConfirm({
    iconType: 'warning',
    title: '试音',
    content: `已选声光报警器（1）：${record.name}`,
    onOk: () => {
      testSound({ id: record.id }, reload);
    },
    onCancel() {},
  });
}
// 一键消音
function batchDestory() {
  if (selectedRowKeys.value.length <= 0) {
    createMessage.warning('请选择一条记录！');
    return;
  } else {
    const names = selectedRows.value
      .filter((v) => selectedRowKeys.value.includes(v.id))
      .map((v) => v.name)
      .join(',');
    createConfirm({
      iconType: 'warning',
      title: '消音',
      content: `已选声光报警器（1）：${names}`,
      onOk: () => {
        closeSoundBatch({ ids: selectedRowKeys.value }, reload);
      },
      onCancel() {},
    });
  }
}
async function publishSuccess() {
  await reload();
}
</script>
  <style scoped lang="less">
.apc-main {
  text-align: center;
  display: flex;
  justify-content: space-around;
  padding: 80px 50px;
}
</style>