<template>
  <BasicDrawer @register="registerDetailDrawer" :title="detailRecord.planName" width="90%" destroyOnClose>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" v-auth="'trainProject:add'" @click="handleAdd">添加项目</a-button>
        <a-button preIcon="ant-design:download-outlined" type="primary" @click="onExportTemplateXls">导入模板下载</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">批量导入</j-upload-button>
        <a-dropdown v-if="selectedRowKeys.length > 0 && hasPermission('trainProject:delete')">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined" />
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!--编辑抽屉-->
    <DetailModal @register="registerModal" @success="reload" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import DetailModal from './DetailModal.vue';
  import { detailColumns, searchDetailFormSchema } from './plan.data';
  import { projectList, deleteProject, deleteBatchProject, getImportUrl } from './plan.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  const planId = ref('');
  const detailRecord: any = ref({});
  const showFooter = ref(true);
  const [registerDetailDrawer] = useDrawerInner(async (data) => {
    console.log('useDrawerInner', data);
    detailRecord.value = data;
    planId.value = data.id;
    setProps({ searchInfo: { planId: data.id } });
    reload();
  });
  const [registerModal, { openModal }] = useModal();

  // 列表页面公共参数、方法
  const { tableContext, onImportXls } = useListPage({
    tableProps: {
      title: '项目列表',
      api: projectList,
      columns: detailColumns,
      formConfig: {
        schemas: searchDetailFormSchema,
      },
      showIndexColumn: true,
      actionColumn: {
        width: 120,
      },
      //自定义默认排序
      defSort: {
        column: 'id',
        order: 'desc',
      },
    },
    importConfig: {
      url: getImportUrl,
      data: () => {
        return {
          planId: planId.value,
        };
      },
      success: handleSuccess,
    },
  });
  const [registerTable, { reload, setProps }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 新增
   */
  function handleAdd() {
    showFooter.value = true;
    openModal(true, {
      isUpdate: false,
      planId: planId.value,
    });
  }
  /**
   * 编辑
   */
  function handleEdit(record) {
    console.log(record);
    showFooter.value = true;
    openModal(true, {
      record,
      planId: planId.value,
      isUpdate: true,
    });
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteProject({ ids: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await deleteBatchProject({ ids: selectedRowKeys.value.join(',') }, reload);
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: () => hasPermission('trainProject:edit'),
      },
      {
        label: '删除',
        ifShow: () => hasPermission('trainProject:delete'),
        popConfirm: {
          title: '确定删除吗?',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }
  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXlsx } = useMethods();
    let params = {};
    handleExportXlsx('培训计划模版-样例请删除', '/edu/trainProject/downloadTemplate', params);
  }
  /**
   * 成功回调
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }
</script>
