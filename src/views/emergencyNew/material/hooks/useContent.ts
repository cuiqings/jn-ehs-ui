import { getDepart3ListWithSecurity } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { suppliesPageList, suppliesDel } from '../../api';
import { getEduOrgList, selectDeptNew } from '/@/api/common/api';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref } from 'vue';
export const useContent = () => {
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '物资类别',
      dataIndex: 'categoryName',
      width: 170,
    },
    {
      title: '所属单位',
      dataIndex: 'orgCodeName',
      width: 130,
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
      width: 140,
    },
    {
      title: '位置（使用岗位）',
      dataIndex: 'location',
      width: 140,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 140,
    },
    {
      title: '型号',
      dataIndex: 'model',
      width: 140,
    },
    {
      title: '数量',
      dataIndex: 'number',
      width: 140,
    },
    {
      title: '责任人',
      dataIndex: 'dutyUserName',
      width: 140,
    },
    {
      title: '检验日期',
      dataIndex: 'checkDateStr',
      width: 180,
    },
    {
      title: '检验有效期',
      dataIndex: 'expirationDateStr',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
    },
  ];
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '所属车间',
      field: 'orgCode',
      show: false,
      component: 'Input',
    },
    {
      label: '所属车间',
      field: 'workshop',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        fieldNames: {
          label: 'title',
          value: 'key',
          children: 'children',
        },
      },
    },
    {
      label: '物资类别',
      field: 'category',
      component: 'JDictSelectTag',
      componentProps: {
        placeholder: '请选择状态',
        dictCode: 'yj_wz_type',
        mode: 'multiple',
      },
    },
    {
      label: '位置（使用岗位）', //显示label
      field: 'location', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '类型', //显示label
      field: 'type', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '型号', //显示label
      field: 'model', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '责任人', //显示label
      field: 'dutyUserName', //查询字段
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
            label: '正常',
            value: '1',
          },
          {
            label: '过期',
            value: '2',
          },
        ],
      },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerCheckModal, { openModal }] = useModal();

  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      api: suppliesPageList,
      immediate: false,
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
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '应急物资';
        return name;
      },
      url: '/emergencySupplies/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/emergencySupplies/import',
      data: () => {
        return {};
      },
      success: () => {
        reload();
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }, { rowSelection }] = tableContext;

  const init = async (code) => {
    console.log(code);
    await getForm().setFieldsValue({
      orgCode: code,
    });
    getWorkShop(code);
    reload();
  };
  async function getWorkShop(code) { 
    let res = await selectDeptNew({ orgCode: code });
      await getForm().updateSchema({
        field: 'workshop',
        componentProps: {
          placeholder: '请选择',
          options: res,
           fieldNames: {
            label: 'departName',
            value: 'orgCode',
          }
        }
      })
  }

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '查看',
        auth: 'emergencyNew:material:review',
        onClick: handleReview.bind(null, record),
      },
      {
        label: '编辑',
        auth: 'emergencyNew:material:edit',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '检验',
        auth: 'emergencyNew:material:check',
        onClick: handleCheck.bind(null, record),
      },
      {
        label: '删除',
        auth: 'emergencyNew:material:del',
        onClick: handleDel.bind(null, record),
      },
    ];
  }

  function handleReview(record) {
    openDrawer(true, { title: '详情', record });
  }
  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleCheck(record) {
    openModal(true, { title: '检验', data: [record] });
  }
  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        suppliesDel(record.id).then((res) => {
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
  }
  return {
    add,
    init,
    getForm,
    // departList,
    updateCode,
    onExportXls,
    onImportXls,
    rowSelection,
    getSelectRows,
    registerTable,
    getTableAction,
    registerDrawer,
    openModal,
    registerCheckModal,
  };
};
