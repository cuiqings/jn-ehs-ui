import { list, getDepart3ListWithSecurity, getDeptNew, statisticsCompleteStatus } from '../url/index';
import { ref, reactive, h } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import dayjs from 'dayjs';
export const useContent = () => {
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属单位',
      field: 'org',
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
      field: 'depart',
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
      label: '班组名称',
      field: 'teamName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '上班方式',
      field: 'workType',
      component: 'Select',
      componentProps: {
        options: [
          { label: '三班倒', value: '1' },
          { label: '两班倒', value: '2' },
          { label: '长白班', value: '3' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '班次',
      field: 'teamOrder',
      component: 'Select',
      componentProps: {
        options: [
          { label: '甲', value: '甲' },
          { label: '乙', value: '乙' },
          { label: '丙', value: '丙' },
          { label: '常白班', value: '常白班' },
        ],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '班前会时间',
      field: 'time',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
      defaultValue: [dayjs().startOf('week').format('YYYY-MM-DD'), dayjs().endOf('week').format('YYYY-MM-DD')],
      colProps: { span: 6 },
      slot: 'time',
    },
    {
      label: '填写人员',
      field: 'submitByName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '是否完成',
      field: 'completeFlag',
      component: 'Select',
      componentProps: {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '安全活动',
      field: 'aqhdFlag',
      component: 'Select',
      componentProps: {
        options: [
          { label: '已完成', value: '1' },
          { label: '未完成', value: '0' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '周例会',
      field: 'zlhFlag',
      component: 'Select',
      componentProps: {
        options: [
          { label: '已完成', value: '1' },
          { label: '未完成', value: '0' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '安全视频',
      field: 'aqspFlag',
      component: 'Select',
      componentProps: {
        options: [
          { label: '已完成', value: '1' },
          { label: '未完成', value: '0' },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '是否召开班前会',
      field: 'bzkFlag',
      component: 'Select',
      componentProps: {
        options: [
          { label: '召开', value: '0' },
          { label: '不召开', value: '1' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '所属单位',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      dataIndex: 'departName',
    },
    {
      title: '班组名称',
      dataIndex: 'teamName',
    },
    {
      title: '上班方式',
      dataIndex: 'workType',
      customRender: ({ text }) => {
        return text === '1' ? '三班倒' : text === '2' ? '两班倒' : text === '3' ? '长白班' : '';
      },
    },
    {
      title: '班次',
      dataIndex: 'teamOrder',
    },
    {
      title: '是否完成',
      dataIndex: 'completeFlag',
      customRender: ({ text }) => {
        const label = text === '1' ? '是' : text === '0' ? '否' : '';
        const color = text === '1' ? 'green' : text === '0' ? 'red' : '';
        return h('span', { style: { color } }, label);
      },
    },
    {
      title: '安全活动',
      dataIndex: 'aqhdFlag',
      customRender: ({ text }) => {
        const label = text === '1' ? '是' : text === '0' ? '否' : '';
        const color = text === '1' ? 'green' : text === '0' ? 'red' : '';
        return h('span', { style: { color } }, label);
      },
    },
    {
      title: '周例会',
      dataIndex: 'zlhFlag',
      customRender: ({ text }) => {
        const label = text === '1' ? '是' : text === '0' ? '否' : '';
        const color = text === '1' ? 'green' : text === '0' ? 'red' : '';
        return h('span', { style: { color } }, label);
      },
    },
    {
      title: '安全视频',
      dataIndex: 'aqspFlag',
      customRender: ({ text }) => {
        const label = text === '1' ? '是' : text === '0' ? '否' : '';
        const color = text === '1' ? 'green' : text === '0' ? 'red' : '';
        return h('span', { style: { color } }, label);
      },
    },
    {
      title: '班会时间',
      dataIndex: 'preShiftTime',
    },
    {
      title: '填写人员',
      dataIndex: 'submitByName',
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
        auth: ['meetingBeforeClass:edit'],
        onClick: onEdit.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'meetingBeforeClass-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'depart',
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
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = Array.isArray(params.time) ? params.time : params.time.split(',');
          params['preShiftTimeStart'] = time[0];
          params['preShiftTimeEnd'] = time[1];
          delete params['time'];
        }
        if (orgOptions.value.length === 1) {
          params.org = orgOptions.value[0].value;
          getForm().setFieldsValue({
            org: orgOptions.value[0].value,
          });
        }
        // 查询时获取看板数据
        fetchBoardData();
        return params;
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 140,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }] = tableContext;

  const showBoard = ref(false);
  const boardNotWeek = ref(false);
  const boardData = reactive({
    aqhdCount: 0,
    aqhdCountBase: 0,
    zlhTeamCount: 0,
    zlhTeamCountBase: 0,
    zlhDeptCount: 0,
    zlhDeptCountBase: 0,
    aqspCount: 0,
    aqspCountBase: 0,
  });

  const fetchBoardData = async () => {
    const values = getForm().getFieldsValue();
    const time = values.time;
    const hasOrgOrDepart = values.org || values.depart;
    const hasTime = !!time;
    let isWeek = false;
    if (time) {
      const timeArr = Array.isArray(time) ? time : time.split(',');
      if (timeArr.length === 2) {
        const start = dayjs(timeArr[0]);
        const end = dayjs(timeArr[1]);
        isWeek = start.day() === 1 && end.day() === 0;
      }
    }
    if (hasOrgOrDepart && hasTime) {
      showBoard.value = true;
      if (isWeek) {
        boardNotWeek.value = false;
        const timeArr = Array.isArray(time) ? time : time.split(',');
        const params: any = { startDate: timeArr[0], endDate: timeArr[1] };
      if (values.org) params.orgCode = values.org;
      if (values.depart) params.departCode = values.depart;
      const res = await statisticsCompleteStatus(params);
      if (res) {
        Object.assign(boardData, res);
      }
      } else {
        boardNotWeek.value = true;
      }
    } else {
      showBoard.value = false;
      boardNotWeek.value = false;
    }
  };
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'org',
        componentProps: {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            getForm().setFieldsValue({
              depart: undefined,
            });
            getForm().updateSchema({
              field: 'depart',
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
          org: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0].value);
      }
      handleSuccess();
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
        field: 'depart',
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
  const handleSuccess = () => {
    reload();
    fetchBoardData();
  };
  return {
    registerTable,
    getActions,
    handleSuccess,
    registerDrawer,
    getForm,
    showBoard,
    boardNotWeek,
    boardData,
  };
};
export default useContent;
