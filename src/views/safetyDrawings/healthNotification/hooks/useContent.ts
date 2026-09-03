import { ref } from 'vue';
import { del, deleteBatch, getOrganizationNew, list, scoreEntry, template } from '../url/index';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { createImgPreview } from '/@/components/Preview/index';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { dateFormat, getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import hazardNotification from '/@/assets/images/risk/hazardNotification.png';
export const useContent = (infoRef: any) => {
  const [registerDrawer, { openDrawer }] = useDrawer();

  const [registerMarkModal, { openModal: openMarkModal }] = useModal();

  const visible = ref(false);
  const info = ref({
    trainingResults: '',
    scoreScreenshot: '',
  });
  const id = ref('');
  const orgOptions = ref<any[]>([]);

  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属区域',
      field: 'region',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '区域等级',
      field: 'regionLevel',
      component: 'JDictSelectTag',
      colProps: { span: 6 },
      componentProps: {
        dictCode: 'area_risk_level',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
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
      title: '所属区域',
      dataIndex: 'region',
    },
    {
      title: '区域等级',
      dataIndex: 'regionLevel_dictText',
    },
    {
      title: '安全标志',
      dataIndex: 'safetySign',
      slots: { customRender: 'safetySign' },
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
        auth: ['healthNotification:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: ['healthNotification:del'],
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
    designScope: 'healthNotification-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      defSort: {
        column: '',
        order: '',
      },
      beforeFetch: (params) => {
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
      name: '职业安全台账-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/riskControl/jnRiskSpace/exportXls',
    },
    importConfig: {
      url: '/riskControl/jnRiskSpace/importExcel',
    },
  });

  //导入模板下载
  function onImportTemplate(file) {
    template(file);
  }

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

  //批量删除
  const batchDelete = (params) => {
    operateRequest(() => deleteBatch({ ids: params }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleSubmit = async () => {
    await infoRef.value.validate();
    scoreEntry({
      id: id.value,
      ...info.value,
    }).then((res) => {
      if (res) {
        visible.value = false;
        handleSuccess();
      }
    });
  };
  const handleSuccess = () => {
    reload();
  };
  const fmtImg = (record: any) => {
    const firstImg = record.safetySign.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  };
  const openImg = (record) => {
    const imageList = record.safetySign.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
    });
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
        field: 'dutyOrg',
        componentProps: {
          options: orgOptions.value,
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          dutyOrg: orgOptions.value[0].value,
        });
      }
      reload();
    });
  };
  init();
  const handleMarkModal = (data: any) => {
    openMarkModal(true, {
      ballArr: [
        {
          x: data.x,
          y: data.y,
          w: data.w,
          h: data.h,
          size: data.size,
        },
      ],
      title: '职业安全位置标记',
      type: 'view',
      icon: hazardNotification,
      org: data.org,
    });
  };
  return {
    getActions,
    registerTable,
    registerMarkModal,
    handleMarkModal,
    rowSelection,
    onAdd,
    onImportTemplate,
    selectedRowKeys,
    batchDelete,
    handleSuccess,
    registerDrawer,
    fmtImg,
    openImg,
    visible,
    handleSubmit,
    info,
    onExportXls,
    onImportXls,
  };
};
export default useContent;
