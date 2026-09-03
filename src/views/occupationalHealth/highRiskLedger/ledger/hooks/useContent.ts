import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { archivesPageList, archivesDel } from '../../api';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useUserStore } from '/@/store/modules/user';
import { ref } from 'vue';
export const useContent = () => {
  const userStore: any = useUserStore();
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '单位',
      dataIndex: 'orgCode',
      width: 130,
      resizable: true,
    },
    {
      title: '车间/科室',
      dataIndex: 'workshop',
      width: 100,
      resizable: true,
    },
    {
      title: '姓名',
      dataIndex: 'userName',
      width: 100,
      resizable: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 90,
      resizable: true,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 90,
      resizable: true,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      width: 100,
      resizable: true,
    },
    {
      title: '疾病或指标',
      dataIndex: 'disease',
      width: 100,
      resizable: true,
    },
    {
      title: '数值',
      width: 90,
      dataIndex: 'numValue',
      resizable: true,
    },
    
    {
      title: '互保人员',
      width: 100,
      dataIndex: 'mutualInsurancePersonName',
      resizable: true,
    },
    {
      title: '采取的措施',
      dataIndex: 'measures',
      resizable: true,
    },
    {
      title: '检测状态',
      dataIndex: 'status',
      width: 140,
      slots: { customRender: 'status' },
    },
  ];
  const orgOptions = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        allowClear: true,
        api: async () => {
          const res = await getDepart3ListWithSecurity();
          orgOptions.value = res;
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
          }
          getForm().updateSchema([
            {
              field: 'disease',
              componentProps: {
                options: userStore.getAllDictItems.diseases_types,
                fieldNames: {
                  label: 'label',
                  value: 'value',
                },
              },
            },
          ]);
          return res;
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        onChange: (value) => {
          if (Array.isArray(value)) return;
          selectDeptNew({ orgCode: value }).then((res) => {
            getForm().setFieldsValue({
              workshop: '',
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
    {
      label: '所属车间',
      field: 'workshop',
      component: 'Select',
      ifShow: false,
      componentProps: {
        placeholder: '请选择',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
    {
      label: '姓名', //显示label
      field: 'userName', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '疾病或指标',
      field: 'disease',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        allowClear: true
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
            label: '未检测',
            value: '0',
          },
          {
            label: '正常',
            value: '1',
          },
        ],
      },
    }
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerCheckIn, { openDrawer: checkInOpen }] = useDrawer();
  const [registerCheckModal, { openModal }] = useModal();

  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: archivesPageList,
      immediate: true,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
      },
      beforeFetch: (params) => {
        queryParams.value = params;
        return params;
      },
      showIndexColumn: true,
      rowSelection: { type: 'checkbox' },
      actionColumn: {
        width: 220,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '职业健康监护档案';
        return name;
      },
      url: '/archives/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/riskPersonTent/import',
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
      {
        label: '查看',
        onClick: handleReview.bind(null, record),
      },
      {
        label: '编辑',
        auth: 'highRiskLedger:ledger:edit',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: 'highRiskLedger:ledger:del',
        onClick: handleDel.bind(null, record),
      },
      {
        label: '检测记录',
        auth: 'highRiskLedger:ledger:check',
        ifShow: !!record.latestItem && !record.inputTag,
        onClick: handleCheck.bind(null, record),
      },
    ];
  }
  function handleReview(record) {
    openDrawer(true, { title: '详情', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleCheck(record) {
    openModal(true, { title: '检测记录', data: JSON.parse(JSON.stringify(record)) });
  }
 
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        archivesDel({ id: record.id }).then(() => {
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
        archivesDel({id: selectedRowKeys.value.toString()}).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  const add = () => {
    openDrawer(true, { title: '新增' });
  };
  const updateCode = (code) => {
    orgcode.value = code;
    console.log(orgcode.value);
  };
  function resetFunc() {
    if(orgOptions.value.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgOptions.value[0].orgCode,
      });
    }
  }
  return {
    add,
    reload,
    getForm,
    updateCode,
    onExportXls,
    onImportXls,
    rowSelection,
    getSelectRows,
    registerTable,
    getTableAction,
    registerDrawer,
    openModal,
    batchDel,
    selectedRowKeys,
    registerCheckModal,
    registerCheckIn,
    checkInOpen,
  };
};
