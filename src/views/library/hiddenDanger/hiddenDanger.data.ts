import { FormSchema, BasicColumn } from '/@/components/Table';
export const columns = <BasicColumn[]>[
  {
    title: '隐患库ID',
    dataIndex: 'yhId',
    width: 100,
  },
  {
    title: '隐患描述',
    dataIndex: 'yhDescription',
    width: 150,
  },
  {
    title: '检查依据',
    dataIndex: 'checkStandard',
    width: 150,
  },
  {
    title: '标准的类别',
    dataIndex: 'standardCategory_dictText',
    width: 100,
  },
  {
    title: '整改建议',
    dataIndex: 'repairSuggestion',
    width: 150,
  },
  {
    title: '隐患等级',
    dataIndex: 'yhLevel_dictText',
  },
  {
    title: '所属行业',
    dataIndex: 'industry',
  },
  {
    title: '所属企业',
    dataIndex: 'company',
    width: 100,
  },
  {
    title: '主要危害',
    dataIndex: 'majorHazard_dictText',
  },
  {
    title: '隐患类别',
    dataIndex: 'yhCategory_dictText',
  },
  {
    title: '整改措施分类',
    dataIndex: 'problemCategory_dictText',
    width: 150,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'yhDescription',
    label: '隐患描述',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'checkStandard',
    label: '检查依据',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'repairSuggestion',
    label: '整改建议',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '整改措施分类',
    field: 'problemCategory',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '所属行业',
    field: 'industry',
    component: 'Input',
    colProps: { span: 6 },
  },
];
