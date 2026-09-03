import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref } from 'vue';
import { useModal } from '/@/components/Modal';
import { useMethods } from '/@/hooks/system/useMethods';
import dayjs from 'dayjs';
import { list, del, getDepart3ListWithSecurity, getDeptNew } from '../url/index';
export const useMainContent = () => {
  const [registerModal, { openModal }] = useModal();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
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
      label: '标题',
      field: 'title',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '申请人',
      field: 'applyByName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          { label: '待评审', value: '1' },
          { label: '已评审', value: '2' },
          { label: '待审核', value: '3' },
          { label: '已审核', value: '4' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '申请类型',
      width: 150,
      align: 'center',
      dataIndex: 'applyType',
      customRender: ({ text }) => {
        return text === '1' ? '专业评审' : '提交审核';
      },
    },
    {
      title: '所属单位',
      width: 250,
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      width: 250,
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '标题',
      width: 250,
      dataIndex: 'title',
    },
    {
      title: '数量',
      width: 100,
      align: 'center',
      dataIndex: 'number',
    },
    {
      title: '申请人',
      width: 150,
      dataIndex: 'applyByName',
    },
    {
      title: '申请时间',
      width: 200,
      align: 'center',
      dataIndex: 'applyTime',
    },
    {
      title: '评审状态',
      width: 150,
      dataIndex: 'status',
      slots: { customRender: 'status' },
    },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, operateRequest } = useListPage({
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
      indexColumnProps: {
        fixed: 'left',
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
        }
        return params;
      },
      actionColumn: {
        width: 240,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { selectedRowKeys }] = tableContext;
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
        field: 'departCode',
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
  const getActions = (record: any) => {
    return [
      {
        label: '导出',
        auth: ['reviewRelease:export'],
        onClick: handleExport.bind(null, record),
      },
      {
        label: '评审',
        auth: ['reviewRelease:review'],
        ifShow: record.status === '1' && record.canHandle,
        onClick: handleReviewRelease.bind(null, record),
      },
      {
        label: '审核',
        auth: ['reviewRelease:audit'],
        ifShow: record.status === '3' && record.canHandle,
        onClick: handleReviewRelease.bind(null, record),
      },
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '删除',
        auth: ['reviewRelease:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleReviewRelease = (data: any) => {
    openModal(true, {
      type: 'review',
      title: data.applyType === '1' ? '评审' : '审核',
      data,
    });
  };
  const handleView = (data: any) => {
    openModal(true, {
      type: 'view',
      title: '查看',
      data,
    });
  };
  const handleDelete = (data: any) => {
    operateRequest(() => del({ id: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  //导出
  const handleExport = (record) => {
    const { handleExportXlsx } = useMethods();
    handleExportXlsx(`${dayjs(new Date()).format('YYYYMMDD')}${record.orgName}风险评审审核`, '/rk/skRkApply/exportApply', {
      id: record.id,
    });
  };
  return {
    registerTable,
    getActions,
    registerModal,
    handleSuccess,
  };
};
export default useMainContent;
