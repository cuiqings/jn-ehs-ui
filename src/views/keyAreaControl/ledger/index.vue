<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'keyAreaLedger:add'" @click="handleAdd">新增 </a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" v-auth="'keyAreaLedger:import'" @click="onImportXls">
          导入
        </j-upload-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'keyAreaLedger:export'" @click="onExportXls"> 导出 </a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="exportRecord"> 下载导入模板 </a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" v-auth="'keyAreaLedger:del'" @click="batchHandleDelete">
          批量删除
        </a-button>
      </template>
      <template #censorship="{ record }">
        <a v-if="record.cenType === '1'" @click="handlePreview(record.censorshipFile)">
          <JEllipsis :value="record.censorshipFile?.split('/').slice(-1)[0]" :length="10" />
        </a>
        <span v-else>
          <JEllipsis :value="record.censorshipWord" :length="10" />
        </span>
      </template>
      <template #criterion="{ record }">
        <a v-if="record.criType === '1'" @click="handlePreview(record.criterionFile)">
          <JEllipsis :value="record.criterionFile?.split('/').slice(-1)[0]" :length="10" />
        </a>
        <span v-else>
          <JEllipsis :value="record.criterionWord" :length="10" />
        </span>
      </template>
      <template #entryName="{ record }">
        <a @click="getClean(record)">
          <JEllipsis :value="record.entryName" :length="10" />
        </a>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <LedgerModal @register="registerModal" @success="reload" />
    <PlanModal @register="planModal" @success="reload" />
    <CleanModal @register="cleanModal" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import {
    getList,
    deleteRecord,
    batchDeleteRecord,
    getOrganizationNew,
    exportUrl,
    importUrl,
    downloadTemplateUrl
  } from './ledger.api';
  import { columns, searchFormSchema } from './ledger.data';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { previewFile } from '/@/api/common/api';
  import LedgerModal from './ledgerModal.vue';
  import PlanModal from './planModal.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { JEllipsis } from '/@/components/Form';
  import CleanModal from '/@/views/periodicClean/plan/PlanModal.vue';
  import {useMethods} from "/@/hooks/system/useMethods";
  const { createConfirm, createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [planModal, { openModal: openPlanModal }] = useModal();
  const [cleanModal, { openModal: openCleanModal }] = useModal();
  let searchInfo = {};
  let subsidiaryCode = undefined;
  const { tableContext, doRequest, onImportXls, onExportXls } = useListPage({
    designScope: 'ledger',
    tableProps: {
      title: '重点部位台账',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      handleSearchInfoFn(info) {
        const searchForm = getForm();
        if (subsidiaryCode) {
          info.subsidiaryCode = subsidiaryCode;
          searchForm.setFieldsValue({
            subsidiaryCode: subsidiaryCode,
          });
        }
        searchInfo = Object.assign({}, info);
        return searchInfo;
      },
      immediate: false,
      showIndexColumn: true,
      actionColumn: {
        width: 220,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      url: exportUrl,
      name: '重点部位管控台账' + dateFormat(new Date(), 'yyyy-MM-dd'),
    },
    importConfig: {
      url: importUrl,
      success: () => reload(),
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

  async function getOrgList() {
    getOrganizationNew().then(async (res) => {
      const orgOptions = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      const searchForm = await getForm();
      searchForm.updateSchema({
        field: 'subsidiaryCode',
        componentProps: {
          options: orgOptions,
          placeholder: '请选择',
          disabled: orgOptions.length === 1,
        },
      });
      if (orgOptions.length === 1) {
        searchForm.setFieldsValue({
          subsidiaryCode: orgOptions[0]?.value,
        });
        subsidiaryCode = orgOptions[0]?.value;
      }
      reload();
    });
  }

  getOrgList();

  // 新增
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
      type: '0', // 新增
    });
  }

  // 操作列
  function getActions(record) {
    return [
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'keyAreaLedger:edit',
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'keyAreaLedger:del',
      },
      {
        label: '关联计划',
        onClick: handlePlane.bind(null, record),
      },
    ];
  }

  // 查看
  function handleDetail(record) {
    openModal(true, {
      isUpdate: true,
      showFooter: false,
      record: record,
      type: '1', // 查看
    });
  }

  // 编辑
  function handleEdit(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
      type: '2', // 编辑
    });
  }

  // 删除
  function handleDelete(record) {
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

  // 关联计划
  function handlePlane(record) {
    openPlanModal(true, { record });
  }

  // 批量删除
  async function batchHandleDelete() {
    doRequest(() => batchDeleteRecord({ ids: selectedRowKeys.value }));
  }

  function handlePreview(filePath) {
    if (filePath) {
      previewFile(filePath).then((res) => {
        window.open(res, '_blank');
      });
    }
  }

  async function exportRecord() {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('批量导入重点部位台账模板', downloadTemplateUrl, params);
  }

  async function getClean(record) {
    openCleanModal(true, {
      isUpdate: true,
      showFooter: false,
      record: { id: record.clearId, clearEntryId: record.clearEntryId },
      type: '3',
    });
  }
</script>

<style lang="less" scoped></style>
