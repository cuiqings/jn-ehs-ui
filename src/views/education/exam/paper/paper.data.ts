import { FormSchema } from '/@/components/Table';
export const columns = [
  {
    title: '试卷名称',
    dataIndex: 'paperName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'categoryName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'paperType',
    width: 100,
    customRender: ({ text }) => {
      return text == 1 ? '固定试卷' : '随机试卷';
    },
  },
  {
    title: '试题数',
    dataIndex: 'questionNum',
    width: 100,
  },
  {
    title: '总分',
    dataIndex: 'score',
    width: 100,
  },
  {
    title: '及格分',
    dataIndex: 'passScore',
    width: 100,
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 100,
  },
  {
    title: '创建单位',
    dataIndex: 'orgName',
    width: 100,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'paperName',
    label: '试卷名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'category',
    label: '分类',
    colProps: { span: 6 },
    component: 'JTreeDict',
    componentProps: ({ formModel }) => {
      return {
        parentCode: 'A02',
        field: 'code',
        async: false,
      };
    },
  },
  {
    field: 'createUser',
    label: '创建人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'createUser',
    label: '创建人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '创建单位',
    field: 'orgCode',
    component: 'Select',
    componentProps: {
      treeDataArr: [],
      // multiple: true,
      treeNodeFilterProp: 'title',
      treeDefaultExpandAll: false,
      showSearch: true,
      filterOption: (input: string, option: any) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
    },
    colProps: { span: 6 },
  }
];
export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: '',
    component: 'Input',
    show: false,
  },
  {
    field: 'category',
    label: '试卷分类',
    component: 'JTreeDict',
    componentProps: ({ formModel }) => {
      return {
        parentCode:'A02',
        field: 'code',
        async: false,
      };
    },
  },
  {
    field: 'paperName',
    label: '试卷名称',
    required: true,
    component: 'Input',
    componentProps: {
      maxLength: 100,
    },
  },

  {
    field: 'paperType',
    label: '试卷类型',
    required: true,
    // 编辑页面禁用
    dynamicDisabled: ({ values }) => {
      return !!values.id;
    },
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '固定试卷', value: '1' },
          { label: '随机组卷', value: '2' },
        ],
      };
    },
  },
];
export const detailColumns = [
  {
    title: '题目',
    dataIndex: 'questionName',
    width: 100,
  },
  {
    title: '题型',
    dataIndex: 'questionType',
    width: 100,
    customRender: ({ text }) => {
      return text == 1 ? '单选题' : text == 2 ? '多选题' : text == 3 ? '填空题' : text == 4 ? '判断题' : '问答题';
    }
  }, {
    title: '难度',
    dataIndex: 'questionExtent',
    width: 100,
    customRender: ({ text }) => {
      return text == 1 ? '简单' : text == 2 ? '中等' : '复杂';
    }
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 100,
  },
];
export const searchDetailFormSchema: FormSchema[] = [
  {
    field: 'questionName',
    label: '题目',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'questionExtent',
    label: '难度',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      options: [
        {
          label: '简单',
          value: 1,
        },
        {
          label: '中等',
          value: 2,
        },
        {
          label: '复杂',
          value: 3,
        },
      ],
    },
  },
  {
    field: 'questionType',
    label: '题型',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      options: [
        {
          label: '单选题',
          value: 1,
        },
        {
          label: '多选题',
          value: 2,
        },
        {
          label: '填空题',
          value: 3,
        },
        {
          label: '判断题',
          value: 4,
        },
        {
          label: '问答题',
          value: 5,
        },
      ],
    },
  },
];

export const bankColumns = [
  {
    title: '题库名称',
    dataIndex: 'name',
    width: 120,
    align: 'center',
    slots: { customRender: 'name' },
  },
  {
    title: '单选题',
    dataIndex: 'question1',
    width: 100,
    align: 'center',
  },{
    title: '多选题',
    dataIndex: 'question2',
    width: 100,
    align: 'center',
  },
  {
    title: '填空题',
    dataIndex: 'question3',
    width: 100,
    align: 'center',
  },
  {
    title: '判断题',
    dataIndex: 'question4',
    width: 100,
    align: 'center',
  },
  {
    title: '问答题',
    dataIndex: 'question5',
    width: 100,
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 80,
    align: 'center',
  },
];
