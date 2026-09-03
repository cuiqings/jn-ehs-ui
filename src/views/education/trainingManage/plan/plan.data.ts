import { FormSchema } from '/@/components/Table';
export const detailColumns = [
  {
    title: '培训类型',
    dataIndex: 'trainProject_text',
    width: 100,
  },
  {
    title: '培训内容',
    dataIndex: 'content',
    width: 100,
  },
  {
    title: '培训学时',
    dataIndex: 'hours',
    width: 100,
  },
  {
    title: '培训对象',
    dataIndex: 'trainObject',
    width: 100,
  },
  {
    title: '实施单位',
    dataIndex: 'implementingUnits',
    width: 100,
  },
  {
    title: '授课人员',
    dataIndex: 'teachingHead_text',
    width: 100,
  },
  {
    title: '计划培训时间',
    dataIndex: 'trainTime',
    width: 100,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 100,
  },
  // {
  //   title: '培训任务',
  //   dataIndex: 'createTime',
  //   width: 100,
  // },
];
export const searchDetailFormSchema: FormSchema[] = [
  {
    field: 'trainProject',
    label: '培训类型',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'edu_train_project',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '培训内容',
    field: 'content',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'trainObject',
    label: '培训对象',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'implementingUnits',
    label: '实施单位',
    component: 'Input',
    colProps: { span: 6 },
  },
];
export const detailFormSchema: FormSchema[] = [
  {
    field: 'id',
    label: '',
    component: 'Input',
    show: false,
  },
  {
    label: '培训类型',
    field: 'trainProject',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'edu_train_project',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
  },
  {
    label: '培训内容',
    field: 'content',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      autoSize: false,
      rows: 3,
      maxlength: 300,
      showCount: true,
    },
  },
  {
    field: 'hours',
    label: '培训学时',
    required: true,
    component: 'Input',
    // 50字以内
    componentProps: {
      maxlength: 50,
    },
  },
  {
    field: 'trainObject',
    label: '培训对象',
    required: true,
    component: 'Input',
    // 50字以内
    componentProps: {
      maxlength: 50,
    },
  },
  {
    field: 'implementingUnits',
    label: '实施单位',
    required: true,
    component: 'Input',
    // 50字以内
    componentProps: {
      maxlength: 50,
    },
  },
  // 授课人员 teachingHead
  {
    field: 'teachingHead',
    label: '授课人员',
    required: true,
    component: 'Input',
    slot: 'teachingHead',
  },
  {
    field: 'trainTime',
    label: '计划培训时间',
    required: true,
    component: 'Input',
    // 50字以内
    componentProps: {
      maxlength: 50,
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'Input',
    // 50字以内
    componentProps: {
      maxlength: 50,
    },
  },
];
