import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { splitList, composeStatistics } from '../../api';
import type { FormInstance } from 'ant-design-vue';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref } from 'vue';
export const useContent = () => {
  const tabActive = ref('1');
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '年份',
      dataIndex: 'year',
      width: 130,
    },
    {
      title: '单位名称',
      dataIndex: 'orgCodeName',
      width: 130,
    },
    {
      title: '目标内容',
      dataIndex: 'content',
      width: 230,
    },
    {
      title: '上级要求',
      dataIndex: 'upValue',
      width: 100,
    },
    {
      title: '预警',
      dataIndex: 'earlyWarning',
      width: 100,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      width: 100,
    },
     {
      title: '状态',
      dataIndex: 'fjStatus',
      width: 90,
    }
  ];
  const orgList = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '年份',
      field: 'year',
      component: 'DatePicker',
      defaultValue: dayjs().format('YYYY'),
      componentProps: {
        placeholder: '请选择',
        picker: 'year',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        format: 'YYYY',
        valueFormat: 'YYYY',
        style: { width: '100%' },
      },
    },
    {
      label: '单位名称',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '待分解',
            value: '0',
          },
          {
            label: '已分解',
            value: '1',
          },
        ],
      },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerCheckIn, { openDrawer: checkInOpen }] = useDrawer();
  const [registerCheckModal, { openModal }] = useModal();

  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  const orgOptions = ref<any[]>([]);
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: splitList,
      immediate: false,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
      },
      beforeFetch: (params) => {
        if (orgOptions.value && orgOptions.value.length == 1 && !params.orgCode) {
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].orgCode,
          });
          params.orgCode = orgOptions.value[0].orgCode;
        }
        queryParams.value = params;
        queryParams.value.dataType = tabActive.value;
        getFileStatistics(params);
        return params;
      },
      showIndexColumn: true,
      actionColumn: {
        width: 100,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '职业健康体检';
        return name;
      },
      url: '/physicalExamination/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/physicalExamination/import',
      data: () => {
        return {};
      },
      success: () => {
        reload();
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  pageInit();
  async function pageInit() {
    const res = await getDepart3ListWithSecurity();
    orgOptions.value = res;
    getForm().updateSchema([
      {
        field: 'orgCode',
        componentProps: {
          options: res,
          onChange: (value) => {
            if (Array.isArray(value)) return;
            selectDeptNew({ orgCode: value }).then((res) => {
              getForm().setFieldsValue({
                workshop: undefined
              });
              getForm().updateSchema([
                {
                  field: 'workshop',
                  componentProps: {
                    options: res,
                  },
                },
              ]);
            });
          },
        },
      },
    ]);
    if (res.length == 1) {
      getForm().setFieldsValue({
        orgCode: res[0].orgCode,
      });
      selectDeptNew({ orgCode: res[0].orgCode }).then((res) => {
        getForm().updateSchema([
          {
            field: 'workshop',
            componentProps: {
              options: res,
            },
          },
        ]);
      });
    }
    reload();
  }
  const statisticsData = ref({
    total: 0,
    waitDetection: 0,
    already: 0,
    ratio: '',
    wait: 0,
  });
  function getFileStatistics(params) {
    composeStatistics(params).then((res) => {
      statisticsData.value = res;
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '分解',
        auth: 'splitGoal:split',
        onClick: handleSplit.bind(null, record),
        ifShow: record.fjStatus == '待分解',
      },
      {
        label: '修改分解',
        auth: 'splitGoal:edit',
        onClick: handleEdit.bind(null, record),
        ifShow: record.fjStatus != '待分解',
      },
      {
        label: '查看',
        onClick: handleReview.bind(null, record),
        ifShow: record.fjStatus != '待分解',
      },
    ];
  }

  function handleReview(record) {
    openDrawer(true, { title: '详情', record });
  }

  function handleSplit(record) {
    openDrawer(true, { title: '分解', record: JSON.parse(JSON.stringify(record)) });
  }
 
  function handleEdit(record) {
    openDrawer(true, { title: '编辑分解', record: JSON.parse(JSON.stringify(record)) });
  }
  
  const updateCode = (code) => {
    orgcode.value = code;
    console.log(orgcode.value);
  };
  function resetFunc() {
    if (orgList.value?.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgList.value[0].orgCode,
      });
    }
  }
  const submitSuccess = () => {
    reload();
    selectedRowKeys.value = [];
  };
  const tabClick = (key) => {
    tabActive.value = key;
    reload();
    getForm().resetFields();
  };

  // 无需体检逻辑
  const openNocheck = ref(false);
  const formState = ref({ reason: undefined });
  const noCheckFormRef = ref<FormInstance | null>(null);
  const curRecord = ref<any>({});
  
  return {
    getForm,
    // departList,
    tabClick,
    tabActive,
    updateCode,
    onExportXls,
    onImportXls,
    rowSelection,
    selectedRowKeys,
    getSelectRows,
    registerTable,
    getTableAction,
    registerDrawer,
    openModal,
    registerCheckModal,
    registerCheckIn,
    checkInOpen,
    submitSuccess,
    statisticsData,
    openNocheck,
    formState,
    noCheckFormRef,
  };
};
