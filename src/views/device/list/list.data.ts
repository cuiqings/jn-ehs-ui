import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '编号',
    width: 100,
    dataIndex: 'code',
  },
  {
    title: '所属机构',
    width: 100,
    dataIndex: 'departmentName',
  },
  {
    title: '名称',
    width: 100,
    dataIndex: 'name',
  },
  {
    title: '系统分类',
    dataIndex: 'deviceCategoryName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '功能类别',
    dataIndex: 'deviceFunctionCategoryName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType_dictText',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    slots: { customRender: 'status' },
  },
  {
    title: '启/停用',
    dataIndex: 'enableFlag',
    width: 80,
    slots: { customRender: 'enableFlag' },
  },
  {
    title: '时间',
    dataIndex: 'updateTime',
    width: 150,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'orgCode',
    label: '所属机构',
    component: 'JTreeSelect1',
    componentProps: ({ formModel }) => {
      return {
        url: '/jn/common/getDepartTreeFor23',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
          options: 'children',
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    field: 'code',
    label: '编号',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'deviceCategoryId',
    label: '所属系统',
    component: 'JTreeSelect1',
    componentProps: ({ formModel }) => {
      return {
        url: '/deviceCategory/listDeviceCategoryTree',
        fieldNames: {
          label: 'name',
          value: 'key',
          options: 'children',
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    field: 'deviceFunctionCategoryId',
    label: '类别',
    component: 'JTreeSelect1',
    componentProps: ({ formModel }) => {
      return {
        url: '/deviceFunctionCategory/listDeviceFunctionCategoryTree',
        fieldNames: {
          label: 'name',
          value: 'key',
          options: 'children',
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'device_status',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '启/停用',
    field: 'enableFlag',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'device_enable_flag',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
];
export const columnsAttribute: BasicColumn[] = [
  {
    title: '属性名称',
    align: 'center',
    dataIndex: 'pointName',
  },
  {
    title: '属性值',
    align: 'center',
    dataIndex: 'pointValue',
  },
  {
    title: '单位',
    align: 'center',
    dataIndex: 'unit',
  },
  {
    title: '启/停用',
    dataIndex: 'enableFlag',
    width: 100,
    align: 'center',
    customRender: ({ text }) => {
      switch (text) {
        case 0:
          return '停用';
        case 1:
          return '启用';
        default:
          return '';
      }
    },
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
  },
  {
    title: '属性值更新时间',
    align: 'center',
    dataIndex: 'influxTime',
  },
  {
    title: '操作',
    align: 'center',
    dataIndex: 'action',
  },
];
export const searchAttributeFormSchema: FormSchema[] = [
  {
    label: '通讯名称',
    field: 'communicationName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '协议',
    field: 'communicationProtocol',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'communication_protocol',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '属性名称',
    field: 'pointName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '单位',
    field: 'unit',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'point_unit',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '启/停用',
    field: 'enableFlag',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: '1' },
        { label: '停用', value: '0' },
      ],
    },
    colProps: { span: 6 },
  },
];
export const attributeListColumns: BasicColumn[] = [
  {
    title: '通讯名称',
    align: 'center',
    dataIndex: 'communicationName',
    slots: { customRender: 'communicationName' },
  },
  {
    title: '协议',
    align: 'center',
    dataIndex: 'communicationProtocol_dictText',
  },
  {
    title: '属性名称',
    align: 'center',
    dataIndex: 'pointName',
    slots: { customRender: 'pointName' },
  },
  {
    title: '属性TAG',
    align: 'center',
    dataIndex: 'pointTag',
    slots: { customRender: 'pointTag' },
  },
  {
    title: '属性类型',
    align: 'center',
    dataIndex: 'type_dictText',
  },
  {
    title: '访问类型',
    align: 'center',
    dataIndex: 'accessType_dictText',
  },
  {
    title: '展示类型',
    align: 'center',
    dataIndex: 'displayType_dictText',
  },
  {
    title: '权重',
    align: 'center',
    dataIndex: 'displayWeights',
    width: 80,
  },
  {
    title: '单位',
    align: 'center',
    dataIndex: 'unit_dictText',
    width: 80,
  },
  {
    title: '是否点表',
    align: 'center',
    dataIndex: 'isPoint_dictText',
    width: 100,
    // premise precise
  },
  {
    title: '参数信息',
    align: 'center',
    dataIndex: 'daqPointParamStr',
    ellipsis: true,
    width: 200,
  },
  {
    title: '启/停用',
    align: 'center',
    dataIndex: 'enableFlag',
    slots: { customRender: 'enableFlag' },
    width: 120,
  },
  {
    title: '时间',
    align: 'center',
    dataIndex: 'updateTime',
    width: 200,
  },
  {
    title: '网关发送状态',
    align: 'center',
    dataIndex: 'sendGatewayStatus',
    slots: { customRender: 'sendGatewayStatus' },
  },
];
export const columnsParameter: BasicColumn[] = [
  {
    title: '参数名称',
    align: 'center',
    dataIndex: 'paramName',
    ellipsis: true,
    width: 100,
  },
  // {
  //     title: 'GUID',
  //     align: 'center',
  //     dataIndex: 'guid',
  //     ellipsis: true,
  //     width: 100,
  // },
  {
    title: '参数值',
    align: 'center',
    dataIndex: 'value',
    ellipsis: true,
    width: 80,
  },
  {
    title: '单位',
    align: 'center',
    dataIndex: 'unit',
    ellipsis: true,
    width: 80,
  },
  // {
  //     title: '时间',
  //     align: 'center',
  //     dataIndex: 'updateTime',
  //     ellipsis: true,
  //     width: 120,
  // },
  {
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 150,
  },
];
