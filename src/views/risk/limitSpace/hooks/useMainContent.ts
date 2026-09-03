import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, onMounted } from 'vue';
import { useDrawer } from '/@/components/Drawer';
import { list, del, getDepart3ListWithSecurity } from '../url/index';
import { selectDeptNew } from '/@/api/common/api';
import { useMethods } from '/@/hooks/system/useMethods';
export const useMainContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const workshopOptions: any = ref([]);
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
      labelWidth: 90,
    },
    {
      label: '车间',
      field: 'workshop',
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
      label: '有限空间名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
      labelWidth: 90,
    },
    {
      label: '编号',
      field: 'code',
      component: 'Input',
      colProps: { span: 6 },
      labelWidth: 90,
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      fixed: 'center',
      dataIndex: 'orgName',
      width: 200,
    },
    {
      title: '车间',
      fixed: 'center',
      dataIndex: 'workshopName',
      width: 200,
    },
    {
      title: '类型',
      fixed: 'center',
      dataIndex: 'type',
    },
    {
      title: '有限空间名称',
      fixed: 'center',
      dataIndex: 'name',
    },
    {
      title: '编号',
      align: 'center',
      dataIndex: 'code',
    },
    {
      title: '位置及范围',
      align: 'center',
      dataIndex: 'location',
    },
    {
      title: '管理负责人',
      align: 'center',
      dataIndex: 'headUser',
    },
    {
      title: '危险有害因素',
      align: 'center',
      dataIndex: 'harmfulFactors',
    },
    {
      title: '是否安装警示牌及标识牌',
      align: 'center',
      dataIndex: 'warningSigns',
      width: 200,
    },
    {
      title: '本有限空间中最大作业人数',
      align: 'center',
      dataIndex: 'workUserNum',
      width: 200,
    },
    {
      title: '是否有作业指导书',
      align: 'center',
      dataIndex: 'instructionBook',
    },
    {
      title: '作业周期',
      align: 'center',
      dataIndex: 'workCycle',
    },
    // {
    //   title: '备注',
    //   align: 'center',
    //   dataIndex: 'remarks',
    // },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, operateRequest, onImportXls } = useListPage({
    designScope: 'limitSpaceCard-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'workshop',
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
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      immediate: false,
      showIndexColumn: true,
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
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
      url: '/limitSpace/import',
      success: handleSuccess,
    },
  });
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['limitSpace:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['limitSpace:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  onMounted(() => {
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
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            workshopOptions.value = [];
            getForm().setFieldsValue({
              workshop: undefined,
            });
            getForm().updateSchema({
              field: 'workshop',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
            if (value) {
              initWorkshop(value);
            }
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
        initWorkshop(orgOptions.value[0].value);
      }
      reload();
    });
  });
  const initWorkshop = (orgCode) => {
    selectDeptNew({ orgCode }).then((res) => {
      workshopOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'workshop',
        componentProps: {
          options: workshopOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
    });
  };
  const handleAdd = () => {
    openDrawer(true, {
      type: 'add',
      title: '新增',
      showOkBtn: true,
      showFooter: true,
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
    operateRequest(() => del({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(() => del({ ids: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  //导入模版下载
  const onExportTemplateXls = () => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx('有限空间模版', '/limitSpace/downloadTemplate');
  };
  return {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    registerDrawer,
    handleSuccess,
    selectedRowKeys,
    batchHandleDelete,
    onImportXls,
    onExportTemplateXls,
  };
};
export default useMainContent;
