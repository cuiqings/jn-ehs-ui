<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'fireTrain:add'" @click="handleAdd">新增 </a-button>
        <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" v-auth="'fireTrain:del'" @click="batchHandleDelete">
          批量删除
        </a-button>
      </template>
      <template #problemImpro="{ record }">
        <a @click="handlePreview(record.problemImpro)">{{ record.problemImpro?.split('/').slice(-1)[0] }}</a>
      </template>
      <template #signPath="{ record }">
        <a @click="handlePreview(record.signPath)">{{ record.signPath?.split('/').slice(-1)[0] }}</a>
      </template>
      <template #recordSheet="{ record }">
        <a @click="handlePreview(record.recordSheet)">{{ record.recordSheet?.split('/').slice(-1)[0] }}</a>
      </template>
      <template #resultPath="{ record }">
        <a @click="handlePreview(record.resultPath)">{{ record.resultPath?.split('/').slice(-1)[0] }}</a>
      </template>
      <template #imagePath="{ record }">
        <img
          v-if="record.imagePath"
          :src="fmtImg(record.imagePath)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record.imagePath)"
        />
        <span v-if="!record.imagePath">无</span>
      </template>
      <template #drillRecord="{ record }">
        <a @click="handlePreview(record.drillRecord)">{{ record.drillRecord?.split('/').slice(-1)[0] }}</a>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DrillModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getList, deleteRecord, batchDeleteRecord } from './drill.api';
  import { columns, searchFormSchema } from './drill.data';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getOrganizationNew } from '../drill/drill.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview';
  import DrillModal from './drillModal.vue';
  import { previewFile } from '/@/api/common/api';

  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  let searchInfo = {};
  let subsidiaryCode = undefined;
  const { tableContext, doRequest } = useListPage({
    designScope: 'periodic-template',
    tableProps: {
      title: '消防应急演练',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (info) => {
        const { drillTime } = info;
        if (drillTime) {
          const array = drillTime.split(',');
          info.startTime = array[0] + ' 00:00:00';
          info.endTime = array[1] + ' 23:59:59';
        }
        return info;
      },
      handleSearchInfoFn(info) {
        const { drillTime } = info;
        if (drillTime) {
          const array = drillTime.split(',');
          info.startTime = array[0] + ' 00:00:00';
          info.endTime = array[1] + ' 23:59:59';
        }
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
      tableSetting: {
        redo: false,
        size: false,
        setting: false,
      },
      actionColumn: {
        width: 220,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
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
        auth: 'fireTrain:edit',
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'fireTrain:del',
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

  function fmtImg(image) {
    const firstImg = image.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  }

  function openImg(image) {
    let imageList = image.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
    });
  }
</script>

<style lang="less" scoped></style>
