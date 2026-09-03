import { FormSchema, BasicColumn } from '/@/components/Table';
export const columns = <BasicColumn[]>[
  {
    title: '培训计划',
    dataIndex: 'trainPlanName',
    width: 100,
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    width: 100,
  },
  {
    title: '培训项目',
    dataIndex: 'trainProjectName',
    width: 100,
  },
  {
    title: '培训内容',
    dataIndex: 'trainContent',
    width: 100,
  },
  {
    title: '实施单位',
    dataIndex: 'enforceName',
    width: 100,
  },
  {
    title: '实施方式',
    dataIndex: 'type',
    width: 100,
  },
  {
    title: '培训学时',
    dataIndex: 'duration',
    width: 80,
  },
  {
    title: '参加人员',
    dataIndex: 'person',
    width: 100,
  },
  {
    title: '培训人数',
    dataIndex: 'trainNum',
    width: 100,
  },
  {
    title: '培训时间',
    dataIndex: 'taskDate',
    ellipsis: false,
    width: 180,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    slots: { customRender: 'status' },
  },
  {
    title: '创建单位',
    dataIndex: 'orgCodeName',
    width: 100,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'enforceName',
    label: '实施单位',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'taskName',
    label: '任务名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'trainProjectId',
    label: '培训项目',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '培训内容',
    field: 'trainContent',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'trainPlanId',
    label: '培训计划',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'type',
    label: '实施方式',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: '线上',
          value: '1',
        },
        {
          label: '线下',
          value: '2',
        },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'person',
    label: '参加人员',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '培训时间',
    field: 'taskTime',
    component: 'RangeDate',
    componentProps: {
      showTime: false,
      style: {
        width: '100%',
      },
    },
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      options: [
        { label: '正常', value: '1' },
        { label: '超期', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '创建单位',
    field: 'orgCodeName',
    component: 'Input',
    // component: 'JTreeSelect1',
    // componentProps: ({ formModel }) => {
    //   return {
    //     url: '/jn/common/getDepartTreeFor23',
    //     fieldNames: {
    //       label: 'departName',
    //       value: 'orgCode',
    //       options: 'children',
    //     },
    //   };
    // },
    colProps: { span: 6 },
  },
];
export const taskColumns = [
  {
    title: '阶段名称',
    dataIndex: 'stageName',
    width: 100,
    align: 'center',
  },
  {
    title: '培训方式',
    dataIndex: 'trainType',
    width: 80,
    align: 'center',
  },
  {
    title: '实施单位',
    dataIndex: 'enforceCode',
    width: 100,
    align: 'center',
  },
  {
    title: '教育者',
    dataIndex: 'trainPerson',
    width: 90,
    align: 'center',
  },
  {
    title: '课时',
    dataIndex: 'course',
    width: 160,
    ellipsis: true,
    align: 'center',
    slots: { customRender: 'course' },
  },
  {
    title: '签到',
    dataIndex: 'signIn',
    width: 60,
    align: 'center',
    // customRender: ({ record }) => {
    //   return record.signIn === '1' ? '是' : '否';
    // }
  },
];
