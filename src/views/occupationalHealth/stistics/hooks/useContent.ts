import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { ActionItem, BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { statisticsList, statistics } from '../../api';
import { useDrawer } from '/@/components/Drawer';
import dayjs from 'dayjs';
import { ref } from 'vue';
export const useContent = () => {
  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgCode',
      width: 130,
    },
    {
      title: '所属车间',
      dataIndex: 'workshop',
      width: 140,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '工号',
      dataIndex: 'workNo',
      width: 100,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 90,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 90,
    },
    {
      title: '体检种类',
      dataIndex: 'examineType',
      width: 100,
    },
    {
      title: '职业危害',
      dataIndex: 'hazardFactors',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
    },
    {
      title: '检查结果',
      dataIndex: 'checkResult',
    },
  ];
  const orgList = ref<any[]>([]);
  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        api: async () => {
          const res = await getDepart3ListWithSecurity();
          orgList.value = res;
          if (res.length == 1) {
            await getForm().setFieldsValue({
              orgCode: res[0].orgCode,
            });
            selectDeptNew({ orgCode: res[0].orgCode }).then((res) => {
              getForm().updateSchema([
                {
                  field: 'workshop',
                  componentProps: {
                    options: res,
                  },
                },
              ]);
            });
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
              workshop: undefined,
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
      label: '年份',
      field: 'year',
      component: 'DatePicker',
      componentProps: {
        style:  { width: '100%' },
        picker:  'year',
        placeholder: '请选择',
        valueFormat: 'YYYY',
        formatter: (date) => {
          return dayjs(date).format('YYYY');
        },
      },
    },
    {
      label: '岗位', //显示label
      field: 'post', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '姓名', //显示label
      field: 'name', //查询字段
      component: 'Input', //渲染的组件
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '完成',
            value: '1',
          },
          {
            label: '待体检',
            value: '2',
          }
        ],
      },
    },
    {
      label: '检查结果',
      field: 'checkResult',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '未见异常',
            value: '1',
          },
          {
            label: '疑似职业病',
            value: '2',
          },
          {
            label: '禁忌证',
            value: '3',
          },
          {
            label: '其他疾患',
            value: '4',
          },
          {
            label: '复查',
            value: '5',
          },
        ],
      },
    },
    {
      label: '体检种类',
      field: 'examineType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          {
            label: '岗前',
            value: '1',
          },
          {
            label: '在岗',
            value: '2',
          },
          {
            label: '离职',
            value: '3',
          },
        ],
      },
    },
  ];

  const [registerDrawer, { openDrawer }] = useDrawer();

  const queryParams = ref({
    orgCode: undefined,
  });
  const orgcode = ref('');
  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    designScope: 'occupationalHealth-files-table',
    tableProps: {
      api: statisticsList,
      immediate: false,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: resetFunc,
      },
      beforeFetch: (params) => {
        if(orgList.value.length == 1 && !params.orgCode){
          params.orgCode = orgList.value[0].orgCode;
          getForm().setFieldsValue({
            orgCode: orgList.value[0].orgCode,
          });
        }
        params.type = 2;
        queryParams.value = params;
        getFileStatistics(params);
        return params;
      },
      showIndexColumn: true,
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
        name = dayjs(new Date()).format('YYYYMMDD') + '职业健康体检统计';
        return name;
      },
      url: '/archives/export',
      suffix: 'xlsx',
    }
  });
  //BasicTable绑定注册
  const [registerTable, { reload, getForm }] = tableContext;
  const statisticsData = ref({
    "total": 0,
    "finish": 0,
    "rate": ""
  });
  function getFileStatistics(params) {
    statistics(params).then(res => {
      statisticsData.value = res;
    })
  }
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '查看',
        auth: 'occupationalHealth:checkup:review',
        onClick: handleReview.bind(null, record),
      },
    ];
  }

  function handleReview(record) {
    openDrawer(true, { title: '详情', record });
  }

  const updateCode = (code) => {
    orgcode.value = code;
  };
  function resetFunc() {
    if (orgList.value?.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgList.value[0].orgCode,
      });
    }
  }
  return {
    reload,
    getForm,
    updateCode,
    onExportXls,
    registerTable,
    getTableAction,
    registerDrawer,
    openDrawer,
    statisticsData
  };
};
