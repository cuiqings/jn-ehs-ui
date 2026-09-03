import { useListPage } from '/@/hooks/system/useListPage';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { list, del, getDepart3ListWithSecurity } from '../url/index';
import { useModal } from '/@/components/Modal';
import { ref } from 'vue';
export const useMainContent = () => {
  const [registerEditModal, openEdit] = useModal();
  const [registerUserModal, { openModal }] = useModal();
  const orgOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '证书名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '编号',
      field: 'certNo',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '获得人员',
      field: 'userName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '创建时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
      colProps: { span: 6 },
    },
    {
      label: '创建单位',
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
  ];
  const columns = <BasicColumn[]>[
    {
      title: '证书名称',
      align: 'center',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '获得人员',
      align: 'center',
      dataIndex: 'userNum',
      slots: { customRender: 'userNum' },
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createTime',
    },
    {
      title: '创建人',
      align: 'center',
      dataIndex: 'createUser',
    },
    {
      title: '创建单位',
      align: 'center',
      dataIndex: 'orgCode',
    },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, onImportXls, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
      },
      showIndexColumn: true,
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      rowSelection: {
        fixed: 'left',
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['strTime'] = time[0] + ' 00:00:00';
          params['endTime'] = time[1] + ' 23:59:59';
          delete params['time'];
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
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      reload();
    });
  };
  init();
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['rsCertificate:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['rsCertificate:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openEdit.openModal(true, {
      title: '新建证书',
      type: 'add',
    });
  };
  const handleEdit = (data: any) => {
    openEdit.openModal(true, {
      title: '修改证书',
      type: 'edit',
      id: data.id,
      render: data.render,
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
  // 获取人员列表
  const handleUserNum = (data: any) => {
    openModal(true, {
      id: data.id,
    });
  };
  return {
    registerTable,
    getActions,
    rowSelection,
    handleAdd,
    onImportXls,
    handleSuccess,
    selectedRowKeys,
    batchHandleDelete,
    registerEditModal,
    handleUserNum,
    registerUserModal,
  };
};
export default useMainContent;
