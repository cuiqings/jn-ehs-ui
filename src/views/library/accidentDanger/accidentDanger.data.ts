import styleMock from 'tests/__mocks__/styleMock';
import { FormSchema, BasicColumn } from '/@/components/Table';
export const columns = <BasicColumn[]>[
  {
    title: '事故名称',
    dataIndex: 'accidentTitle',
    width: 180,
  },
  {
    title: '事故类型',
    dataIndex: 'accidentCategory_dictText',
    width: 100,
  },
  {
    title: '事故等级',
    dataIndex: 'accidentLevel_dictText',
    width: 100,
  },
  {
    title: '事故发生时间',
    dataIndex: 'occurTime',
    width: 120,
  },
  {
    title: '事故报告',
    dataIndex: 'attachment',
    width: 180,
    slots: { customRender: 'attachment' },
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'accidentTitle',
    label: '事故名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'occurTime',
    label: '事故发生时间',
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
      style: { width: '100%' },
    },
    colProps: { span: 6 },
  },
];
