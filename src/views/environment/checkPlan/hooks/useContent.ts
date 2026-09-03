import { getOrganizationNew, list, deleteBatch, del, enable, deactivate } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { createVNode, h, ref } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
export const useContent = () => {
  const { createConfirm } = useMessage();
  const orgOptions: any = ref([]);
  //注册drawer
  const [registerDrawer, { openDrawer }] = useDrawer();
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属机构',
      field: 'organizationCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
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
      label: '执行人',
      field: 'checkName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '是否启用',
      field: 'isEnable',
      component: 'Select',
      defaultValue: [],
      componentProps: {
        options: [
          { label: '启用', value: '0' },
          { label: '停用', value: '1' },
        ],
        placeholder: '请选择',
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属机构',
      dataIndex: 'organizationName',
    },
    {
      title: '计划名称',
      dataIndex: 'checkPlanName',
    },
    {
      title: '检查频率',
      dataIndex: 'checkFrequency_dictText',
    },
    {
      title: '执行人',
      dataIndex: 'checkName',
    },
    {
      title: '是否启用',
      dataIndex: 'isEnable',
      customRender: ({ text }) => {
        return text === '0' ? h('span', {}, '启用') : h('span', {}, '停用');
      },
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
        auth: ['checkPlan:edit'],
        onClick: onEdit.bind(null, record),
        ifShow: record.isEnable === '1',
      },
      {
        label: '删除',
        auth: ['checkPlan:del'],
        onClick: onDel.bind(null, record),
        ifShow: record.isEnable === '1',
      },
      {
        label: '启用',
        onClick: onEnable.bind(null, record),
        ifShow: record.isEnable === '1',
      },
      {
        label: '停用',
        onClick: onDeactivate.bind(null, record),
        ifShow: record.isEnable === '0',
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext, doRequest } = useListPage({
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
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      showIndexColumn: true,
      actionColumn: {
        width: 220,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
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
          organizationCode: orgOptions.value[0]?.value,
        });
      }
      reload();
    });
  };
  init();
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
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        del({ id: data.id }).then((res) => {
          if (res) {
            handleSuccess();
          }
        });
      },
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    doRequest(() => deleteBatch({ ids: selectedRowKeys.value }));
  };
  // 启用
  const onEnable = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '启用',
      content: '确定要启用吗？',
      onOk: () => {
        enable({ id: data.id }).then((res) => {
          if (res) {
            handleSuccess();
          }
        });
      },
    });
  };
  // 停用
  const onDeactivate = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '停用',
      content: '确定要停用吗？',
      onOk: () => {
        deactivate({ id: data.id }).then((res) => {
          if (res) {
            handleSuccess();
          }
        });
      },
    });
  };
  const handleSuccess = () => {
    reload();
  };
  return {
    getActions,
    registerTable,
    batchHandleDelete,
    selectedRowKeys,
    onAdd,
    rowSelection,
    handleSuccess,
    registerDrawer,
  };
};
export default useContent;
