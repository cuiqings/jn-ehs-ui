import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useUserStore } from '/@/store/modules/user';
import { handoverList } from '../api';
import { useDrawer } from '/@/components/Drawer';
import dayjs from 'dayjs';
import { ref, nextTick } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();
export const useContent = () => {
  const userStore = useUserStore();
  const userInfo: any = userStore.getUserInfo;
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgCodeName',
      width: 130,
      resizable: true,
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
      width: 130,
      resizable: true,
    },
    {
      title: '上班时间',
      dataIndex: 'workTime',
      width: 140,
    },
    {
      title: '班次',
      dataIndex: 'teamName',
      width: 140,
      //添加status != '待交班'显示
      customRender: ({ record }) => {
        if (record.status != '1') {
          return record.teamName;
        }else{
          return null
        }
      },
    },
    {
      title: '交班人员',
      dataIndex: 'shiftsUserName',
      width: 140,
    },
    {
      title: '接班人员',
      dataIndex: 'successionUserName',
      width: 140,
    },
    {
      title: '领导签字',
      dataIndex: 'leadersUserName',
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
      label: '所属单位',
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
        onChange: (value, s) => {
          selectDeptNew({orgCode: s ? s.orgCode : value[0]}).then(res => {
            getForm().updateSchema([
              {
                field: 'workshop',
                componentProps: {
                  options: res,
                },
              }
            ])
          })
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
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
      label: '上班时间',
      field: 'workTime',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '待交班',
            value: '1',
          },
          {
            label: '待接班',
            value: '2',
          },
          {
            label: '待签字',
            value: '3',
          }
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
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: handoverList,
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
      actionColumn: {
        width: 130,
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
        label: '交班',
        auth: 'handoverWork:change',
        ifShow: record.status == 1 && userInfo.orgCode == record.workshop,
        onClick: handleChange.bind(null, record),
      },
      {
        label: '接班',
        auth: 'handoverWork:change',
        ifShow: record.status == 2 && userInfo.workSection == record.successionTeamId && userInfo.orgCode == record.workshop,
        onClick: handleChange.bind(null, record),
      },
      {
        label: '签字',
        auth: 'handoverWork:sign',
        ifShow: record.status == 3,
        onClick: handleLeadersSign.bind(null, record),
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  function handleChange(record) {
    // 如果数据里班组为空，则不让点，提示班组为空，不允许交班
    if (record.status == 1) {
      if (!record.teamName) {
        createMessage.error('班组为空，不允许交班');
        return;
      }
    }
    openDrawer(true, { title: record.status == 1 ? '交班' : '接班', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleDetail(record) {
    openDrawer(true, { title: '详情', record: JSON.parse(JSON.stringify(record)) });
  }
  function handleLeadersSign(record) {
    openDrawer(true, { title: '签字', record: JSON.parse(JSON.stringify(record)) });
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
