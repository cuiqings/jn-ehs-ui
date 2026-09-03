import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  { title: '所属单位', dataIndex: 'organizationName' },
  { title: '车间', dataIndex: 'departName' },
  {
    title: '证书类型',
    dataIndex: 'certificationsType_dictText',
  },
  {
    title: '作业类别',
    dataIndex: 'workType_dictText',
  },
  {
    title: '操作项目',
    dataIndex: 'actionItems_dictText',
  },
  { title: '通知人', dataIndex: 'userName' },
  {
    title: '是否通知持证人',
    dataIndex: 'whetherRemindOwner',
    customRender: ({ text }) => {
      return text === '1' ? '是' : '否';
    },
  },
  {
    title: '提醒设置',
    dataIndex: 'beforeExpirationDay',
    customRender: ({ text }) => {
      return `到期前${text}天`;
    },
  },
  {
    title: '提醒频度',
    dataIndex: 'remindLevelOneFrequency',
    customRender: ({ text }) => {
      return `每${text}天1次`;
    },
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    label: '所属单位',
    field: 'organizationCode',
    component: 'Select',
    componentProps: {
      options: [],
      placeholder: '请选择',
      showSearch: true,
      filterOption: (input: string, option: any) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
    },
    colProps: { span: 6 },
  },
  {
    label: '证书类型',
    field: 'certificationsType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'pq_certificate_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
];
