import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, h } from 'vue';
import { useDrawer } from '/@/components/Drawer';
import { useMethods } from '/@/hooks/system/useMethods';
import { getOrganizationNew, list, del, typeStatistics, statistics, getDeptNew, leaveFactory } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { useModal } from '/@/components/Modal';
import { dateFormat } from '/@/utils/common/compUtils';
export const useMainContent = (tableRef, infoReturnRef) => {
  const { createMessage } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerModal, { openModal }] = useModal();
  const [registerViewModal, { openModal: viewOpenModal }] = useModal();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const activeKey = ref('1');
  // 类型统计
  const typeStatisticsInfo = ref({
    notOrganized: 0,
    training: 0,
    finish: 0,
  });
  // 在用状态统计
  const statisticsInfo = ref({
    notOrganized: 0,
    training: 0,
    timeoutNotCompleted: 0,
  });
  const visible = ref(false);
  const info = ref({
    id: '',
    remark: '',
  });
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '所属车间',
      field: 'departCode',
      component: 'Select',
      ifShow: false,
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '人员姓名',
      field: 'userName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '用工方式',
      field: 'employmentType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '正式工', value: '1' },
          { label: '劳务派遣', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '工作证号',
      field: 'workNo',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 200,
      align: 'center',
      dataIndex: 'orgCode_dictText',
    },
    {
      title: '车间/科室',
      width: 150,
      align: 'center',
      dataIndex: 'departCode_dictText',
    },
    {
      title: '人员姓名',
      width: 200,
      align: 'center',
      dataIndex: 'userName',
    },
    {
      title: '职务/工种',
      width: 150,
      align: 'center',
      dataIndex: 'duties',
    },
    {
      title: '用工方式',
      width: 150,
      align: 'center',
      dataIndex: 'employmentType',
      customRender: ({ text }) => {
        return text === '1' ? '正式工' : text === '2' ? '劳务派遣' : '';
      },
    },
    {
      title: '工作证号',
      width: 150,
      align: 'center',
      dataIndex: 'workNo',
    },
    {
      title: '联系方式',
      width: 200,
      dataIndex: 'phone',
    },
    {
      title: '身份证号',
      width: 250,
      dataIndex: 'idCard',
    },
  ];
  const columns1 = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 200,
      align: 'center',
      dataIndex: 'orgCode_dictText',
    },
    {
      title: '车间/科室',
      width: 150,
      align: 'center',
      dataIndex: 'departCode_dictText',
    },
    {
      title: '人员姓名',
      width: 200,
      align: 'center',
      dataIndex: 'userName',
    },
    {
      title: '用工方式',
      width: 150,
      align: 'center',
      dataIndex: 'employmentType',
      customRender: ({ text }) => {
        return text === '1' ? '正式工' : text === '2' ? '劳务派遣' : '';
      },
    },
    {
      title: '工作证号',
      width: 150,
      align: 'center',
      dataIndex: 'workNo',
    },
    {
      title: '联系方式',
      width: 200,
      dataIndex: 'phone',
    },
    {
      title: '培训时间',
      width: 350,
      dataIndex: 'trainingStrTime',
      customRender: (data: any) => {
        return data.record.trainingStrTime ? data.record.trainingStrTime + '至' + data.record.trainingEndTime : '';
      },
    },
    {
      title: '培训状态',
      width: 150,
      dataIndex: 'trainingStatus',
      customRender: ({ text }) => {
        return text === '1' ? '正常' : text === '2' ? h('span', { style: { color: 'red' } }, '超时') : h('span', { style: { color: 'red' } }, '离厂');
      },
    },
  ];
  const columns2 = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 200,
      align: 'center',
      dataIndex: 'orgCode_dictText',
    },
    {
      title: '车间/科室',
      width: 150,
      align: 'center',
      dataIndex: 'departCode_dictText',
    },
    {
      title: '人员姓名',
      width: 200,
      align: 'center',
      dataIndex: 'userName',
    },
    {
      title: '用工方式',
      width: 150,
      align: 'center',
      dataIndex: 'employmentType',
      customRender: ({ text }) => {
        return text === '1' ? '正式工' : text === '2' ? '劳务派遣' : '';
      },
    },
    {
      title: '工作证号',
      width: 150,
      align: 'center',
      dataIndex: 'workNo',
    },
    {
      title: '联系方式',
      width: 200,
      dataIndex: 'phone',
    },
    {
      title: '培训时间',
      width: 350,
      dataIndex: 'trainingStrTime',
      customRender: (data: any) => {
        return data.record.trainingStrTime ? data.record.trainingStrTime + '至' + data.record.trainingEndTime : '';
      },
    },
    {
      title: '培训状态',
      width: 150,
      dataIndex: 'trainingStatus',
      customRender: ({ text }) => {
        return text === '1' ? '正常' : text === '2' ? h('span', { style: { color: 'red' } }, '超时') : h('span', { style: { color: 'red' } }, '离厂');
      },
    },
    {
      title: '备注',
      width: 200,
      dataIndex: 'remark',
    },
  ];
  const handleSuccess = () => {
    nextTick(() => {
      selectedRowKeys.value = [];
      reload();
      initStatistics();
      initTypeStatistics();
    });
  };
  const { tableContext, onImportXls, onExportXls, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        autoAdvancedCol: 3,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'departCode',
              componentProps: {
                options: [],
              },
            });
          }
        },
      },
      showIndexColumn: true,
      immediate: false,
      indexColumnProps: {
        fixed: 'left',
      },
      rowSelection: {
        fixed: 'left',
      },
      beforeFetch: (params) => {
        params.status = activeKey.value;
        return params;
      },
      handleSearchInfoFn: () => {
        initTypeStatistics();
        initStatistics();
      },
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/edu/employeeEntry/import',
      data: () => {
        return {
          status: activeKey.value,
        };
      },
      success: handleSuccess,
    },
    exportConfig: {
      name: '新员工培训-已结束-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/edu/employeeEntry/export',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { getForm, reload, setColumns }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const init = () => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res;
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          onChange: (value) => {
            getForm().updateSchema({
              field: 'departCode',
              componentProps: {
                options: [],
              },
            });
            getForm().setFieldsValue({
              departCode: undefined,
            });
            if (value) {
              getDepartList(value);
            }
          },
        },
      });
      reload();
      initTypeStatistics();
      initStatistics();
    });
  };
  onMounted(() => {
    init();
  });
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'departCode',
        componentProps: {
          options: departOptions.value,
        },
      });
    });
  };
  // 类型统计
  const initTypeStatistics = async () => {
    typeStatistics().then((res) => {
      if (res) {
        typeStatisticsInfo.value = res;
      }
    });
  };
  // 在用状态统计
  const initStatistics = async () => {
    statistics().then((res) => {
      if (res) {
        statisticsInfo.value = res;
      }
    });
  };
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['newsUserTraining:edit'],
        ifShow: activeKey.value === '1',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['newsUserTraining:del'],
        ifShow: activeKey.value === '1' || (activeKey.value === '3' && record.trainingStatus === '3'),
        onClick: handleDelete.bind(null, record),
      },
      {
        label: '组织培训',
        auth: ['newsUserTraining:training'],
        ifShow: activeKey.value === '1',
        onClick: handleTraining.bind(null, [record]),
      },
      {
        label: '离厂',
        auth: ['newsUserTraining:factory'],
        ifShow: activeKey.value === '2' && record.trainingStatus !== '3',
        onClick: handleFactory.bind(null, record),
      },
      {
        label: '查看培训',
        ifShow: activeKey.value === '2' || activeKey.value === '3',
        onClick: handleView.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      title: '新增',
      type: 'add',
      showOkBtn: true,
    });
  };
  const handleEdit = (data: any) => {
    openModal(true, {
      title: '编辑',
      type: 'edit',
      showOkBtn: true,
      data,
    });
  };
  // 组织培训
  const handleTraining = (data: any) => {
    if (data.every((item) => item.orgCode === data[0].orgCode)) {
      openDrawer(true, {
        title: '组织培训',
        type: 'add',
        showOkBtn: true,
        showFooter: true,
        isTraining: true,
        trainObjectPerson: data.map((item) => item.userId),
        trainObject: data.map((item) => item.userName).join(','),
        orgCode: data[0].orgCode,
      });
    } else createMessage.info('请选择同一单位人员组织培训！');
  };
  // 离厂
  const handleFactory = (data: any) => {
    visible.value = true;
    info.value.id = data.id;
    info.value.remark = '';
    nextTick(() => {
      infoReturnRef.value.resetFields();
    });
  };
  const handleSubmit = async () => {
    await infoReturnRef.value.validate();
    leaveFactory(info.value).then((res) => {
      if (res) {
        visible.value = false;
        handleSuccess();
      }
    });
  };
  // 查看培训
  const handleView = (data: any) => {
    viewOpenModal(true, {
      title: '查看培训',
      data: {
        id: data.taskId,
      },
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ ids: data.id }),
      {
        confirm: true,
        isBatch: false,
      },
      () => handleSuccess()
    );
  };
  // tab切换
  const handleTabChange = (key) => {
    activeKey.value = key;
    if (activeKey.value === '3') {
      getForm().updateSchema({
        field: 'departCode',
        ifShow: true,
      });
    } else {
      getForm().updateSchema({
        field: 'departCode',
        ifShow: false,
      });
    }
    getForm().updateSchema({
      field: 'departCode',
      componentProps: {
        options: [],
      },
    });
    nextTick(() => {
      tableRef.value.searchFormRef.advanceState.isAdvanced = false;
      getForm().setFieldsValue({
        orgCode: undefined,
        userName: undefined,
        employmentType: undefined,
        workNo: undefined,
      });
      setColumns(activeKey.value === '1' ? columns : activeKey.value === '2' ? columns1 : columns2);
      handleSuccess();
      initTypeStatistics();
      initStatistics();
    });
  };
  //导入模版下载
  const onExportTemplateXls = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('新员工入职模版', '/edu/employeeEntry/downloadTemplate', {
      status: activeKey.value,
    });
  };
  // 导出
  const onExportPerson = (e) => {
    onExportXls(e)
  }
  return {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onImportXls,
    registerDrawer,
    handleSuccess,
    activeKey,
    handleTabChange,
    onExportTemplateXls,
    handleTraining,
    selectedRowKeys,
    selectedRows,
    registerModal,
    statisticsInfo,
    typeStatisticsInfo,
    visible,
    handleSubmit,
    info,
    registerViewModal,
    onExportPerson
  };
};
export default useMainContent;
