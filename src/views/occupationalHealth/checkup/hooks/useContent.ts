import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { physicalExaminationList, physicalExaminationDel, physicalExaminationStatistics, updState } from '../../api';
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
      title: '所属单位',
      dataIndex: 'orgName',
      width: 130,
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
      width: 140,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '工号',
      dataIndex: 'workNo',
      width: 100,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 80,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 80,
    },
    {
      title: '体检种类',
      dataIndex: 'type',
      slots: { customRender: 'type' },
      width: 100,
    },
    {
      title: '职业危害',
      dataIndex: 'hazardFactors',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
    },
    {
      title: '检查结果',
      dataIndex: 'checkResult',
      slots: { customRender: 'checkResult' },
    },
    {
      title: '无需体检原因',
      dataIndex: 'reason',
      ifShow: () => {
        return tabActive.value == '1';
      },
    },
  ];
  const orgList = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '所属单位',
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
      label: '所属车间',
      field: 'workshop',
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
      label: '岗位', //显示label
      field: 'post', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '姓名', //显示label
      field: 'name', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      ifShow: (schema) => {
        return tabActive.value == '1';
      },
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '完成',
            value: '2',
          },
          {
            label: '待体检',
            value: '3',
          },
          {
            label: '无需体检',
            value: '1',
          },
        ],
      },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      ifShow: (schema) => {
        return tabActive.value != '1';
      },
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '完成',
            value: '2',
          },
          {
            label: '待体检',
            value: '3',
          },
        ],
      },
    },
    {
      label: '检查结果',
      field: 'checkResult',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '未见异常',
            value: '1',
          },
          {
            label: '疑似职业病',
            value: '2',
          },
          {
            label: '禁忌证',
            value: '3',
          },
          {
            label: '其他疾患',
            value: '4',
          },
          {
            label: '复查',
            value: '5',
          },
        ],
      },
    },
    {
      label: '体检种类',
      field: 'type',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '岗前',
            value: '1',
          },
          {
            label: '在岗',
            value: '2',
          },
          {
            label: '离职',
            value: '3',
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
      api: physicalExaminationList,
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
      rowSelection: { type: 'checkbox' },
      actionColumn: {
        width: 270,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
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
    physicalExaminationStatistics(params).then((res) => {
      statisticsData.value = res;
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '上传',
        auth: 'occupationalHealth:checkup:edit',
        onClick: handleUp.bind(null, record),
      },
      {
        label: '编辑',
        auth: 'occupationalHealth:checkup:edit1',
        onClick: handleEdit.bind(null, record),
        ifShow: record.editStatus === '1',
      },
      {
        label: '删除',
        color: 'error',
        auth: 'occupationalHealth:checkup:del',
        onClick: handleDel.bind(null, record),
      },
      {
        label: '无需体检',
        ifShow: record.status === '待体检' && tabActive.value === '1',
        auth: 'occupationalHealth:checkup:uncheck',
        onClick: handleUpdState.bind(null, record, 1),
      },
      {
        label: '需要体检',
        ifShow: record.status === '无需体检' && tabActive.value === '1',
        auth: 'occupationalHealth:checkup:check',
        onClick: handleUpdState.bind(null, record, 3),
      },
      {
        label: '查看',
        auth: 'occupationalHealth:checkup:review',
        onClick: handleReview.bind(null, record),
      },
    ];
  }

  function handleReview(record) {
    openDrawer(true, { title: '详情', record });
  }
  function handleUp(record) {
    openDrawer(true, { title: '上传', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        physicalExaminationDel({ id: record.id }).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  function batchDel() {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        physicalExaminationDel({ id: selectedRowKeys.value.join(',') }).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  function handleUpdState(record, state) {
    curRecord.value = record;
    if (state == 1) {
      openNocheck.value = true;
      return;
    }
    Modal.confirm({
      title: '确认要恢复体检吗?',
      onOk() {
        updState({ id: record.id, state: state }).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
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
  const noCheckOk = () => {
    noCheckFormRef.value?.validate().then(() => {
      updState({ id: curRecord.value.id, state: 1, reason: formState.value.reason }).then(() => {
        reload();
        openNocheck.value = false;
        formState.value.reason = undefined;
      });
    });
  };
  const noCheckCancel = () => {
    openNocheck.value = false;
    formState.value.reason = undefined;
  };
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
    batchDel,
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
    noCheckOk,
    noCheckCancel,
    noCheckFormRef,
  };
};
