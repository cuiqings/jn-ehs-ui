import { FormSchema } from '/@/components/Table';

export const columns = [
  {
    title: '所属单位',
    dataIndex: 'departCodeName',
    width: 150,
    customRender: ({ record }) => {
      return record.departCodeName ? record.orgCodeName + '-' + record.departCodeName : record.orgCodeName;
    },
    ellipsis: true,
  },
  {
    title: '人员姓名',
    dataIndex: 'realName',
    width: 150,
    customRender: ({ record }) => {
      return record.workNo ? record.realName + '（' + record.workNo + '）' : record.realName;
    },
  },
  {
    title: '身份证号',
    dataIndex: 'idCard',
    width: 110,
  },
  {
    title: '职务',
    dataIndex: 'post',
    width: 70,
  },
  {
    title: '年度培训课时要求',
    dataIndex: 'duration',
    width: 120,
  },
  {
    title: '本年度完成课时',
    dataIndex: 'userDuration',
    width: 120,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'realName',
    label: '人员姓名',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '人员信息完成情况',
    field: 'userInfoStatus',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '完成', value: '1' },
        { label: '未完成', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '培训完成情况',
    field: 'trainStatus',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '完成', value: '1' },
        { label: '未完成', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '本人签字',
    field: 'userSign',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '核查签字',
    field: 'checkSign',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '上传图片',
    field: 'pictureFlag',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '所属单位',
    field: 'orgCode',
    component: 'Input',
    show: false,
  },
];
