<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <!-- v-auth="'specialEquipment:add'" -->
        <a-button v-auth="'specialEquipment:add'" preIcon="ant-design:plus-outlined" type="primary" @click="onAdd">新增</a-button>
        <j-upload-button v-auth="'specialEquipment:import'" type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button v-auth="'specialEquipment:export'" preIcon="ant-design:vertical-align-bottom-outlined" type="primary" @click="onExportXls"
          >导出</a-button
        >
        <a-button v-auth="'specialEquipment:tmp'" preIcon="ant-design:vertical-align-bottom-outlined" type="primary" @click="onExportTemplateXls"
          >导入模板下载</a-button
        >

        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('specialEquipment:batchcheck')" key="1" @click="batchHandleCheck">
                <Icon icon="ant-design:check-outlined"></Icon>
                批量检验
              </a-menu-item>
              <a-menu-item v-if="hasPermission('specialEquipment:batchdel')" key="2" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                批量删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-auth="'specialEquipment:batchhandle'">
            <Icon icon="ant-design:down-outlined"></Icon>
            批量操作
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <div><table-action :actions="getActionsUp(record)" /></div>
        <div><table-action :actions="getActionsDown(record)" /></div>
      </template>
      <template #verificationDate="{ record }">
        <span :style="{ color: setTimeColor(record) }">{{ record.verificationDate }}</span>
      </template>
      <template #markFlag="{ record }">
        <span v-if="!record.markFlag">未标记</span>
        <a-button type="primary" v-else @click="handleMarkModal(record)">已标记</a-button>
      </template>
    </basic-table>
    <personnel-drawer @register="registerDrawer" @success="handleSuccess" />
    <!-- 检验弹窗 -->
    <CheckModal @register="registerCheckModal" @success="handleSuccess" />
    <!-- 标记弹窗 -->
    <markModal @register="registerMarkModal" />
  </div>
</template>
<script setup name="limitSpace" lang="ts">
  import { ref } from 'vue';
  import CheckModal from './CheckModal.vue';
  import personnelDrawer from './drawer.vue';
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import markModal from '../components/markModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useMethods } from '/@/hooks/system/useMethods';
  import dayjs from 'dayjs';
  const { hasPermission } = usePermission();
  const infoRef = ref();
  const {
    registerTable,
    registerCheckModal,
    registerMarkModal,
    handleMarkModal,
    onExportXls,
    onImportXls,
    onAdd,
    rowSelection,
    selectedRowKeys,
    onImportTemplate,
    batchDelete,
    batchCheck,
    getActionsUp,
    getActionsDown,
    handleSuccess,
    registerDrawer,
  } = useContent(infoRef);

  /**
   * 批量检验事件
   */
  async function batchHandleCheck() {
    await batchCheck(selectedRowKeys.value); // 将字符串传递给 batchCheck 方法
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete(selectedRowKeys.value); // 将字符串传递给 batchDelete 方法
  }

  function setTimeColor(record) {
    let date = record.verificationDate;
    let color = '#333333';
    if (!date) return color;
    let nowTime = new Date(dayjs(new Date()).format('YYYY-MM-DD')).getTime();
    let targetTime = new Date(date).getTime();
    let day7 = 7 * 24 * 60 * 60 * 1000;
    let day45 = 45 * 24 * 60 * 60 * 1000;
    if (nowTime > targetTime) return 'red';
    if (targetTime - day7 <= nowTime && record.deviceType <= 4) return 'orange';
    if (targetTime - day45 <= nowTime && record.deviceType > 4) return 'orange';
    return color;
  }

  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXlsx } = useMethods();
    let params = {};
    handleExportXlsx('特种设备台账模版', '/JnRiskControl/jnRiskSpecialManagement/template', params);
  }
</script>
<style lang="less"></style>
