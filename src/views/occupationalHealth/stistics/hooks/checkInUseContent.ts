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
    },
    {
      title: '所属车间',
      dataIndex: 'workshop',
    },
    {
      title: '岗位',
      dataIndex: 'post',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '工号',
      dataIndex: 'workNo',
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
    },
    {
      title: '性别',
      dataIndex: 'sex',
    },
    {
      title: '年龄',
      dataIndex: 'age',
    },
    {
      title: '籍贯',
      dataIndex: 'nativePlace',
    },
    {
      title: '状态',
      dataIndex: 'status',
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
          await getForm().setFieldsValue({
            statusFc: '0',
          });
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
      label: '封存状态',
      field: 'statusFc',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        defaultValue: '0',
        allowClear: false,
        options: [
          {
            label: '正常',
            value: '0',
          },
          {
            label: '封存',
            value: '1',
          },
        ],
      },
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
            label: '未完成',
            value: '2',
          },
        ],
      },
    },
  ];

  const [registerDrawerCheckIn, { }] = useDrawer();
  const [registerDrawerDetail, { openDrawer:  openDrawerDetail }] =  useDrawer();

  // const departList = await getDepart3ListWithSecurity();
  const queryParams = ref({
    orgCode: undefined,
  });
  // 列表页面公共参数、方法
  const { tableContext, onExportXls: onExportXlsCheckIn } = useListPage({
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
        console.log(params, 999)
        if(orgList.value.length == 1 && !params.orgCode){
          params.orgCode = orgList.value[0].orgCode;
          getForm().setFieldsValue({
            orgCode: orgList.value[0].orgCode,
          });
        }
        params.type = 1;
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
      },
    },
    exportConfig: {
      name: () => {
        let name = '';
        name = dayjs(new Date()).format('YYYYMMDD') + '检测录入统计';
        return name;
      },
      url: '/archives/export',
      suffix: 'xlsx',
    }
  });
  //BasicTable绑定注册
  const [registerTableCheckIn, { reload, getForm }] = tableContext;
  const statisticsData = ref({
    "total": 0,
    "finish": 0,
    "rate": 0
  });
  function getFileStatistics(params) {
    statistics(params).then(res => {
      statisticsData.value = res;
    })
  }
   /**
     * 操作栏
     */
    function getTableActionCheckIn(record): ActionItem[] {
      return [
        {
          label: '查看',
          auth: 'occupationalHealth:checkup:review',
          onClick: handleReview.bind(null, record),
        },
      ];
    }
  function handleReview(record) {
    openDrawerDetail(true, { title: '详情', record });
  }

  function resetFunc() {
    if (orgList.value?.length == 1) {
      getForm().setFieldsValue({
        orgCode: orgList.value[0].orgCode,
      });
    }
  }
  
  return {
    checkInReload: reload,
    getTableActionCheckIn,
    onExportXlsCheckIn,
    registerTableCheckIn,
    registerDrawerCheckIn,
    statisticsDataCheckIn: statisticsData,
    registerDrawerDetail,
  };
};
