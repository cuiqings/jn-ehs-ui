import { BasicColumn, FormSchema } from '/@/components/Table';
export const searchFormSchema: FormSchema[] = [
  {
    label: '所属单位',
    field: 'orgCode',
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
    field: 'departCode',
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
];

export const columns: BasicColumn[] = [
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
    title: '创建人',
    dataIndex: 'createByName',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
];
