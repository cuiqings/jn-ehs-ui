import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, computed } from 'vue';
import { useDrawer } from '/@/components/Drawer';
import { useMethods } from '/@/hooks/system/useMethods';
import { useUserStore } from '/@/store/modules/user';
import { getDepart3ListWithSecurity, list, getDeptNew, del, deleteBatch, typeStatistics, getListAll, updateExecuteFlagBatch } from '../url/index';

export const useMainContent = (tableRef, fromRef) => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const activeKey = ref('1');
  const facilityCount = ref(0);
  const activityCount = ref(0);
  const areaOptions: any = ref([]);
  const queryParams = ref({
    orgCode: undefined,
  });
  const visible = ref(false);
  const from = ref({
    id: '',
    executeFlag: undefined,
  });
  const confirmLoading = ref(false);
  const fromRules = {
    executeFlag: [{ required: true, message: '请选择是否巡检项', trigger: 'change' }],
  };
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属车间',
      field: 'departCode',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '辨识单元',
      field: 'recogId',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '风险等级',
      field: 'riskLevel',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'risk_degree',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        isNull: true,
      },
      colProps: { span: 6 },
    },
    {
      label: '设备名称',
      field: 'pointName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '类别',
      field: 'deviceType',
      ifShow: true,
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'sk_rk_device_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '规格型号',
      field: 'deviceModel',
      ifShow: true,
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '是否特种设备',
      field: 'deviceSpecialFlag',
      ifShow: true,
      component: 'Select',
      componentProps: {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '作业活动内容',
      field: 'workContent',
      ifShow: false,
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '岗位地点',
      field: 'workSite',
      ifShow: false,
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '活动频次',
      field: 'workFrequency',
      ifShow: false,
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
    },
    {
      title: '设备名称',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
    },
    {
      title: '类别',
      width: 150,
      align: 'center',
      dataIndex: 'deviceType_dictText',
    },
    {
      title: '规格型号',
      width: 150,
      align: 'center',
      dataIndex: 'deviceModel',
    },
    {
      title: '是否特种设备',
      width: 150,
      dataIndex: 'deviceSpecialFlag',
      customRender: ({ text }) => {
        return text === '1' ? '是' : '否';
      },
    },
    {
      title: '备注',
      width: 200,
      dataIndex: 'remark',
    },
    {
      title: '风险等级',
      width: 150,
      align: 'center',
      dataIndex: 'riskLevel',
      slots: { customRender: 'riskLevel' },
    },
    {
      title: '安全部负责人',
      width: 200,
      dataIndex: 'securityDepartPersonName',
    },
    {
      title: '厂部主要负责人',
      width: 200,
      dataIndex: 'factoryMajorManagerName',
    },
    {
      title: '厂部安全科',
      width: 200,
      dataIndex: 'factorySecurityDepartPersonName',
    },
    {
      title: '车间负责人',
      width: 200,
      align: 'center',
      dataIndex: 'workshopManagerName',
    },
    {
      title: '班组负责人',
      width: 200,
      align: 'center',
      dataIndex: 'teamManagerName',
    },
    {
      title: '岗位人员',
      width: 200,
      align: 'center',
      dataIndex: 'postPersonName',
    },
  ];
  const columns1 = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
    },
    {
      title: '作业活动名称',
      width: 200,
      align: 'center',
      dataIndex: 'pointName',
    },
    {
      title: '作业活动内容',
      width: 200,
      align: 'center',
      dataIndex: 'workContent',
    },
    {
      title: '岗位地点',
      width: 150,
      dataIndex: 'workSite',
    },
    {
      title: '活动频次',
      width: 150,
      dataIndex: 'workFrequency',
    },
    {
      title: '是否巡检项',
      width: 150,
      dataIndex: 'executeFlag',
      customRender: ({ text }) => {
        return text === '1' ? '是' : text === '2' ? '否' : '';
      },
    },
    {
      title: '备注',
      width: 200,
      align: 'center',
      dataIndex: 'remark',
    },
    {
      title: '风险等级',
      width: 150,
      align: 'center',
      dataIndex: 'riskLevel',
      slots: { customRender: 'riskLevel' },
    },
    {
      title: '安全部负责人',
      width: 200,
      dataIndex: 'securityDepartPersonName',
    },
    {
      title: '厂部主要负责人',
      width: 200,
      dataIndex: 'factoryMajorManagerName',
    },
    {
      title: '厂部安全科',
      width: 200,
      dataIndex: 'factorySecurityDepartPersonName',
    },
    {
      title: '车间负责人',
      width: 200,
      align: 'center',
      dataIndex: 'workshopManagerName',
    },
    {
      title: '班组负责人',
      width: 200,
      align: 'center',
      dataIndex: 'teamManagerName',
    },
    {
      title: '岗位人员',
      width: 200,
      align: 'center',
      dataIndex: 'postPersonName',
    },
  ];
  const handleSuccess = () => {
    nextTick(() => {
      selectedRowKeys.value = [];
      changeOrg(queryParams.value.orgCode);
    });
  };
  const { tableContext, onExportXls, onImportXls, operateRequest } = useListPage({
    designScope: 'risk-point-management',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        autoAdvancedCol: 2,
        resetFunc: () => {
          // if (!(userInfo.value.orgCode.length > 9 && isSecuritySector !== '1'))
          if (isSecuritySector === '1' || (userInfo.value.orgCode.length <= 9 && isSecuritySector !== '1')) {
            getForm().updateSchema({
              field: 'recogId',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
          }
        },
      },
      showIndexColumn: true,
      immediate: false,
      indexColumnProps: {
        fixed: 'left',
      },
      rowSelection: {
        fixed: 'left',
      },
      beforeFetch: (params) => {
        params.orgCode = queryParams.value.orgCode;
        params.type = activeKey.value;
        if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
          params.departCode = userInfo.value.orgCode;
          getForm().setFieldsValue({
            departCode: userInfo.value.orgCode,
          });
        }
        return params;
      },
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
        return `风险点-${activeKey.value === '1' ? '设备设施' : '作业活动'}`;
      },
      url: '/rk/skRkPoint/exportXls',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/rk/skRkPoint/importExcel',
      data: () => {
        return {
          type: activeKey.value,
        };
      },
      success: handleSuccess,
    },
  });
  const [registerTable, { getForm, handleSearchInfoChange, setColumns }, { rowSelection, selectedRowKeys }] = tableContext;
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      if (orgOptions.value.length === 1) {
        queryParams.value.orgCode = orgOptions.value[0].value;
        getDepartList(orgOptions.value[0].value);
      }
      changeOrg(queryParams.value.orgCode);
    });
  };
  onMounted(() => {
    init();
  });
  // 区域单位
  const getAreaList = (departCode) => {
    getListAll({ departCode }).then((res) => {
      if (res) {
        areaOptions.value = res.map((item: any) => {
          return {
            label: item.recogUnit,
            value: item.id,
          };
        });
        getForm().updateSchema({
          field: 'recogId',
          componentProps: {
            options: areaOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          },
        });
      } else {
        getForm().updateSchema({
          field: 'recogId',
          componentProps: {
            options: [],
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          },
        });
      }
    });
  };
  // 类型统计
  const initTypeStatistics = () => {
    typeStatistics({
      orgCode: queryParams.value.orgCode,
    }).then((res) => {
      if (res) {
        facilityCount.value = res['设备设施'];
        activityCount.value = res['作业活动'];
      }
    });
  };
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
        getForm().setFieldsValue({
          departCode: userInfo.value.orgCode,
        });
        getAreaList(userInfo.value.orgCode);
      }
      getForm().updateSchema({
        field: 'departCode',
        componentProps: {
          options: departOptions.value,
          disabled: userInfo.value.orgCode.length > 9 && isSecuritySector !== '1',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            getForm().setFieldsValue({
              recogId: undefined,
            });
            getForm().updateSchema({
              field: 'recogId',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
            if (value) {
              getAreaList(value);
            }
          },
        },
      });
    });
  };
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['riskPointManagement:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['riskPointManagement:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openDrawer(true, {
      type: 'add',
      title: '新增',
      showOkBtn: true,
      showFooter: true,
      activeKey: activeKey.value,
    });
  };
  const handleEdit = (data: any) => {
    openDrawer(true, {
      type: 'edit',
      title: '编辑',
      showOkBtn: true,
      showFooter: true,
      data,
      activeKey: activeKey.value,
    });
  };
  const handleView = (data: any) => {
    openDrawer(true, {
      type: 'view',
      title: '查看',
      showOkBtn: false,
      showFooter: true,
      data,
      activeKey: activeKey.value,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(
      () => deleteBatch({ ids: selectedRowKeys.value.join(',') }),
      {
        confirm: true,
        isBatch: true,
        content: `是否删除已选中的${selectedRowKeys.value.length}项？删除风险点数据，将同时删除危险源辨识与评价、风险管控过程清单中相同风险ID的数据，是否确认批量删除？`,
      },
      () => changeOrg(queryParams.value.orgCode)
    );
  };
  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ id: data.id }),
      {
        confirm: true,
        isBatch: false,
        content: '删除风险点数据，将同时删除危险源辨识与评价、风险管控过程清单中相同风险ID的数据，是否确认删除？',
      },
      () => changeOrg(queryParams.value.orgCode)
    );
  };
  // tab切换
  const handleTabChange = (key) => {
    activeKey.value = key;
    nextTick(() => {
      tableRef.value.searchFormRef.advanceState.isAdvanced = false;
      getForm().setFieldsValue({
        departCode: userInfo.value.orgCode.length > 9 ? userInfo.value.orgCode : undefined,
        recogId: undefined,
        pointName: undefined,
        deviceType: undefined,
        deviceModel: undefined,
        deviceSpecialFlag: undefined,
        workContent: undefined,
        workSite: undefined,
        workFrequency: undefined,
      });
      changeOrg(queryParams.value.orgCode);
    });
  };
  // 所属单位变化时刷新表格
  const changeOrg = async (value) => {
    getForm().updateSchema({
      field: 'departCode',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
    });
    getForm().updateSchema({
      field: 'recogId',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
    });
    getForm().setFieldsValue({
      departCode: undefined,
    });
    getForm().setFieldsValue({
      recogId: undefined,
    });
    if (value) {
      getDepartList(value);
    }
    getForm().updateSchema({
      field: 'pointName',
      label: activeKey.value === '1' ? '设备名称' : '作业活动名称',
    });
    initUpdateSchema(['deviceType', 'deviceModel', 'deviceSpecialFlag'], activeKey.value === '1');
    initUpdateSchema(['workContent', 'workSite', 'workFrequency'], activeKey.value !== '1');
    // 列表、查询条件更新
    nextTick(async () => {
      setColumns(activeKey.value === '1' ? columns : columns1);
      selectedRowKeys.value = [];
      const form = await getForm().validate();
      // 表格查询
      handleSearchInfoChange({
        orgCode: queryParams.value.orgCode,
        type: activeKey.value,
        ...form,
      });
    });
    initTypeStatistics();
  };
  const initUpdateSchema = (formFieldArr, is) => {
    formFieldArr.forEach((item) => {
      getForm().updateSchema({
        field: item,
        ifShow: is,
      });
    });
  };
  //导入模版下载
  const onExportTemplateXls = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx(`风险点-${activeKey.value === '1' ? '设备设施' : '作业活动'}`, '/rk/skRkPoint/downloadImportTemplate', {
      type: activeKey.value,
    });
  };
  const handleExecuteFlag = () => {
    visible.value = true;
    Object.assign(from.value, {
      executeFlag: undefined,
      id: '',
    });
  };
  const handleOk = () => {
    fromRef.value?.validate().then(() => {
      confirmLoading.value = true;
      from.value.id = selectedRowKeys.value.join(',');
      updateExecuteFlagBatch(from.value)
        .then((res) => {
          if (res) {
            changeOrg(queryParams.value.orgCode);
            visible.value = false;
          }
        })
        .finally(() => {
          confirmLoading.value = false;
        });
    });
  };
  return {
    registerTable,
    getActions,
    onExportXls,
    rowSelection,
    handleAdd,
    onImportXls,
    registerDrawer,
    handleSuccess,
    selectedRowKeys,
    batchHandleDelete,
    activeKey,
    queryParams,
    orgOptions,
    handleTabChange,
    changeOrg,
    facilityCount,
    activityCount,
    onExportTemplateXls,
    handleExecuteFlag,
    visible,
    from,
    confirmLoading,
    fromRules,
    handleOk,
  };
};
export default useMainContent;
