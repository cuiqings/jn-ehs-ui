import { BasicColumn, FormSchema } from '/@/components/Table';

/**
 * 表格列配置
 */
export const columns: BasicColumn[] = [
  {
    title: '审批状态',
    dataIndex: 'approveStatus',
    width: 100,
  },
  {
    title: '当前处理人',
    dataIndex: 'currentHandler',
    width: 120,
  },
  {
    title: '计划编号',
    dataIndex: 'planCode',
    width: 180,
  },
  {
    title: '敬业云审批',
    dataIndex: 'jyCloudApproveStatus',
    width: 120,
  },
  {
    title: '计划名称',
    dataIndex: 'planName',
    width: 200,
  },
  {
    title: '计划分类',
    dataIndex: 'planType',
    width: 120,
    // customRender: ({ text }) => {
    //   const categoryMap = {
    //     '1': '安全培训',
    //     '2': '技能考核',
    //     '3': '资格认证',
    //     '4': '其他',
    //   };
    //   return categoryMap[text] || text;
    // },
  },
  {
    title: '计划开始时间',
    dataIndex: 'planBeginTime', 
    width: 180,
  },
  {
    title: '计划结束时间',
    dataIndex: 'planEndTime',
    width: 180,
  },
];

/**
 * 搜索表单配置
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '计划名称',
    field: 'planName',
    component: 'Input',
    componentProps: {
      placeholder: '请输入计划名称',
    },
    colProps: { span: 5 },
  },
  {
    label: '计划编号',
    field: 'planCode',
    component: 'Input',
    componentProps: {
      placeholder: '请输入计划编号',
    },
    colProps: { span: 5 },
  },
  {
    label: '计划开始时间',
    field: 'startTime',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
    },
    colProps: { span: 7 },
  },
  {
    label: '计划结束时间',
    field: 'endTime',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      onChange: (...v) => {
        console.log(v);
      },
    },
    colProps: { span: 7 },
  }
];