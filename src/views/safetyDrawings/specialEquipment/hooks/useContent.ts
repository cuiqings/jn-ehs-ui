import { ref } from 'vue';
import { del, deleteBatch, list, scoreEntry, template } from '../url/index';
import boiler from '/@/assets/images/risk/boiler.png';
import forklift from '/@/assets/images/risk/forklift.png';
import hoistingMachinery from '/@/assets/images/risk/hoistingMachinery.png';
import pressureVessel from '/@/assets/images/risk/pressureVessel.png';
import { useDrawer } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { createImgPreview } from '/@/components/Preview/index';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { dateFormat, getFileAccessHttpUrl } from '/@/utils/common/compUtils';
export const useContent = (infoRef: any) => {
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const visible = ref(false);
  const info = ref({
    trainingResults: '',
    scoreScreenshot: '',
  });
  const id = ref('');

  const searchFormSchema = <FormSchema[]>[
    {
      label: '设备状态',
      field: 'equipmentState',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'special_device_status',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '使用单位',
      field: 'useDepartment',
      component: 'ETreeSelectOrg',
      colProps: { span: 6 },
    },
    {
      label: '设备类别',
      field: 'deviceType',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'special_device_type',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '设备名称',
      field: 'deviceName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '设备编号',
      field: 'deviceNumber',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '设备型号',
      field: 'deviceModel',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '使用登记证编号',
      field: 'useCertificateNumber',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '注册号',
      field: 'registrationNumber',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '出厂日期',
      field: 'factoryDate',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '制造单位',
      field: 'manuUnit',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '制造许可证',
      field: 'manuLicense',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '投入使用日期',
      field: 'useDate',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
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
      title: '标记位置',
      dataIndex: 'markFlag',
      slots: { customRender: 'markFlag' },
    },
    {
      title: '设备状态',
      dataIndex: 'equipmentState_dictText',
    },
    {
      title: '使用单位',
      dataIndex: 'useDepartment',
    },
    {
      title: '设备类别',
      dataIndex: 'deviceType_dictText',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
    },
    {
      title: '型号',
      dataIndex: 'deviceModel',
    },
    {
      title: '出厂日期',
      dataIndex: 'factoryDate',
    },
    {
      title: '制造单位',
      dataIndex: 'manuUnit',
    },
    {
      title: '制造许可证',
      dataIndex: 'manuLicense',
    },
    {
      title: '下次检验日期',
      dataIndex: 'verificationDate',
      slots: { customRender: 'verificationDate' },
    },
    {
      title: '投入使用日期',
      dataIndex: 'useDate',
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];
  const getActionsUp = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['specialEquipment:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        auth: ['specialEquipment:del'],
        onClick: onDel.bind(null, record),
      },
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
    ];
  };

  const getActionsDown = (record: any) => {
    const actions = [
      {
        auth: ['specialEquipment:check'],
        label: '设备检验',
        onClick: onCheck.bind(null, record),
      },
      {
        auth: ['specialEquipment:facheck'],
        label: '安全阀校验',
        onClick: onReliefCheck.bind(null, record),
        // 添加条件判断，根据record中的特定值来确定是否显示该按钮
        hidden: record.deviceType !== '3', // 假设someValue是record中的一个字段，someCondition是需要判断的条件
      },
    ];

    // 过滤掉hidden为true的按钮
    return actions.filter((action) => !action.hidden);
  };

  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls, operateRequest } = useListPage({
    designScope: 'specialManagement-list',
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
        if (params.factoryDate) {
          const factoryDate = params.factoryDate.split(',');
          params['startFactoryDate'] = factoryDate[0] + ' 00:00:00';
          params['endFactoryDate'] = factoryDate[1] + ' 23:59:59';
          delete params['factoryDate'];
        }
        if (params.useDate) {
          const useDate = params.useDate.split(',');
          params['startUseDate'] = useDate[0] + ' 00:00:00';
          params['endUseDate'] = useDate[1] + ' 23:59:59';
          delete params['useDate'];
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
      name: '特种设备台账-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/JnRiskControl/jnRiskSpecialManagement/exportXls',
    },
    importConfig: {
      url: '/JnRiskControl/jnRiskSpecialManagement/importExcel',
    },
  });

  //导入模板下载
  function onImportTemplate(file) {
    template(file);
  }

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

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

  //批量删除
  const batchDelete = (params) => {
    operateRequest(() => deleteBatch({ ids: params }), {
      confirm: true,
      isBatch: true,
    });
  };

  // 单条检验
  async function onCheck(record: Recordable) {
    console.log('record:', record);
    openCheckModal(true, {
      record,
      isUpdate: true,
      isBatch: false,
      isRelief: false,
    });
  }

  // 安全阀校验
  async function onReliefCheck(record: Recordable) {
    console.log('record:', record);
    openCheckModal(true, {
      record,
      isUpdate: true,
      isBatch: false,
      isRelief: true,
    });
  }

  //批量检验
  async function batchCheck(records: Recordable[]) {
    console.log(records);
    openCheckModal(true, {
      records,
      isUpdate: true,
      isBatch: true,
      isRelief: false,
    });
  }
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
  const handleMarkModal = (data: any) => {
    console.log('data:', data);
    //设备类型判断
    if (data.deviceType == '1') {
      openMarkModal(true, {
        ballArr: [
          {
            x: data.x,
            y: data.y,
            size: data.size,
          },
        ],
        title: '起重机械位置标记',
        type: 'view',
        icon: hoistingMachinery,
        org: data.useDepartmentCode,
      });
    } else if (data.deviceType == '2') {
      openMarkModal(true, {
        ballArr: [
          {
            x: data.x,
            y: data.y,
            size: data.size,
          },
        ],
        title: '叉车位置标记',
        type: 'view',
        icon: forklift,
        org: data.useDepartmentCode,
      });
    } else if (data.deviceType == '3') {
      openMarkModal(true, {
        ballArr: [
          {
            x: data.x,
            y: data.y,
            size: data.size,
          },
        ],
        title: '压力容器位置标记',
        type: 'view',
        icon: pressureVessel,
        org: data.useDepartmentCode,
      });
    } else if (data.deviceType == '4') {
      openMarkModal(true, {
        ballArr: [
          {
            x: data.x,
            y: data.y,
            size: data.size,
          },
        ],
        title: '锅炉位置标记',
        type: 'view',
        icon: boiler,
        org: data.useDepartmentCode,
      });
    }
  };
  return {
    getActionsUp,
    getActionsDown,
    registerTable,
    registerCheckModal,
    registerMarkModal,
    handleMarkModal,
    rowSelection,
    selectedRowKeys,
    onImportTemplate,
    batchCheck,
    batchDelete,
    onAdd,
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
