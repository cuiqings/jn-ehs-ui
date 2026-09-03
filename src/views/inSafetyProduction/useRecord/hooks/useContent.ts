import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { useLedgerPageList, useLedgerDelete } from '../api';
import { useDrawer } from '/@/components/Drawer';
import { Modal } from 'ant-design-vue';
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';

export const useContent = () => {
  const orgList = ref([]);

  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      customRender: ({ index }) => index + 1,
    },
    {
      title: '年度',
      dataIndex: 'year',
      width: 100,
    },
    {
      title: '使用单位',
      dataIndex: 'orgCode',
      width: 150,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 180,
    },
    {
      title: '内容',
      dataIndex: 'projectContent',
      width: 200,
    },
    {
      title: '车间/科室',
      dataIndex: 'workshop',
      width: 120,
    },
    {
      title: '项目负责人',
      dataIndex: 'projectLeaderName',
      width: 120,
    },
    {
      title: '计划金额(元)',
      dataIndex: 'amount',
      width: 120,
    },
    {
      title: '实际金额(元)',
      dataIndex: 'amount',
      width: 120,
    },
    {
      title: '登记日期',
      dataIndex: 'checkInTime',
      width: 120,
    },
  ];

  // 表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '年度',
      field: 'year',
      component: 'DatePicker',
      componentProps: {
        placeholder: '全部',
        format: 'YYYY',
        valueFormat: 'YYYY',
        picker: 'year',
        style: { width: '100%' },
      },
    },
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        api: async () => {
          let res = await getDepart3ListWithSecurity();
          if (res.length == 1) {
            getForm().setFieldsValue({
              orgCode: res[0].orgCode,
            });
            selectDeptNew({ orgCode: res[0].orgCode }).then((dres) => {
              getForm().updateSchema([
                {
                  field: 'workshop',
                  componentProps: {
                    options: dres,
                  },
                },
              ]);
            });
            orgList.value = res;
          }
          reload();
          return res;
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        onChange: (value) => {
          if (Array.isArray(value)) return;
          selectDeptNew({ orgCode: value }).then((res) => {
            getForm().setFieldsValue({
              workshop: '',
            });
            getForm().updateSchema([
              {
                field: 'workshop',
                componentProps: {
                  options: res,
                },
              },
            ]);
          });
        },
      },
    },
    {
      label: '项目内容',
      field: 'projectContent',
      component: 'Input',
      componentProps: {
        placeholder: '请输入项目内容',
      },
    },
    {
      label: '所属车间',
      field: 'workshop',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
    {
      label: '项目负责人',
      field: 'projectLeader',
      component: 'Input',
      componentProps: {
        placeholder: '请输入项目负责人姓名',
      },
    },
  ];

  onMounted(() => {
    getForm().setFieldsValue({
      year: new Date().getMonth() > 8 ? dayjs().add(1, 'year').format('YYYY') : dayjs().format('YYYY'),
    });
  });
  const [registerDrawer, { openDrawer }] = useDrawer();

  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    designScope: 'use-record-table',
    tableProps: {
      api: useLedgerPageList,
      columns: columns,
      // immediate: false,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        if (orgList.value.length == 1) {
          params.orgCode = orgList.value[0].orgCode;
          getForm().setFieldsValue({
            orgCode: orgList.value[0].orgCode,
          });
        }
        return params;
      },
      showIndexColumn: false,
      rowKey: 'id',
      rowSelection: {
        type: 'checkbox',
      },
    },
    exportConfig: {
      url: '/useLedger/export',
      name: '使用台账-' + dayjs().format('YYYY-MM-DD'),
      suffix: 'xlsx',
    },
  });

  const [registerTable, { reload, getSelectRows, getForm }, { rowSelection }] = tableContext;

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        color: 'error',
      },
    ];
  }

  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }

  function handleDelete(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        // 调用删除API
        useLedgerDelete({ ids: [record.id] }).then((res) => {
          reload();
        });
      },
      onCancel() {
        console.log('取消删除');
      },
    });
  }

  const add = () => {
    openDrawer(true, { title: '登记费用使用情况' });
  };

  const batchExport = () => {
    const selectedRows = getSelectRows();
    if (selectedRows.length === 0) {
      Modal.warning({
        title: '提示',
        content: '请选择要导出的记录',
      });
      return;
    }
    console.log('批量导出:', selectedRows);
  };

  const batchDelete = () => {
    const selectedRows = getSelectRows();
    if (selectedRows.length === 0) {
      Modal.warning({
        title: '提示',
        content: '请选择要删除的记录',
      });
      return;
    }
    Modal.confirm({
      title: '确定要批量删除选中的记录吗?',
      onOk() {
        console.log('批量删除:', selectedRows);
        useLedgerDelete({ ids: selectedRows.map((item) => item.id) }).then((res) => {
          reload();
        });
      },
    });
  };

  return {
    add,
    reload,
    registerTable,
    getTableAction,
    registerDrawer,
    batchExport,
    batchDelete,
    rowSelection,
    onExportXls,
  };
};
