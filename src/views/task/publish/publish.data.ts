import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '任务分类',
    width: 100,
    dataIndex: 'taskType_dictText',
  },
  {
    title: '类型',
    width: 100,
    dataIndex: 'reportRequire',
    customRender: ({ text }) => {
      if (text == 1) {
        return '长期任务';
      } else if (text == 2) {
        return '日常任务';
      }
    },
  },
  {
    title: '发布单位',
    width: 150,
    dataIndex: 'publishOrgName',
  },
  {
    title: '发布时间',
    width: 120,
    dataIndex: 'publishTime',
  },
  {
    title: '工作任务',
    dataIndex: 'workContent',
    width: 160,
  },
  {
    title: '完成时限',
    dataIndex: 'completeTimeLimit',
    width: 120,
  },
  {
    title: '汇报方式',
    width: 100,
    dataIndex: 'reportWay_dictText',
  },
  {
    title: '汇报时间',
    dataIndex: 'reportTime',
    width: 160,
  },
  {
    title: '责任单位',
    dataIndex: 'dutyUnitName',
    width: 160,
  },
  {
    title: '状态',
    width: 100,
    dataIndex: 'status_dictText',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '任务分类',
    field: 'taskType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'jn_publish_task_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '发布单位',
    field: 'publishOrgName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '发布时间',
    field: 'publishTime',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
  {
    field: 'workContent',
    label: '工作任务',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '完成时限',
    field: 'completeTimeLimit',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
  {
    label: '汇报方式',
    field: 'reportWay',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'jn_publish_report_way',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '责任单位',
    field: 'dutyUnitName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'status',
    label: '任务状态',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'jn_publish_status',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  // conspicuous spark
];
