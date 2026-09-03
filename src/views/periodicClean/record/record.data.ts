import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '类型',
    width: 100,
    dataIndex: 'type_dictText',
  },
  {
    title: '所属机构',
    width: 150,
    dataIndex: 'organizationName',
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
    dataIndex: 'clearEntryName',
    width: 260,
  },
  {
    title: '周期',
    dataIndex: 'cycle_dictText',
    width: 100,
    customRender: ({ text, record }) => {
      if (record.cycle === '5') {
        return record.dayNum ? record.dayNum + '天' : text;
      } else {
        return text;
      }
    },
  },
  {
    title: '本次维护时间',
    dataIndex: 'thisMaintenanceTime',
    width: 210,
  },
  {
    title: '维护后照片',
    dataIndex: 'maintenanceHzp',
    width: 120,
    slots: { customRender: 'photo' },
  },
  {
    title: '执行人',
    dataIndex: 'executor',
    width: 160,
  },
  {
    title: '监督人',
    dataIndex: 'supervisorName',
    width: 160,
  },
  {
    title: '下次维护时间',
    width: 120,
    dataIndex: 'nextMaintenanceTime',
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
    field: 'clearEntryName',
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
    label: '本次维护时间',
    field: 'thisMaintenanceTime',
    component: 'RangeDate',
    colProps: { span: 6 },
  },
  {
    field: 'executor',
    label: '执行人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'supervisorName',
    label: '监督人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '下次维护时间',
    field: 'nextMaintenanceTime',
    component: 'RangeDate',
    colProps: { span: 6 },
  },
];
