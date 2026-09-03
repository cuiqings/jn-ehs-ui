import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { useUserStore } from '/@/store/modules/user';
import { declareDelete, declareList } from '../../api';
import { ref } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
export const useContent = () => {
  const userStore = useUserStore();
  const userInfo = userStore.getUserInfo;
  const orgList = ref<any[]>([]);
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgCodeName',
      width: 130,
      resizable: true,
    },
    // {
    //   title: '所属车间',
    //   dataIndex: 'workshopName',
    //   width: 140,
    //   resizable: true,
    // },
    {
      title: '月度',
      dataIndex: 'month',
      width: 140,
      resizable: true,
    },
    {
      title: '新增人数',
      dataIndex: 'addNum',
      width: 140,
      resizable: true,
    },
    {
      title: '减员人数',
      dataIndex: 'decreaseNum',
      width: 140,
      resizable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      slots: { customRender: 'status' },
    },
  ];
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        api: async () => {
          const res = await getDepart3ListWithSecurity();
          if (res.length == 1) {
            console.log(res[0].orgCode);
            getForm().setFieldsValue({
              orgCode: res[0].orgCode,
            });
            selectDeptNew({ orgCode: res[0].orgCode }).then((dres) => {
              getForm().updateSchema([
                {
                  field: 'workshop',
                  componentProps: {
                    options: dres,
                  },
                },
              ]);
            });
            orgList.value = res;
          }
          reload();
          return res;
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
    {
      label: '月度',
      field: 'month',
      component: 'DatePicker',
      componentProps: {
        picker: 'month',
        formatl: 'YYYYMM',
        valueFormat: 'YYYYMM',
        placeholder: '请选择',
        style: { width: '100%' },
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
            label: '待审核',
            value: '1',
          },
          {
            label: '已上报',
            value: '2',
          },
        ],
      },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerCheckModal, { openModal }] = useModal();

  const { createConfirm } = useMessage();
  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      api: declareList,
      immediate: true,
      columns: columns,
      rowKey: 'id',
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
        labelCol: { span: 2 },
      },
      beforeFetch: (params) => {
        queryParams.value = params;
        if (orgList.value.length == 1) {
          params.orgCode = orgList.value[0].orgCode;
          getForm().setFieldsValue({
            orgCode: orgList.value[0].orgCode,
          });
        }
        return params;
      },
      showIndexColumn: true,
      actionColumn: {
        width: 130,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
      rowSelection: {
        type: 'checkbox',
      },
    },
    importConfig: {
      url: '/declare/import',
      success: () => {
        reload();
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      // {
      //   label: '上报',
      //   auth: 'insurance:declaration:report',
      //   onClick: handleEdit.bind(null, record),
      //   ifShow: () => {
      //     return record.status == '1';
      //   },
      // },
      {
        label: '审核',
        auth: 'insurance:declaration:check',
        onClick: handleCheck.bind(null, record),
        ifShow: () => {
          return record.status == '1' && record.approver == userInfo.id;
        },
      },
      {
        label: '查看',
        onClick: handleReview.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        onClick: handleDelete.bind(null, record),
      },
    ];
  }

  function handleCheck(record) {
    openModal(true, { title: '审核工伤保险申报信息', data: JSON.parse(JSON.stringify(record)) });
  }
  function handleReview(record) {
    openDrawer(true, { title: '查看', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleDelete(record) {
    createConfirm({
      iconType: 'warning',
      title: '确认删除吗？',
      onOk: async () => {
        await declareDelete(record.id)
          .then(() => {
            reload();
          })
          .catch(() => {});
      },
      onCancel: () => {},
    });
  }

  const updateCode = (code) => {
    orgcode.value = code;
    console.log(orgcode.value);
  };
  function resetFunc() {
    // if(depa)
  }
  return {
    reload,
    getForm,
    updateCode,
    onExportXls,
    onImportXls,
    getSelectRows,
    registerTable,
    getTableAction,
    selectedRowKeys,
    openDrawer,
    rowSelection,
    registerDrawer,
    openModal,
    registerCheckModal,
  };
};
