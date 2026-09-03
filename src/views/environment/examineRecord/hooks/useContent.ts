import { getOrganizationNew, list, getNum } from '../url/index';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { render } from '/@/utils/common/renderUtils';
import { h, ref } from 'vue';
export const useContent = () => {
  const abnormalNum = ref(0);
  const deactivateNum = ref(0);
  const enableNum = ref(0);
  const planNum = ref(0);
  const orgOptions: any = ref([]);
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const searchFormSchema = <FormSchema[]>[
    {
      label: '计划名称',
      field: 'checkPlanName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '检查频率',
      field: 'checkFrequency',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'check_frequency',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: { span: 6 },
    },
    {
      label: '检查状态',
      field: 'isOverdue',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '正常', value: '0' },
          { label: '超期', value: '1' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '检查单位',
      field: 'organizationCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '计划名称',
      dataIndex: 'checkPlanName',
    },
    {
      title: '检查频率',
      dataIndex: 'checkFrequency',
      customRender: ({ text }) => {
        return render.renderDict(text, 'check_frequency');
      },
    },
    {
      title: '检查状态',
      dataIndex: 'isOverdue',
      customRender: ({ text }) => {
        return h('span', { style: { color: text === '1' ? 'red' : '' } }, text === '1' ? '超期' : '正常');
      },
    },
    {
      title: '检查单位',
      dataIndex: 'organizationName',
    },
    {
      title: '上次检查时间',
      dataIndex: 'lastCheckTime',
    },
    {
      title: '检查异常',
      dataIndex: 'abnormalNum',
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'incidentExpress-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
      handleSearchInfoFn: (params) => {
        if (orgOptions.value.length === 1) {
          params.organizationCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            organizationCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      beforeFetch: (params) => {
        statisticsInit(params);
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      showIndexColumn: true,
      actionColumn: {
        width: 100,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }] = tableContext;
  const statisticsInit = (params) => {
    getNum(params).then((res) => {
      abnormalNum.value = res.abnormalNum;
      deactivateNum.value = res.deactivateNum;
      enableNum.value = res.enableNum;
      planNum.value = res.planNum;
    });
  };
  const init = () => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'organizationCode',
        componentProps: {
          options: orgOptions.value,
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          organizationCode: [orgOptions.value[0]?.value],
        });
      }
      reload();
    });
  };
  init();
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
  return {
    getActions,
    registerTable,
    registerDrawer,
    abnormalNum,
    deactivateNum,
    enableNum,
    planNum,
  };
};
export default useContent;
