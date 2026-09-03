import { h } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import './plan-style.less';

export const columns: BasicColumn[] = [
  {
    title: '类型',
    width: 150,
    dataIndex: 'type_dictText',
  },
  {
    title: '所属机构',
    width: 150,
    dataIndex: 'organization',
  },
  {
    title: '工序',
    dataIndex: 'productionProcessse',
    width: 100,
  },
  {
    title: '设备/区域',
    width: 160,
    dataIndex: 'deviceRegion',
  },
  {
    title: '项目',
    dataIndex: 'entryName',
    width: 160,
  },
  {
    title: '周期',
    dataIndex: 'cycle_dictText',
    width: 160,
    customRender: ({ text, record }) => {
      if (record.cycle === '5') {
        return record.dayNum ? record.dayNum + '天' : text;
      } else {
        return text;
      }
    },
  },
  {
    title: '执行人',
    dataIndex: 'executorName',
    width: 160,
  },
  {
    title: '监督人',
    dataIndex: 'supervisorName',
    width: 160,
  },
  {
    title: '是否启用',
    width: 110,
    dataIndex: 'isEnable_dictText',
  },
  {
    title: '计划状态',
    width: 100,
    dataIndex: 'planStatus_dictText',
    customRender: ({ text, record }) => {
      return h(
        'span',
        {
          class: ['p-l-status', `t-status-${record.planStatus}`],
        },
        text
      );
    },
  },
  {
    title: '变更状态',
    width: 100,
    dataIndex: 'changeStatus_dictText',
    customRender: ({ text, record }) => {
      return text
        ? h(
            'span',
            {
              class: ['p-l-status', `t-status-${record.changeStatus}`],
            },
            text
          )
        : '--';
    },
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    label: '类型',
    field: 'type',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'clean_plan_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '所属机构',
    field: 'organizationCode',
    component: 'Select',
    componentProps: {
      options: [],
      placeholder: '请选择',
      // disabled: orgOptions.value.length === 1,
    },
    colProps: { span: 6 },
  },
  {
    label: '工序',
    field: 'productionProcessse',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'deviceRegion',
    label: '设备/区域',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'clearEntryId',
    label: '项目',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '周期',
    field: 'cycle',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'cycle',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    field: 'executor',
    label: '执行人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'supervisor',
    label: '监督人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '是否启用',
    field: 'isEnable',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'whether_or_not',
      placeholder: '请选择',
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '计划状态',
    field: 'planStatus',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'plan_status',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '变更状态',
    field: 'changeStatus',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'plan_status',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
];
