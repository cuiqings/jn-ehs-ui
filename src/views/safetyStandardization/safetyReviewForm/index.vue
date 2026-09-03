<template>
  <div>
    <basic-table :rowSelection="rowSelection" @register="registerTable">
      <template #tableTitle>
        <a-button v-auth="'safetyStandardization-safetyReviewForm:add'" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
          >新增
        </a-button>
        <a-button
          v-if="selectedRowKeys.length > 0"
          v-auth="'safetyStandardization-safetyReviewForm:del'"
          preIcon="ant-design:delete-outlined"
          @click="batchHandleDelete"
        >
          批量删除
        </a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" :dropDownActions="getDropdownActions(record)" />
      </template>
    </basic-table>
    <AddModal @register="registerModal" @success="handleSuccess" />
    <ReviewModal @register="registerReviewModal" @success="handleSuccess" />
    <UploadReportModal @register="registerUploadModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" name="safetyStandardization-safetyReviewForm" setup>
  import { ref, onMounted, h, computed } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  import { list, del, deleteBatch } from './api';
  import { get3DepartList } from '/@/api/common/api';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { Tag } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const { handleExportXlsx } = useMethods();
  import AddModal from './addModal.vue';
  import ReviewModal from './review.vue';
  import UploadReportModal from './uploadReportModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { downloadFile } from '/@/utils/common/renderUtils';
  const orgOptions: any = ref([]);
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const [registerModal, { openModal }] = useModal();
  const [registerReviewModal, { openModal: openReviewModal }] = useModal();
  const [registerUploadModal, { openModal: openUploadModal }] = useModal();
  const searchFormSchema: FormSchema[] = [
    {
      label: '评审单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '评审时间',
      field: 'time',
      component: 'RangeDate',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          { label: '评审中', value: '1' },
          { label: '评审完成', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '内审员',
      field: 'reviewPersonName',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '评审单位',
      dataIndex: 'orgName',
    },
    {
      title: '评审时间',
      width: 220,
      dataIndex: 'reviewTimeStart',
      customRender: ({ record }) => {
        return record.reviewTimeStart ? record.reviewTimeStart + ' - ' + record.reviewTimeEnd : '';
      },
    },
    {
      title: '状态',
      width: 120,
      dataIndex: 'status',
      customRender: ({ record }) => {
        return h(
          Tag,
          {
            color: record.status === '1' ? 'orange' : record.status === '2' ? 'green' : '',
          },
          record.status === '1' ? '评审中' : record.status === '2' ? '评审完成' : ''
        );
      },
    },
    {
      title: '不合格项',
      width: 150,
      dataIndex: 'unqualifiedNum',
    },
    {
      title: '最终得分',
      width: 150,
      dataIndex: 'finalScore',
    },
    {
      title: '内审员',
      dataIndex: 'reviewPersonName',
    },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, operateRequest } = useListPage({
    designScope: 'equipmentManage-ledger-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (isSecuritySector !== '1') {
            getForm().setFieldsValue({
              orgCode: orgCodeStr(userInfo.value.orgCode),
            });
          }
        },
      },
      showIndexColumn: true,
      rowSelection: {
        fixed: 'left',
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['reviewTimeStart'] = time[0];
          params['reviewTimeEnd'] = time[1];
          delete params['time'];
        }
        return params;
      },
      actionColumn: {
        width: 280,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  onMounted(() => {
    get3DepartList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      if (isSecuritySector !== '1') {
        getForm().setFieldsValue({
          orgCode: orgCodeStr(userInfo.value.orgCode),
        });
      }
      reload();
    });
  });
  const orgCodeStr = (code) => {
    if (code.length > 9) {
      return code.slice(0, 9);
    } else if (code.length < 9) {
      return undefined;
    }
    return code;
  };
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '评分',
        auth: ['safetyStandardization-safetyReviewForm:review'],
        ifShow: record.status !== '2',
        onClick: handleReview.bind(null, record),
      },
      {
        label: '下载',
        auth: ['safetyStandardization-safetyReviewForm:download'],
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '删除',
        auth: ['safetyStandardization-safetyReviewForm:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const getDropdownActions = (record: any) => {
    return [
      {
        label: '问题清单',
        auth: ['safetyStandardization-safetyReviewForm:downloadQuestion'],
        onClick: handleQuestionDownload.bind(null, record),
      },
      {
        label: '上传整改报告',
        auth: ['safetyStandardization-safetyReviewForm:uploadRectifyReport'],
        onClick: handleUploadRectifyReport.bind(null, record),
      },
      {
        label: '下载整改报告',
        onClick: handleDownloadReport.bind(null, record, 'repairReportFile'),
      },
      {
        label: '上传分析报告',
        auth: ['safetyStandardization-safetyReviewForm:uploadAnalysisReport'],
        onClick: handleUploadAnalysisReport.bind(null, record),
      },
      {
        label: '下载分析报告',
        onClick: handleDownloadReport.bind(null, record, 'analysisReportFile'),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      title: '新增评审',
    });
  };
  const handleView = (data: any) => {
    openReviewModal(true, {
      title: '安全生产标准化内审表 - ' + data.orgName,
      data,
      isView: true,
    });
  };
  const handleReview = (data: any) => {
    openReviewModal(true, {
      title: '安全生产标准化内审表 - ' + data.orgName,
      data,
    });
  };

  const handleUploadRectifyReport = (record: any) => {
    openUploadModal(true, { record, reportType: 'repair' });
  };

  const handleUploadAnalysisReport = (record: any) => {
    openUploadModal(true, { record, reportType: 'analysis' });
  };
  const handleDownloadReport = (record: any, key) => {
    if (!record[key]) {
      createMessage.warning('暂无报告');
      return;
    }
    downloadFile(record[key]);
  };
  const handleDownload = (data: any) => {
    // 导出逻辑
    handleExportXlsx(`${data.orgName}-标准化评审表`, '/ss/ssStandardReview/download', {
      id: data.id,
    });
  };
  const handleQuestionDownload = (data) => {
    handleExportXlsx(`审查问题清单-${data.orgName}`, '/ss/ssStandardReview/downloadProblemList', {
      id: data.id,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(
      () => deleteBatch({ ids: selectedRowKeys.value.join(',') }),
      {
        confirm: true,
        isBatch: true,
      },
      handleSuccess
    );
  };
  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ id: data.id }),
      {
        confirm: true,
        isBatch: false,
      },
      handleSuccess
    );
  };
</script>
<style lang="less" scoped></style>
