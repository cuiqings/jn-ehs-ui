import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, h } from 'vue';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { useMethods } from '/@/hooks/system/useMethods';
import { getOrganizationNew, list, del, getDeptNew } from '../url/index';
import { getOrgToWork34 } from '/@/api/common/api';
export const useMainContent = (tableRef) => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerAddDrawer, { openDrawer: openAddDrawer }] = useDrawer();
  const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const applicationUnitList = ref<any[]>([]);
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
    reason: '',
  });
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'TreeSelect',
      componentProps: {
        fieldNames: { label: 'name', value: 'code', children: 'children' },
        treeData: applicationUnitList,
        treeNodeFilterProp: 'title',
      },
      colProps: { span: 6 },
    },
    {
      label: '任务名称',
      field: 'examTaskName',
      component: 'Input',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '考试时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        showTime: true,
      },
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '未开始', value: '1' },
          { label: '进行中', value: '2' },
          { label: '已结束', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 200,
      align: 'center',
      dataIndex: 'orgCode',
    },
    {
      title: '任务名称',
      width: 150,
      align: 'center',
      dataIndex: 'examTaskName',
    },
    {
      title: '考试方式',
      width: 100,
      align: 'center',
      dataIndex: 'examType',
    },
    {
      title: '考试时间',
      width: 320,
      align: 'center',
      dataIndex: 'examStrTime',
      customRender: ({ text, record }) => {
        return record.examStrTime + '~' + record.examEndTime;
      },
    },
    {
      title: '考试试卷',
      width: 180,
      align: 'center',
      dataIndex: 'examPaperName',
      slots: { customRender: 'examPaperName' },
    },
    {
      title: '应参加人员',
      width: 100,
      align: 'center',
      dataIndex: 'personNum',
    },
    {
      title: '参加人员',
      width: 100,
      align: 'center',
      dataIndex: 'attendPersonNum',
    },
    {
      title: '参与率',
      width: 100,
      dataIndex: 'attendRate',
      customRender: ({ text, record }) => {
        return record.attendRate + '%';
      },
    },
    {
      title: '合格率',
      width: 100,
      dataIndex: 'passRate',
      customRender: ({ text, record }) => {
        return record.passRate + '%';
      },
    },
    {
      title: '状态',
      width: 100,
      dataIndex: 'status',
    },
  ];
  const handleSuccess = () => {
    nextTick(() => {
      selectedRowKeys.value = [];
      reload();
    });
  };
  const { tableContext, onImportXls, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 80,
        autoAdvancedCol: 3,
        resetFunc: () => {
          getForm().setFieldsValue({
            orgCode: applicationUnitList.value[0].code,
          });
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
        if (params.time) {
          let arr = params.time.split(',');
          params.strTime = arr[0];
          params.endTime = arr[1];
        }
        return params;
      },
      actionColumn: {
        width: 220,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/edu/employeeEntry/import',
      success: handleSuccess,
    },
  });
  const [registerTable, { getForm, reload, setColumns }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const init = async () => {
    const res = await getOrgToWork34();
    applicationUnitList.value = res;
    getForm().setFieldsValue({
      orgCode: applicationUnitList.value[0].code,
    });
    getForm().updateSchema({
      field: 'orgCode',
      componentProps: {
        options: applicationUnitList.value,
      },
    });
    reload();
  };
  onMounted(() => {
    init();
  });

  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        auth: ['examTask:review'],
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['examTask:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['examTask:del'],
        onClick: handleDelete.bind(null, record),
      },
      {
        label: '扫码考试',
        auth: ['examTask:code'],
        onClick: handleQrcode.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openAddDrawer(true, {
      title: '新增',
      type: 'add',
      showOkBtn: true,
    });
  };
  const handleEdit = (data: any) => {
    openAddDrawer(true, {
      title: '编辑',
      type: 'edit',
      showOkBtn: true,
      data,
    });
  };
  const handleDetail = (data) => {
    openDetailDrawer(true, {
      title: data.examTaskName,
      data,
    });
  };
  const [registerModal, { openModal }] = useModal();
  const handleQrcode = (data) => {
    openModal(true, data);
  };

  const handleSubmit = () => {};
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

  //导入模版下载
  const onExportTemplateXls = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('新员工入职模版', '/edu/employeeEntry/downloadTemplate');
  };
  return {
    registerModal,
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onImportXls,
    registerDrawer,
    handleSuccess,
    onExportTemplateXls,
    selectedRowKeys,
    selectedRows,
    registerAddDrawer,
    statisticsInfo,
    typeStatisticsInfo,
    visible,
    handleSubmit,
    registerDetailDrawer,
    info,
  };
};
export default useMainContent;
