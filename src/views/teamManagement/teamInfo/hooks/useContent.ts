import { list, getDepart3ListWithSecurity, getDeptNew, synTeams } from '../url/index';
import { ref } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
export const useContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const loading = ref(false);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属单位',
      field: 'organizationCode',
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
      label: '所属车间',
      field: 'workshopCode',
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
      label: '班组名称',
      field: 'sectionName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '班组人员',
      field: 'teamUserNames',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      dataIndex: 'organizationName',
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
    },
    {
      title: '班组名称',
      dataIndex: 'sectionName',
    },
    {
      title: '班组人员',
      dataIndex: 'teamUserNames',
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['teamInfo:edit'],
        onClick: onEdit.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    designScope: 'teamInfo-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'workshopCode',
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
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.organizationCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            organizationCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 140,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      url: '/system/upSectionManagement/exportXls',
      name: '班组信息',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection }] = tableContext;
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
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
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            getForm().setFieldsValue({
              workshopCode: undefined,
            });
            getForm().updateSchema({
              field: 'workshopCode',
              componentProps: {
                options: [],
              },
            });
            if (value) {
              getDepartList(value);
            }
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          organizationCode: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0].value);
      }
      handleSuccess();
    });
  };
  init();
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'workshopCode',
        componentProps: {
          options: departOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
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
  const handleSuccess = () => {
    reload();
  };
  // 手动同步
  const handleSynchronous = () => {
    loading.value = true;
    try {
      synTeams().then(() => {
        handleSuccess();
      });
    } finally {
      loading.value = false;
    }
  };
  return {
    registerTable,
    getActions,
    handleSuccess,
    registerDrawer,
    handleSynchronous,
    loading,
    onExportXls,
    rowSelection,
  };
};
export default useContent;
