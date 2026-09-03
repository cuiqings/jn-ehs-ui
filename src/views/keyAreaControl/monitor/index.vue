<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出 </a-button>
      </template>
      <template #cenType="{ record }">
        <div v-if="!record.censorshipWord && !record.censorshipFile">
          {{ record.censorshipWord }}
        </div>
        <div v-else>
          <span v-if="record.cenType === '0' || !record.cenType">
            <JEllipsis :value="record.censorshipWord" :length="10" />
          </span>
          <span v-if="record.cenType === '1' && record.censorshipFile">√</span>
        </div>
      </template>
      <template #criType="{ record }">
        <div v-if="!record.criterionWord && !record.criterionFile">
          {{ record.criterionWord }}
        </div>
        <div v-else>
          <span v-if="record.criType === '0' || !record.criType">
            <JEllipsis :value="record.criterionWord" :length="10" />
          </span>
          <span v-if="record.criType === '1' && record.criterionFile">√</span>
        </div>
      </template>
      <template #cleanCheckRecordType="{ record }">
        <span v-if="record.cleanCheckRecordType === '1'"> {{ record.cleanCheckRecord }} </span>
        <span v-else>
          <span v-if="(record.maintenanceRecordId && record.clearName) || !record.clearName">√</span>
        </span>
      </template>
      <template #cleanCheckPhotoType="{ record }">
        <span v-if="record.cleanCheckPhotoType === '1'">
          {{ record.cleanCheckPhotoCompare }}
        </span>
        <span v-if="record.cleanCheckPhotoType === '0' && record.maintenanceRecordId && record.clearName">√</span>
        <span v-if="record.cleanCheckPhotoType === '0' && !record.clearName">√</span>
      </template>
      <template #checkPhoto="{ record }">
        <img
          v-if="record.checkPhoto"
          :src="fmtImg(record.checkPhoto)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record.checkPhoto)"
        />
        <span v-else>无</span>
      </template>
      <template #nextCleanCheckTime="{ record }">
        <span :class="record.colour === '0' ? '' : 'red'">{{ record.nextCleanCheckTime }}</span>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <MonitorModal @register="registerModal" @success="reload" />
    <RecordModal @register="recordModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getList, getOrganizationNew, exportUrl } from './monitor.api';
  import { columns, searchFormSchema } from './monitor.data';
  import { useModal } from '/@/components/Modal';
  import MonitorModal from './monitorModal.vue';
  import { dateFormat, getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview';
  import RecordModal from './record.vue';
  import { JEllipsis } from '/@/components/Form';

  const [registerModal, { openModal }] = useModal();
  const [recordModal, { openModal: openRecordModal }] = useModal();
  let searchInfo = {};
  let organizationCode = undefined;
  const { tableContext, onExportXls } = useListPage({
    designScope: 'monitor',
    tableProps: {
      title: '重点部位监控',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      handleSearchInfoFn(info) {
        const searchForm = getForm();
        if (organizationCode) {
          info.organizationCode = organizationCode;
          searchForm.setFieldsValue({
            organizationCode: organizationCode,
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
      name: '重点部位监控' + dateFormat(new Date(), 'yyyy-MM-dd'),
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection }] = tableContext;

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
        field: 'organizationCode',
        componentProps: {
          options: orgOptions,
          placeholder: '请选择',
          disabled: orgOptions.length === 1,
        },
      });
      if (orgOptions.length === 1) {
        searchForm.setFieldsValue({
          organizationCode: orgOptions[0]?.value,
        });
        organizationCode = orgOptions[0]?.value;
      }
      reload();
    });
  }

  getOrgList();

  // 操作列
  function getActions(record) {
    return [
      {
        label: '记录',
        onClick: handleRecord.bind(null, record),
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
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

  // 记录
  function handleRecord(record) {
    openRecordModal(true, { record });
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

<style lang="less" scoped>
  .red {
    color: red;
  }
</style>
