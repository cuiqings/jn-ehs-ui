import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { evaluateList, evaluateDel } from '../../api';
import { useDrawer } from '/@/components/Drawer';
import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref, nextTick } from 'vue';
export const useContent = () => {
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '年份',
      dataIndex: 'year',
      width: 140,
      resizable: true,
    },
    {
      title: '单位名称',
      dataIndex: 'orgCodeName',
      width: 130,
      resizable: true,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
    },
  ];
  const orgList = ref<any[]>();
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '年份',
      field: 'year',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择',
        picker: 'year',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        format: 'YYYY',
        valueFormat: 'YYYY',
        style: { width: '100%' },
      },
    },
    {
      label: '单位名称',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        api: async () => {
          let res = await getDepart3ListWithSecurity();
          orgList.value = res;
          if(res.length == 1){
            getForm().setFieldsValue({
              orgCode: res[0].orgCode
            });
            selectDeptNew({orgCode: res[0].orgCode}).then(res => {
              getForm().updateSchema([
                {
                  field: 'workshop',
                  componentProps: {
                    options: res,
                  },
                }
              ])
            })
          }
          nextTick(() => {
            reload();
          })
          return res;
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
    {
      label: '状态', //显示label
      field: 'status', //查询字段
      component: 'Select', //渲染的组件
      componentProps: {
        options: [
          {
            label: '草稿',
            value: '0',
          },
          {
            label: '已发布',
            value: '1',
          },
          {
            label: '已结束',
            value: '2',
          },
        ],
        placeholder: '请选择',
      }
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();
  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: evaluateList,
      immediate: false,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
      },
      beforeFetch: (params) => {
        queryParams.value = params;
        return params;
      },
      showIndexColumn: true,
      rowSelection: { type: 'checkbox' },
      actionColumn: {
        width: 80,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '职业健康监护档案';
        return name;
      },
      url: '/archives/export',
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/archives/import',
      data: () => {
        return {};
      },
      success: () => {
        reload();
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { getSelectRows, reload, getForm }, { rowSelection }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        auth: 'createGoal:edit',
        ifShow: record.status == '草稿',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: 'createGoal:del',
        onClick: handleDel.bind(null, record),
      },
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
    ];
  }

  function handleDel(record) {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk() {
        evaluateDel({ id: record.id }).then(() => {
          reload();
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }
  function handleEdit(record) {
    openDrawer(true, { title: '编辑', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleView(record) {
    openDrawer(true, { title: '详情', record: JSON.parse(JSON.stringify(record)), view: true });
  }

  const add = () => {
    openDrawer(true, { title: '新增' });
  };
  function resetFunc() {
    if(orgList.value?.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgList.value[0].orgCode
      });
    }
  }
  return {
    getForm,
    // departList,
    add,
    reload,
    onExportXls,
    onImportXls,
    rowSelection,
    getSelectRows,
    registerTable,
    getTableAction,
    registerDrawer,
  };
};
