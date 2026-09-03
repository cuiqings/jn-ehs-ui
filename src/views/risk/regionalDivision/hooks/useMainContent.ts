import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, onMounted, computed } from 'vue';
import { useDrawer } from '/@/components/Drawer';
import { useMethods } from '/@/hooks/system/useMethods';
import { list, del, deleteBatch, getDepart3ListWithSecurity, getDeptNew } from '../url/index';
import { dateFormat } from '/@/utils/common/compUtils';
import { useUserStore } from '/@/store/modules/user';
export const useMainContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属单位',
      field: 'orgCode',
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
      field: 'recogUnit',
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
      title: '备注',
      width: 250,
      align: 'center',
      dataIndex: 'remark',
    },
    {
      title: '风险等级',
      width: 100,
      dataIndex: 'riskLevel',
      slots: { customRender: 'riskLevel' },
    },
    // {
    //   title: '是否标记',
    //   width: 100,
    //   dataIndex: 'markFlag',
    //   slots: { customRender: 'markFlag' },
    // },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, onImportXls, onExportXls, operateRequest } = useListPage({
    designScope: 'regionalDivision-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
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
          }
        },
      },
      showIndexColumn: true,
      immediate: false,
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      rowSelection: {
        fixed: 'left',
      },
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
          if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
            params.departCode = userInfo.value.orgCode;
            getForm().setFieldsValue({
              departCode: userInfo.value.orgCode,
            });
          }
        }
        return params;
      },
      actionColumn: {
        width: 160,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/rk/skRkRecog/importExcel',
      success: handleSuccess,
    },
    exportConfig: {
      name: '划分辨识单元-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/rk/skRkRecog/exportXls',
      suffix: 'xlsx',
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          disabled: orgOptions.value.length === 1,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            getForm().setFieldsValue({
              departCode: undefined,
            });
            getForm().updateSchema({
              field: 'departCode',
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
          orgCode: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0].value);
      }
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
        auth: ['regionalDivision:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['regionalDivision:del'],
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
    });
  };
  const handleView = (data: any) => {
    openDrawer(true, {
      type: 'view',
      title: '查看',
      showOkBtn: false,
      showFooter: true,
      data,
    });
  };
  const handleEdit = (data: any) => {
    openDrawer(true, {
      type: 'edit',
      title: '编辑',
      showOkBtn: true,
      showFooter: true,
      data,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(() => deleteBatch({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(() => del({ id: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  const onDownload = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('划分辨识单元-模板', '/rk/skRkRecog/downloadImportTemplate');
  };
  return {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onDownload,
    onImportXls,
    registerDrawer,
    handleSuccess,
    selectedRowKeys,
    batchHandleDelete,
    onExportXls,
  };
};
export default useMainContent;
