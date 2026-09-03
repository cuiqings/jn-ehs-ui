import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import { getDepart3ListWithSecurity, list, getDeptNew, getListAll, statistics } from '../url/index';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStore } from '/@/store/modules/user';
export const useMainContent = () => {
  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerControlModal, controlOpen] = useModal();
  const [registerDangerSourceModal, dangerSourceOpen] = useModal();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const areaOptions: any = ref([]);
  const queryParams = ref({
    orgCode: undefined,
  });
  const evaluationResultsCount = ref({
    dps: 0,
    psz: 0,
    dsh: 0,
    shz: 0,
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
      label: '风险类别',
      field: 'type',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '设备设施',
            value: '1',
          },
          {
            label: '作业活动',
            value: '2',
          },
        ],
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
      },
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '待评审',
            value: '0',
          },
          {
            label: '评审中',
            value: '1',
          },
          {
            label: '待审核',
            value: '2',
          },
          {
            label: '审核中',
            value: '3',
          },
        ],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '风险点',
      field: 'pointName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '是否专项',
      field: 'specialFlag',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: '2',
          },
          {
            label: '否',
            value: '1',
          },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      width: 210,
      align: 'center',
      dataIndex: 'orgName',
      slots: { customRender: 'orgName' },
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
      title: '风险点',
      width: 150,
      align: 'center',
      dataIndex: 'pointName',
    },
    {
      title: '风险类别',
      width: 150,
      align: 'center',
      dataIndex: 'type',
      customRender: ({ text }) => {
        return text === '1' ? '设备设施' : '作业活动';
      },
    },
    {
      title: '风险因素',
      width: 250,
      align: 'center',
      dataIndex: 'riskFactor',
    },
    {
      title: '可能导致的事故类型',
      width: 250,
      align: 'center',
      dataIndex: 'accidentType',
    },
    {
      title: '风险分级',
      width: 150,
      align: 'center',
      dataIndex: 'riskLevel',
      slots: { customRender: 'riskLevel' },
    },
    {
      title: '现有管控措施',
      children: [
        {
          title: '工程技术措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGcjsMsr',
        },
        {
          title: '组织管理措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingZzglMsr',
        },
        {
          title: '培训教育措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingPxjyMsr',
        },
        {
          title: '个体防护措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingGrfhMsr',
        },
        {
          title: '应急处置措施',
          width: 250,
          align: 'center',
          dataIndex: 'existingYjclMsr',
        },
      ],
    },
    {
      title: '责任部门',
      width: 200,
      align: 'center',
      dataIndex: 'dutyDepart',
    },
    {
      title: '责任人',
      width: 200,
      align: 'center',
      dataIndex: 'dutyPerson',
    },
    {
      title: '状态',
      width: 150,
      align: 'center',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return text === '0' ? '待评审' : text === '1' ? '评审中' : text === '2' ? '待审核' : text === '3' ? '审核中' : '已发布';
      },
    },
    {
      title: '评审意见',
      width: 250,
      align: 'center',
      dataIndex: 'reviewOpinion',
    },
    {
      title: '审核意见',
      width: 250,
      align: 'center',
      dataIndex: 'auditOpinion',
    },
  ];
  const handleSuccess = () => {
    nextTick(async () => {
      selectedRowKeys.value = [];
      initTypeStatistics();
      reload();
    });
  };
  const { tableContext, onExportXls } = useListPage({
    designScope: 'risk-process-checklist',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        autoAdvancedCol: 3,
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
        if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
          params.departCode = userInfo.value.orgCode;
          getForm().setFieldsValue({
            departCode: userInfo.value.orgCode,
          });
        }
        return params;
      },
      actionColumn: {
        width: 250,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        if (queryParams.value.orgCode) {
          name =
            dayjs(new Date()).format('YYYYMMDD') +
            orgOptions.value.filter((item) => item.value === queryParams.value.orgCode)[0].label +
            '风险管控过程清单';
        } else {
          name = dayjs(new Date()).format('YYYYMMDD') + '风险管控过程清单';
        }
        return name;
      },
      url: '/rk/skRkApply/exportControl',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { getForm, reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
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
      initTypeStatistics();
      reload();
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
        label: '修改',
        auth: ['processChecklist:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '专业评审',
        auth: ['processChecklist:review'],
        ifShow: record.status === '0',
        onClick: handleReview.bind(null, record),
      },
      {
        label: '提交审核',
        ifShow: record.status === '2',
        auth: ['processChecklist:submitReview'],
        onClick: handleSubmitReview.bind(null, record),
      },
      {
        label: '管控责任',
        auth: ['processChecklist:responsibility'],
        onClick: handleResponsibility.bind(null, record),
      },
    ];
  };
  const handleEdit = (data: any) => {
    dangerSourceOpen.openModal(true, data);
  };
  // 判断orgCode是否相同
  function allOrgCodesSame(arr) {
    if (arr.length <= 1) return true;
    const first = String(arr[0].orgCode);
    return arr.every((item) => String(item.orgCode) === first);
  }
  const handleReview = (data: any) => {
    let ids = '';
    if (Array.isArray(data)) {
      if (selectedRows.value.some((item) => item.status !== '0')) {
        return createMessage.info('选择的数据，不是待评审状态的！');
      }
      if (!allOrgCodesSame(selectedRows.value)) {
        return createMessage.info('选择的所属单位不同！');
      }
      ids = selectedRowKeys.value.join(',');
    } else {
      ids = data.id;
    }
    openModal(true, {
      title: '专业评审',
      ids,
    });
  };
  const handleSubmitReview = (data: any) => {
    let ids = '';
    if (Array.isArray(data)) {
      if (selectedRows.value.some((item) => item.status !== '2')) {
        return createMessage.info('选择的数据，不是待审核状态的！');
      }
      ids = selectedRowKeys.value.join(',');
    } else {
      ids = data.id;
      // orgCode = data.orgCode;
    }
    openModal(true, {
      title: '提交审核',
      ids,
    });
  };
  const handleResponsibility = (data: any) => {
    controlOpen.openModal(true, data);
  };
  // 统计
  const initTypeStatistics = () => {
    statistics({
      orgCode: queryParams.value.orgCode,
    }).then((res) => {
      if (res) {
        evaluationResultsCount.value.dps = res['待评审'];
        evaluationResultsCount.value.psz = res['评审中'];
        evaluationResultsCount.value.dsh = res['待审核'];
        evaluationResultsCount.value.shz = res['审核中'];
        evaluationResultsCount.value.zdfx = res['重大风险'];
        evaluationResultsCount.value.jdfx = res['较大风险'];
        evaluationResultsCount.value.ybfx = res['一般风险'];
        evaluationResultsCount.value.dfx = res['低风险'];
      }
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
    initTypeStatistics();
    reload();
  };
  return {
    registerTable,
    getActions,
    onExportXls,
    rowSelection,
    handleSuccess,
    selectedRowKeys,
    queryParams,
    orgOptions,
    changeOrg,
    evaluationResultsCount,
    registerModal,
    handleReview,
    handleSubmitReview,
    registerControlModal,
    registerDangerSourceModal,
  };
};
export default useMainContent;
