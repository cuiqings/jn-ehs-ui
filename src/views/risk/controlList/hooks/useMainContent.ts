import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, nextTick, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import { getDepart3ListWithSecurity, list, getDeptNew, getListAll, statistics, quashPublish, updateYhItem } from '../url/index';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { message } from 'ant-design-vue';
import { useUserStore } from '/@/store/modules/user';
export const useMainContent = () => {
  const { createConfirm } = useMessage();
  // 管控责任
  const [registerControlModal, controlProps] = useModal();
  const [registerBecomeHumanModal, becomeHumanProps] = useModal();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const areaOptions: any = ref([]);
  const queryParams = ref({
    orgCode: undefined,
  });
  const syncLoading = ref(false);
  const controlCount = ref({
    yfb: 0,
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
      customRender: () => {
        return '已发布';
      },
    },
  ];
  const handleSuccess = () => {
    nextTick(() => {
      selectedRowKeys.value = [];
      initStatistics();
      reload();
    });
  };
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
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
        let name = '';
        if (queryParams.value.orgCode) {
          name =
            dayjs(new Date()).format('YYYYMMDD') +
            orgOptions.value.filter((item) => item.value === queryParams.value.orgCode)[0].label +
            '风险管控信息台账';
        } else {
          name = dayjs(new Date()).format('YYYYMMDD') + '风险管控信息台账';
        }
        return name;
      },
      url: '/rk/skRkApply/exportLedger',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { getForm, reload }, { rowSelection, selectedRowKeys }] = tableContext;
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
      initStatistics();
      reload();
    });
  };
  onMounted(() => {
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
        label: '管控责任',
        auth: ['controlList:control'],
        onClick: handleControl.bind(null, record),
      },
      {
        label: '撤销发布',
        auth: ['controlList:unpublish'],
        onClick: handleUnpublish.bind(null, record),
      },
    ];
  };
  // 批量撤销发布
  const batchHandleUnpublish = () => {
    createConfirm({
      iconType: 'warning',
      title: '批量撤销发布',
      content: '是否确认批量撤销？撤销后发布需重新审核！',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          quashPublish({ id: selectedRowKeys.value.join(',') })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('撤销失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  // 统计
  const initStatistics = () => {
    statistics({
      orgCode: queryParams.value.orgCode,
    }).then((res) => {
      if (res) {
        controlCount.value.yfb = res['已发布'];
        controlCount.value.zdfx = res['重大风险'];
        controlCount.value.jdfx = res['较大风险'];
        controlCount.value.ybfx = res['一般风险'];
        controlCount.value.dfx = res['低风险'];
      }
    });
  };
  // 管控责任
  const handleControl = (data: any) => {
    controlProps.openModal(true, data);
  };
  // 撤销发布
  const handleUnpublish = (data) => {
    createConfirm({
      iconType: 'warning',
      title: '撤销发布',
      content: '是否确认撤销？撤销后发布需重新审核！',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          quashPublish({ id: data.id })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('撤销失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
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
    initStatistics();
    reload();
  };
  const batchHandleSync = () => {
    createConfirm({
      iconType: 'warning',
      title: '同步',
      content: '是否确认同步数据至隐患排查清单，可能需要时间较长，请耐心等待？同步后隐患排查清单数据将替换成最新数据！',
      onOk: () => {
        return new Promise<void>((resolve) => {
          updateYhItem();
          message.success('数据量过大，同步操作已放到后台进行中', 3);
          resolve();
        });
      },
      onCancel: () => {
        syncLoading.value = false;
      },
    });
  };
  const handleBecomeHuman = () => {
    becomeHumanProps.openModal(true, selectedRowKeys.value);
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
    registerControlModal,
    controlCount,
    batchHandleUnpublish,
    batchHandleSync,
    syncLoading,
    handleBecomeHuman,
    registerBecomeHumanModal,
  };
};
export default useMainContent;
