import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '所属机构',
    align: 'center',
    width: 120,
    ellipsis: true,
    dataIndex: 'sysDepartName',
  },
  {
    title: '设备名称',
    align: 'center',
    ellipsis: true,
    width: 180,
    dataIndex: 'deviceName',
  },
  {
    title: '报警等级',
    align: 'center',
    width: 90,
    dataIndex: 'warnLevel_dictText',
  },
  {
    title: '报警名称',
    align: 'center',
    ellipsis: true,
    width: 150,
    dataIndex: 'warnConfigName',
  },
  {
    title: '报警时间',
    align: 'center',
    width: 180,
    dataIndex: 'warnDate',
  },
  {
    title: '报警状态',
    align: 'center',
    dataIndex: 'warnState',
    width: 90,
    slots: { customRender: 'warnState' },
  },
  {
    title: '销警方式',
    align: 'center',
    width: 90,
    dataIndex: 'notWarnState_dictText',
  },
  {
    title: '销警时间',
    align: 'center',
    dataIndex: 'notWarnDate',
    width: 180,
  },
  {
    title: '销警人',
    align: 'center',
    width: 120,
    dataIndex: 'notWarnBy',
  },
];
export const formSchema: FormSchema[] = [
  {
    field: 'description',
    label: '处理说明',
    component: 'InputTextArea',
    required: true,
    rules: [
      { required: true, message: '请输入处理说明！' },
      { min: 0, max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' },
    ],
  },
  {
    label: '上传图片',
    field: 'fileUrl',
    component: 'JImageUpload',
    componentProps: {
      fileMax: 10,
      text: '',
    },
  },
];
export const checkFormSchema: FormSchema[] = [
  {
    label: '验收结论',
    field: 'checkResult',
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '验收通过', value: '1' },
        { label: '验收不通过', value: '0' },
      ],
    },
    required: true,
  },
  {
    field: 'description',
    label: '处理说明',
    component: 'InputTextArea',
    required: true,
    rules: [
      { required: true, message: '请输入处理说明！' },
      { min: 0, max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' },
    ],
  },
  {
    label: '上传图片',
    field: 'fileUrl',
    component: 'JImageUpload',
    componentProps: {
      fileMax: 10,
      text: '',
    },
  },
];
