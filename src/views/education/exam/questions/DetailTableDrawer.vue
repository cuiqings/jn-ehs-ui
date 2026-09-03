<template>
  <BasicDrawer @register="registerDetailDrawer" :title="detailRecord.name" width="90%" destroyOnClose @close="handleCancel">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新建试题</a-button>
        <a-button preIcon="ant-design:download-outlined" type="primary" @click="onExportTemplateXls">导入模板下载</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">批量导入</j-upload-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
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
  import { detailColumns, searchDetailFormSchema } from './questions.data';
  import { detailList, batchDeleteQuestion, getImportUrl } from './questions.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { dateFormat } from '/@/utils/common/compUtils';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const questionBankId = ref('');
  const detailRecord: any = ref({});
  const showFooter = ref(true);
  const [registerDetailDrawer, { closeDrawer }] = useDrawerInner(async (data) => {
    detailRecord.value = data;
    questionBankId.value = data.id;
    reload();
  });
  const [registerModal, { openModal }] = useModal();

  // 列表页面公共参数、方法
  const { tableContext, onImportXls, onExportXls } = useListPage({
    tableProps: {
      title: '试题列表',
      api: detailList,
      columns: detailColumns,
      formConfig: {
        schemas: searchDetailFormSchema,
      },
      showIndexColumn: true,
      actionColumn: {
        width: 120,
      },
      beforeFetch: (params) => {
        params.questionBankId = questionBankId.value;
        return params;
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
          questionBankId: questionBankId.value,
        };
      },
      success: handleSuccess,
    },
    exportConfig: {
      name: () => detailRecord.value.name + '-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/edu/question/export',
      suffix: 'xlsx',
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
      questionBankId: questionBankId.value,
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
      questionBankId: questionBankId.value,
      isUpdate: true,
    });
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await batchDeleteQuestion({ ids: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteQuestion({ ids: selectedRowKeys.value.join(',') }, reload);
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        // popConfirm: {
        //   title: '是否确认删除',
        //   confirm: handleDelete.bind(null, record),
        // },
      },
    ];
  }
  // 成功回调
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }
  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXlsx } = useMethods();
    let params = {};
    handleExportXlsx('试题模版-样例请删除', '/edu/question/downloadTemplate', params);
  }
  const handleCancel = () => {
    closeDrawer();
    emit('success');
  };
</script>
