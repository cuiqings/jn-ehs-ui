import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { computed, createVNode, ref } from 'vue';
import { del, deleteBatch, getOrganizationNew, list } from '../url/index';
import limitedSpace from '/@/assets/images/risk/limitedSpace.png'; // 排气筒
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { createImgPreview } from '/@/components/Preview/index';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStore } from '/@/store/modules/user';
import { dateFormat, getFileAccessHttpUrl } from '/@/utils/common/compUtils';
const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
export const useContent = (infoRef: any) => {
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

  const searchFormSchema = <FormSchema[]>[
    {
      label: '责任单位',
      field: 'dutyOrg',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '风险等级编号',
      field: 'riskLevelNo',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '类型',
      field: 'type',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '位置及范围',
      field: 'locationRange',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '主要危害及有害因素',
      field: 'majorHazard',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '负责人',
      field: 'managerName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '危险性',
      field: 'risk',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '危险物质',
      field: 'riskMatter',
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
  const columns = <BasicColumn[]>[
    {
      title: '责任单位',
      dataIndex: 'dutyOrgName',
    },
    {
      title: '标记位置',
      dataIndex: 'markFlag',
      slots: { customRender: 'markFlag' },
    },
    {
      title: '风险等级编号',
      dataIndex: 'riskLevelNo',
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
    },
    {
      title: '位置及范围',
      dataIndex: 'locationRange',
    },
    {
      title: '主要危害及有害因素',
      dataIndex: 'majorHazard',
    },
    {
      title: '现场位置照片',
      dataIndex: 'liveLocationPicture',
      slots: { customRender: 'liveLocationPicture' },
    },
    {
      title: '作业最大人数',
      dataIndex: 'workersMaxNumber',
    },
    {
      title: '所属区域',
      dataIndex: 'region',
    },
    {
      title: '负责人',
      dataIndex: 'managerName',
    },
    {
      title: '出入口数量',
      dataIndex: 'crNumber',
    },
    {
      title: '危险性',
      dataIndex: 'risk',
    },
    {
      title: '危险物质',
      dataIndex: 'riskMatter',
    },
    {
      title: '最高允许浓度限制',
      dataIndex: 'concentrationLimit',
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
        auth: ['limitspace:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: ['limitspace:del'],
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
    designScope: 'limitSpace-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        labelWidth: '130px',
        schemas: searchFormSchema,
        resetFunc: async () => {
          const { setFieldsValue } = getForm();
          if (orgOptions.value.length === 1) {
            setFieldsValue({
              dutyOrg: orgOptions.value[0].value,
            });
          }
        },
      },
      defSort: {
        column: '',
        order: '',
      },
      beforeFetch: (params) => {
        return params;
      },
      immediate: false,
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
      suffix: 'xlsx',
      name: '有限空间台账-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/riskControl/jnRiskSpace/exportXls',
    },
    importConfig: {
      url: '/riskControl/jnRiskSpace/importExcel',
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

  const fmtImg = (record: any) => {
    const firstImg = record.liveLocationPicture.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  };
  const openImg = (record) => {
    const imageList = record.liveLocationPicture.split(',').map((i) => getFileAccessHttpUrl(i));
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
    openModal(true, {
      ballArr: [
        {
          x: data.x,
          y: data.y,
          size: data.size,
        },
      ],
      title: '有限空间位置标记',
      type: 'view',
      icon: limitedSpace,
      org: data.org,
    });
  };

  return {
    registerModal,
    handleMarkModal,
    getActions,
    registerTable,
    rowSelection,
    selectedRowKeys,
    batchDelete,
    onAdd,
    handleSuccess,
    registerDrawer,
    fmtImg,
    openImg,
    visible,
    // handleSubmit,
    info,
    onExportXls,
    onImportXls,
  };
};

export default useContent;
