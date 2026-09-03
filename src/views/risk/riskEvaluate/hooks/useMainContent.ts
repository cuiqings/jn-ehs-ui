import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, computed } from 'vue';
import { getDepart3ListWithSecurity, list, getDeptNew, getListAll, statistics, del, deleteBatch } from '../url/index';
import { useMethods } from '/@/hooks/system/useMethods';
import { useDrawer } from '/@/components/Drawer';
import { useUserStore } from '/@/store/modules/user';
export const useMainContent = (tableRef) => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const { handleExportXlsx } = useMethods();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const areaOptions: any = ref([]);
  const activeKey = ref('1');
  const facilityCount = ref(0);
  const activityCount = ref(0);
  const queryParams = ref({
    orgCode: undefined,
  });
  const evaluationResultsCount = ref({
    zs: 0,
    zdfx: 0,
    jdfx: 0,
    ybfx: 0,
    dfx: 0,
  });
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
      label: '设备名称',
      field: 'pointName',
      ifShow: true,
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '风险程度',
      field: 'riskLevel',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'risk_degree',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
  ];
  // rowSpan 计算，只有设备设施（pointId）相同才合并
  const orgNameRowSpan = computed(() => getRowSpan(getDataSource(), ['orgName', 'pointId']));
  const departNameRowSpan = computed(() => getRowSpan(getDataSource(), ['departName', 'pointId']));
  const recogUnitRowSpan = computed(() => getRowSpan(getDataSource(), ['recogUnit', 'pointId']));
  const pointNameRowSpan = computed(() => getRowSpan(getDataSource(), 'pointId'));
  const checkItemRowSpan = computed(() => getRowSpan(getDataSource(), ['checkItem', 'pointId']));
  const workStepRowSpan = computed(() => getRowSpan(getDataSource(), ['checkItem', 'workStep']));
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
      customCell: (_, index: any) => {
        return {
          rowSpan: orgNameRowSpan.value[index],
        };
      },
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
      customCell: (_, index: any) => {
        return {
          rowSpan: departNameRowSpan.value[index],
        };
      },
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
      customCell: (_, index: any) => {
        return {
          rowSpan: recogUnitRowSpan.value[index],
        };
      },
    },
    {
      title: '设备设施',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
      customCell: (_, index: any) => {
        return {
          rowSpan: pointNameRowSpan.value[index],
        };
      },
    },
    {
      title: '检查项目',
      width: 150,
      align: 'center',
      dataIndex: 'checkItem',
      customCell: (_, index: any) => {
        return {
          rowSpan: checkItemRowSpan.value[index],
        };
      },
    },
    {
      title: '不符合标准情况及后果',
      width: 250,
      align: 'center',
      dataIndex: 'consequence',
    },
    {
      title: '标准',
      width: 250,
      align: 'center',
      dataIndex: 'standard',
    },
    {
      title: '可能发生的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType_dictText',
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '风险评价',
      children: [
        {
          title: '可能性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateL',
        },
        {
          title: '严重性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateC',
        },
        {
          title: '频次',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateE',
        },
        {
          title: '风险值',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateD',
        },
        {
          title: '评价级别',
          width: 150,
          align: 'center',
          dataIndex: 'riskLevel',
          slots: { customRender: 'riskLevel' },
        },
      ],
    },
    {
      title: '管控层级',
      width: 180,
      align: 'center',
      dataIndex: 'controlLevel',
    },
    {
      title: '改进措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'improvePxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveYjclMsr',
        },
      ],
    },
  ];
  const columns1 = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 150,
      align: 'center',
      dataIndex: 'orgName',
      customCell: (_, index: any) => {
        return {
          rowSpan: orgNameRowSpan.value[index],
        };
      },
    },
    {
      title: '所属车间',
      width: 150,
      align: 'center',
      dataIndex: 'departName',
      customCell: (_, index: any) => {
        return {
          rowSpan: departNameRowSpan.value[index],
        };
      },
    },
    {
      title: '辨识单元',
      width: 200,
      align: 'center',
      dataIndex: 'recogUnit',
      customCell: (_, index: any) => {
        return {
          rowSpan: recogUnitRowSpan.value[index],
        };
      },
    },
    {
      title: '作业活动',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
      customCell: (_, index: any) => {
        return {
          rowSpan: pointNameRowSpan.value[index],
        };
      },
    },
    {
      title: '作业步骤',
      width: 150,
      align: 'center',
      dataIndex: 'workStep',
      customCell: (_, index: any) => {
        return {
          rowSpan: workStepRowSpan.value[index],
        };
      },
    },
    {
      title: '危险源或潜在事件（人、物、作业环境、管理）',
      width: 350,
      align: 'center',
      dataIndex: 'dangerSource',
    },
    {
      title: '可能发生的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType_dictText',
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '风险评价',
      children: [
        {
          title: '可能性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateL',
        },
        {
          title: '严重性',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateC',
        },
        {
          title: '频次',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateE',
        },
        {
          title: '风险值',
          width: 100,
          align: 'center',
          dataIndex: 'evaluateD',
        },
        {
          title: '评价级别',
          width: 150,
          align: 'center',
          dataIndex: 'riskLevel',
          slots: { customRender: 'riskLevel' },
        },
      ],
    },
    {
      title: '管控层级',
      width: 150,
      align: 'center',
      dataIndex: 'controlLevel',
    },
    {
      title: '改进措施',
      children: [
        {
          title: '工程技术措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 150,
          align: 'center',
          dataIndex: 'improvePxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 150,
          align: 'center',
          dataIndex: 'improveYjclMsr',
        },
      ],
    },
  ];
  // 计算 rowSpan 的工具函数（支持多字段联合判断）
  const getRowSpan = (data, fields: string | string[]) => {
    const spans: any = [];
    let count = 0;
    const fieldArr = Array.isArray(fields) ? fields : [fields];
    const isSame = (a: any, b: any) => fieldArr.every((field) => a[field] === b[field]);
    data.forEach((record, i) => {
      if (i === 0 || !isSame(record, data[i - 1])) {
        count = 1;
        let j = i + 1;
        while (j < data.length && isSame(data[j], record)) {
          count++;
          j++;
        }
        spans[i] = count;
      } else {
        spans[i] = 0;
      }
    });
    return spans;
  };
  const handleSuccess = () => {
    nextTick(async () => {
      selectedRowKeys.value = [];
      changeOrg(queryParams.value.orgCode);
    });
  };
  const { tableContext, onExportXls, onImportXls, operateRequest } = useListPage({
    designScope: 'risk-evaluate',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        autoAdvancedCol: 2,
        resetFunc: () => {
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
        params.specialFlag = '1';
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
        return `危险源辨识与评价模版-${activeKey.value === '1' ? '设备设施' : '作业活动'}`;
      },
      url: '/rk/skRkSource/exportXls',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/rk/skRkSource/importExcel',
      data: () => {
        return {
          type: activeKey.value,
        };
      },
      success: handleSuccess,
    },
  });
  const [registerTable, { getForm, handleSearchInfoChange, setColumns, getDataSource }, { rowSelection, selectedRowKeys }] = tableContext;
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
  onMounted(async () => {
    init();
  });
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
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['riskEvaluate:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['riskEvaluate:del'],
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
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(
      () => deleteBatch({ ids: selectedRowKeys.value.join(',') }),
      {
        confirm: true,
        isBatch: true,
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
      },
      () => changeOrg(queryParams.value.orgCode)
    );
  };
  // 统计
  const initTypeStatistics = () => {
    statistics({
      orgCode: queryParams.value.orgCode,
      specialFlag: '1',
    }).then((res) => {
      if (res) {
        facilityCount.value = res['设备设施'];
        activityCount.value = res['作业活动'];
        evaluationResultsCount.value.zs = res['总数'];
        evaluationResultsCount.value.zdfx = res['重大风险'];
        evaluationResultsCount.value.jdfx = res['较大风险'];
        evaluationResultsCount.value.ybfx = res['一般风险'];
        evaluationResultsCount.value.dfx = res['低风险'];
      }
    });
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
        riskLevel: undefined,
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
    // 列表、查询条件更新
    nextTick(async () => {
      setColumns(activeKey.value === '1' ? columns : columns1);
      replaceColumns();
      selectedRowKeys.value = [];
      const form = await getForm().validate();
      // 表格查询
      handleSearchInfoChange({
        type: activeKey.value,
        ...queryParams.value,
        ...form,
      });
    });
    const replaceColumns = () => {};
    initTypeStatistics();
  };
  //导入模版下载
  const onExportTemplateXls = () => {
    handleExportXlsx(`危险源辨识与评价模版-${activeKey.value === '1' ? '设备设施' : '作业活动'}`, '/rk/skRkSource/downloadImportTemplate', {
      type: activeKey.value,
    });
  };
  return {
    registerTable,
    getActions,
    onExportXls,
    rowSelection,
    handleSuccess,
    selectedRowKeys,
    activeKey,
    queryParams,
    orgOptions,
    handleTabChange,
    changeOrg,
    onExportTemplateXls,
    facilityCount,
    activityCount,
    evaluationResultsCount,
    batchHandleDelete,
    handleAdd,
    onImportXls,
    registerDrawer,
  };
};
export default useMainContent;
