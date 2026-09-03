import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { computed, createVNode, ref } from 'vue';
import { del, deleteBatch, getOrganizationNew, list, template } from '../url/index';
import fireEquipment from '/@/assets/images/risk/fireEquipment.png';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { createImgPreview } from '/@/components/Preview/index';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { dateFormat, getFileAccessHttpUrl } from '/@/utils/common/compUtils';

export const useContent = (infoRef: any) => {
  const { createConfirm } = useMessage();
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const visible = ref(false);
  const info = ref({
    trainingResults: '',
    scoreScreenshot: '',
  });
  const id = ref('');
  const orgOptions = ref<any[]>([]);

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
      label: '模块（工序）',
      field: 'module',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '消防设施（编号）',
      field: 'facilityNo',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '器材名称',
      field: 'equipmentName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '检定日期',
      field: 'checkDate',
      component: 'RangePicker',
      colProps: { span: 6 },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '下次检定日期',
      field: 'nextCheckDate',
      component: 'RangePicker',
      colProps: { span: 6 },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '具体位置',
      field: 'location',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '责任人',
      field: 'dutyPeopleName',
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
      title: '模块（工序）',
      dataIndex: 'module',
    },
    {
      title: '具体位置',
      dataIndex: 'location',
    },
    {
      title: '责任人',
      dataIndex: 'dutyPeopleName',
    },
    {
      title: '消防设施（编号）',
      dataIndex: 'facilityNo',
    },
    {
      title: '器材名称',
      dataIndex: 'equipmentName',
    },
    {
      title: '数量',
      dataIndex: 'number',
    },
    {
      title: '检定日期',
      dataIndex: 'checkDate',
    },
    {
      title: '下次检定日期',
      dataIndex: 'nextCheckDate',
      slots: { customRender: 'nextCheckDate' },
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
        auth: ['fireFighting:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: ['fireFighting:del'],
        onClick: onDel.bind(null, record),
      },
      {
        label: '检验',
        auth: ['fireFighting:check'],
        onClick: onCheck.bind(null, record),
      },
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
    ];
  };

  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls, operateRequest } = useListPage({
    designScope: 'fireFighting-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: async () => {
          const { setFieldsValue } = getForm();
          if (orgOptions.value.length === 1) {
            setFieldsValue({
              org: orgOptions.value[0].value,
            });
          }
        },
      },
      defSort: {
        column: '',
        order: '',
      },
      immediate: false,
      beforeFetch: async (params) => {
        if (params.checkDate) {
          const checkDate = params.checkDate.split(',');
          params['startCheckDate'] = checkDate[0];
          params['endCheckDate'] = checkDate[1];
          delete params['checkDate'];
        }
        if (params.nextCheckDate) {
          const nextCheckDate = params.nextCheckDate.split(',');
          params['startNextCheckDate'] = nextCheckDate[0];
          params['endNextCheckDate'] = nextCheckDate[1];
          delete params['nextCheckDate'];
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
      name: '消防器材台账-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/riskControl/jnRiskFireEquipment/exportXls',
    },
    importConfig: {
      url: '/riskControl/jnRiskFireEquipment/importExcel',
    },
  });

  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  //注册检验 Modal和打开检验Modal函数
  const [registerCheckModal, { openModal: openCheckModal }] = useModal();
  //注册markModal和打开MarkModal函数
  const [registerMarkModal, { openModal: openMarkModal }] = useModal();

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

  // 单条检验
  async function onCheck(record: Recordable) {
    openCheckModal(true, {
      record,
      isUpdate: true,
      isBatch: false,
    });
  }

  //批量检验
  async function batchCheck(records: Recordable[]) {
    openCheckModal(true, {
      records,
      isUpdate: true,
      isBatch: true,
    });
  }
  const handleSuccess = () => {
    selectedRowKeys.value = [];
    reload();
  };
  const openImg = (record) => {
    const imageList = record.scoreScreenshot.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
    });
  };
  const fmtImg = (record: any) => {
    const firstImg = record.scoreScreenshot.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  };

  init();
  async function init() {
    let res = await getOrganizationNew();
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
  }

  const handleMarkModal = (data: any) => {
    openMarkModal(true, {
      ballArr: [
        {
          x: data.x,
          y: data.y,
          size: data.size,
        },
      ],
      title: '消防器材位置标记',
      type: 'view',
      icon: fireEquipment,
      org: data.org,
    });
  };

  return {
    handleMarkModal,
    getActions,
    registerTable,
    registerCheckModal,
    registerMarkModal,
    rowSelection,
    selectedRowKeys,
    batchCheck,
    batchDelete,
    onAdd,
    handleSuccess,
    registerDrawer,
    fmtImg,
    openImg,
    visible,
    info,
    onExportXls,
    onImportXls,
  };
};

// function initOrgCode() {
//   let queryParam = {};
//   if (userinfo.value.orgCode.length > 6) {
//       queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
//       queryParam.departCode = userinfo.value.orgCode;
//   } else if (userinfo.value.orgCode.length == 6) {
//       queryParam.orgCode = userinfo.value.orgCode;
//       queryParam.departCode = undefined;
//   } else {
//       queryParam.orgCode = undefined;
//       queryParam.departCode = undefined;
//   }
//   return queryParam.orgCode;
// }
export default useContent;
