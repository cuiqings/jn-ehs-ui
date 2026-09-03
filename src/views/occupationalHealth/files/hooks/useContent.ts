import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { archivesPageList, archivesDel, fileStatistics, hazardFactors, updateStatusFc } from '../../api';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
export const useContent = () => {
  const tabActive = ref('0');
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgName',
      width: 130,
      resizable: true,
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
      width: 140,
      resizable: true,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      width: 100,
      resizable: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
      resizable: true,
    },
    {
      title: '工号',
      dataIndex: 'workNo',
      width: 100,
      resizable: true,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      resizable: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
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
      title: '籍贯',
      dataIndex: 'nativePlace',
      resizable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      slots: { customRender: 'status' },
    },
  ];
  const orgOptions = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        allowClear: true,
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
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '未完成',
            value: '0',
          },
          {
            label: '完成',
            value: '1',
          },
        ],
      },
    },
    {
      label: '危害因素',
      field: 'hzys',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        allowClear: true,
        api: async () => {
          const res = await hazardFactors();
          let arr = res.map((val) => {
            return {
              label: val.name,
              value: val.id,
            };
          });
          return arr;
        },
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
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: archivesPageList,
      immediate: false,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
        style: {
          marginBottom: 0,
        },
      },
      beforeFetch: (params) => {
        if (orgOptions.value && orgOptions.value.length == 1 && !params.orgCode) {
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].orgCode,
          });
          params.orgCode = orgOptions.value[0].orgCode;
        }
        queryParams.value = params;
        params.statusFc = tabActive.value;
        getFileStatistics(params);
        return params;
      },
      showIndexColumn: true,
      rowSelection: { type: 'checkbox' },
      actionColumn: {
        width: 160,
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
      url: '/archives/import',
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
    getForm().updateSchema([
      {
        field: 'orgCode',
        componentProps: {
          options: res,
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
                  }
                }
              ]);
            });
          }
        }
      }
    ]);
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
            }
          }
        ]);
      });
    }
    reload();
  }

  const statisticsData = ref({
    joinCount: 0,
    entryCount: 0,
    entryRatio: 0,
  });
  function getFileStatistics(params) {
    fileStatistics(params).then((res) => {
      statisticsData.value = res;
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '查看',
        auth: 'occupationalHealth:files:review',
        onClick: handleReview.bind(null, record),
      },
    ];
  }
  function getDropDownAction(record) {
    return [
      {
        label: '编辑',
        auth: 'occupationalHealth:files:edit',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: 'occupationalHealth:files:del',
        onClick: handleDel.bind(null, record),
      },
      {
        label: '封存',
        ifShow: tabActive.value == '0',
        auth: 'occupationalHealth:files:seal',
        onClick: handleSeal.bind(null, record),
      },
      {
        label: '取消封存',
        ifShow: tabActive.value == '1',
        auth: 'occupationalHealth:files:unseal',
        onClick: handleUnSeal.bind(null, record),
      },
      {
        label: '检测录入',
        auth: 'occupationalHealth:files:check',
        onClick: handleCheck.bind(null, record),
      },
      {
        label: '编辑录入',
        auth: 'occupationalHealth:files:check',
        onClick: handleEditCheck.bind(null, record),
      },
      // {
      //   label: '新增体检',
      //   auth: 'occupationalHealth:files:addcheck',
      //   onClick: handleAddHeck.bind(null, record),
      // },
    ];
  }

  function handleReview(record) {
    openDrawer(true, { title: '详情', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleCheck(record) {
    checkInOpen(true, { title: '检测录入', data: JSON.parse(JSON.stringify(record)) });
  }
  function handleEditCheck(record) {
    checkInOpen(true, { title: '编辑录入', data: JSON.parse(JSON.stringify(record)) });
  }
  function handleAddHeck(record) {
    openModal(true, { title: '新增体检', data: JSON.parse(JSON.stringify(record)) });
  }
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        archivesDel({ ids: [record.id] }).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  function handleSeal(record) {
    Modal.confirm({
      title: '确定要封存吗?',
      onOk() {
        updateStatusFc({ id: record.id, statusFc: 1 }).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  function handleUnSeal(record) {
    Modal.confirm({
      title: '确定要取消封存吗?',
      onOk() {
        updateStatusFc({ id: record.id, statusFc: 0 }).then(() => {
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
        archivesDel({ ids: selectedRowKeys.value }).then(() => {
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
    // if(depa)
    // getForm().setFieldsValue({
    //   orgCode: orgOptions.value[0].orgCode,
    // });
  }
  return {
    add,
    reload,
    getForm,
    tabActive,
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
    statisticsData,
    getDropDownAction,
  };
};
