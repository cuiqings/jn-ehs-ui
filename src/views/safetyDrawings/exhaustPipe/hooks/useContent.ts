import { list, del, deleteBatch, getOrganizationNew } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { createVNode, ref } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { dateFormat } from '/@/utils/common/compUtils';
import { useMethods } from '/@/hooks/system/useMethods';
import { useModal } from '/@/components/Modal';
import exhaustPipe from '/@/assets/images/risk/exhaustPipe.png'; // 排气筒
export const useContent = () => {
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const visible = ref(false);
  const info = ref({
    trainingResults: '',
    scoreScreenshot: '',
  });
  const orgOptions = ref<any[]>([]);
  /* 顶部搜索栏信息 */
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属机构',
      field: 'org',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '排放口编号',
      field: 'outletNo',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '排放口名称',
      field: 'outletName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '工况风量',
      field: 'operatingAirVolume',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '标况风量',
      field: 'standardAirVolume',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  /* 表格的每一列 */
  const columns = <BasicColumn[]>[
    {
      title: '标记位置',
      dataIndex: 'markFlag',
      slots: { customRender: 'markFlag' },
    },
    {
      title: '所属机构',
      dataIndex: 'orgName',
    },
    {
      title: '排放口编号',
      dataIndex: 'outletNo',
    },
    {
      title: '排放口名称',
      dataIndex: 'outletName',
    },
    {
      title: '工况风量(m³/h)',
      dataIndex: 'operatingAirVolume',
    },
    {
      title: '标况风量(m³/h)',
      dataIndex: 'standardAirVolume',
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['exhaustPipe:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: ['exhaustPipe:del'],
        onClick: onDel.bind(null, record),
      },
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls, operateRequest } = useListPage({
    designScope: 'exhaustPipe-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
      handleSearchInfoFn: (params) => {
        if (orgOptions.value.length === 1) {
          params.org = orgOptions.value[0].value;
          getForm().setFieldsValue({
            org: orgOptions.value[0].value,
          });
        }
        return params;
      },
      showIndexColumn: true,
      rowKey: 'id',
      rowSelection: { type: 'checkbox' },
      actionColumn: {
        width: 250,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '排气筒台账-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/exportXls',
    },
    importConfig: {
      url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/importExcel',
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

  // 新增
  const onAdd = () => {
    openDrawer(true, {
      title: '新增',
      type: 'add',
      showOkBtn: true,
      showFooter: true,
      orgOptions: orgOptions.value,
    });
  };
  // 查看
  const onView = (data) => {
    openDrawer(true, {
      title: '查看',
      type: 'view',
      showOkBtn: false,
      showFooter: true,
      data,
      orgOptions: orgOptions.value,
    });
  };
  // 编辑
  const onEdit = (data) => {
    openDrawer(true, {
      title: '编辑',
      type: 'edit',
      showOkBtn: true,
      showFooter: true,
      data,
      orgOptions: orgOptions.value,
    });
  };
  // 删除
  const onDel = (data) => {
    operateRequest(() => del({ id: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };

  const batchDelete = (params) => {
    operateRequest(() => deleteBatch({ ids: params }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleSuccess = () => {
    reload();
  };
  const init = () => {
    getOrganizationNew().then((res) => {
      const { setFieldsValue, updateSchema } = getForm();
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'org',
        componentProps: {
          options: orgOptions.value,
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          org: orgOptions.value[0].value,
        });
      }
      reload();
    });
  };
  init();
  const onDownload = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('排气筒台账模板', '/jnRiskExhaustPipe/jnRiskExhaustPipe/template');
  };
  const handleMarkModal = (data: any) => {
    console.log('data:', data);
    openModal(true, {
      ballArr: [
        {
          x: data.x,
          y: data.y,
          size: data.size,
        },
      ],
      title: '排气筒位置标记',
      type: 'view',
      icon: exhaustPipe,
      org: data.org,
    });
  };
  return {
    getActions,
    registerTable,
    rowSelection,
    selectedRowKeys,
    reload,
    onAdd,
    batchDelete,
    handleSuccess,
    registerDrawer,
    visible,
    info,
    onExportXls,
    onImportXls,
    onDownload,
    handleMarkModal,
    registerModal,
  };
};
export default useContent;
