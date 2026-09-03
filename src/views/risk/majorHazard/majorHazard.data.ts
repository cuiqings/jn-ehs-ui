import { BasicColumn, FormSchema } from '/@/components/Table';

// 类型选项
export const typeOptions = [
  { label: '煤气柜', value: '1' },
  { label: '制氧', value: '2' },
];

// 级别选项
export const levelOptions = [
  { label: '一级', value: '1' },
  { label: '二级', value: '2' },
  { label: '三级', value: '3' },
  { label: '四级', value: '4' },
];

// 表格列
export const columns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'name',
    width: 150,
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 80,
    customRender: ({ text }) => {
      const map = { '1': '煤气柜', '2': '制氧' };
      return map[text] || text;
    },
  },
  {
    title: '级别',
    dataIndex: 'level',
    width: 80,
    customRender: ({ text }) => {
      const map = { '1': '一级', '2': '二级', '3': '三级', '4': '四级' };
      return map[text] || text;
    },
  },
  {
    title: '容量',
    dataIndex: 'capacity',
    width: 100,
  },
  {
    title: '柜位',
    dataIndex: 'position',
    width: 100,
  },
  {
    title: '温度',
    dataIndex: 'temperature',
    width: 80,
  },
  {
    title: '液位',
    dataIndex: 'liquidLevel',
    width: 100,
  },
  {
    title: '碳氢化合物含量',
    dataIndex: 'hydrocarbonContent',
    width: 140,
  },
  {
    title: '技术责任人',
    dataIndex: 'techPerson_dictText',
    width: 120,
  },
  {
    title: '操作责任人',
    dataIndex: 'operatePerson_dictText',
    width: 120,
  },
  {
    title: '标记坐标',
    dataIndex: 'coordinate',
    width: 120,
    customRender: ({ record }) => {
      if (record.markX && record.markY) {
        return `(${record.markX}, ${record.markY})`;
      }
      return '未标记';
    },
  },
];

// 查询表单
export const searchFormSchema: FormSchema[] = [
  {
    field: 'type',
    label: '类型',
    component: 'Select',
    componentProps: {
      options: typeOptions,
      placeholder: '请选择类型',
    },
    colProps: { span: 6 },
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'level',
    label: '级别',
    component: 'Select',
    componentProps: {
      options: levelOptions,
      placeholder: '请选择级别',
    },
    colProps: { span: 6 },
  },
];

// 新增/编辑表单 - 统一schema，通过ifShow控制字段显隐
export const formSchema: FormSchema[] = [
  {
    field: 'type',
    label: '类型',
    component: 'Select',
    required: true,
    defaultValue: '1',
    componentProps: {
      options: typeOptions,
      placeholder: '请选择类型',
    },
    colProps: { span: 24 },
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    required: true,
    componentProps: {
      maxLength: 50,
      placeholder: '请输入名称',
    },
    colProps: { span: 24 },
  },
  {
    field: 'level',
    label: '级别',
    component: 'Select',
    required: true,
    componentProps: {
      options: levelOptions,
      placeholder: '请选择级别',
    },
    colProps: { span: 24 },
  },
  {
    field: 'capacity',
    label: '容量',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入容量',
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => values.type === '1',
  },
  {
    field: 'position',
    label: '柜位',
    component: 'Input',
    componentProps: {
      placeholder: '请输入柜位',
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => values.type === '1',
  },
  {
    field: 'temperature',
    label: '温度',
    component: 'Input',
    componentProps: {
      placeholder: '请输入温度',
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => values.type === '1',
  },
  {
    field: 'liquidLevel',
    label: '液位',
    component: 'Input',
    componentProps: {
      placeholder: '请输入液位',
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => values.type === '2',
  },
  {
    field: 'hydrocarbonContent',
    label: '碳氢化合物含量',
    component: 'Input',
    componentProps: {
      placeholder: '请输入碳氢化合物含量',
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => values.type === '2',
  },
  {
    field: 'techPerson',
    label: '技术责任人',
    component: 'JSelectUser',
    componentProps: {
      rowKey: 'username',
      labelKey: 'realname',
      maxSelectCount: 1,
    },
    colProps: { span: 24 },
  },
  {
    field: 'operatePerson',
    label: '操作责任人',
    component: 'JSelectUser',
    componentProps: {
      rowKey: 'username',
      labelKey: 'realname',
      maxSelectCount: 1,
    },
    colProps: { span: 24 },
  },
];
