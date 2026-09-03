import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
export const columns: BasicColumn[] = [
  { title: '所属单位', dataIndex: 'organizationName' },
  { title: '车间', dataIndex: 'departName' },
  { title: '人员姓名', dataIndex: 'userRealname' },
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
  {
    title: '证书状态',
    dataIndex: 'certStatus',
    customRender: ({ text }) => {
      if (text === '0') {
        return h(Tag, { color: 'green' }, '正常');
      } else if (text === '1') {
        return h(Tag, { color: 'orange' }, '即将到期');
      } else if (text === '2') {
        return h(Tag, { color: 'red' }, '超期未审');
      }
    },
  },
  { title: '证书编号', dataIndex: 'certificationsCode' },
  { title: '取证时间', dataIndex: 'issueDate' },
  {
    title: '下次复审/换证日期',
    dataIndex: 'reviewTime',
  },
  { title: '备注', dataIndex: 'remark' },
  {
    title: '到期提醒',
    dataIndex: 'remindStatus',
    slots: { customRender: 'remindStatus' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '所属单位',
    field: 'organizationCode',
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
    label: '车间',
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
    label: '人员姓名',
    field: 'userRealname',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '证书类型',
    field: 'certificationsType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'pq_certificate_type',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '作业类别',
    field: 'workType',
    component: 'JDictSelectTag',
    componentProps: ({ formModel }) => {
      return {
        dictCode: 'person_list_work_type',
        stringToNumber: false,
        showChooseOption: false,
        onChange: () => {
          formModel.actionItems = undefined;
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '操作项目',
    field: 'actionItems',
    component: 'JDictSelectTag',
    componentProps: ({ formModel }) => {
      return {
        dictCode: formModel.workType,
        stringToNumber: false,
        showChooseOption: false,
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '证书状态',
    field: 'certStatus',
    component: 'Select',
    componentProps: {
      options: [
        { label: '正常', value: '0' },
        { label: '即将到期', value: '1' },
        { label: '超期未审', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '证书编号',
    field: 'certificationsCode',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '取证时间',
    field: 'time',
    component: 'RangeDate',
    componentProps: {
      style: {
        width: '100%',
      },
    },
    colProps: { span: 6 },
  },
  {
    label: '备注',
    field: 'remark',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '签字状态',
    field: 'signStatus',
    component: 'Select',
    componentProps: {
      options: [
        { label: '待检查签字', value: '0' },
        { label: '待确认签字', value: '1' },
      ],
    },
    colProps: { span: 6 },
  },
];
