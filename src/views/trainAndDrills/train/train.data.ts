import { BasicColumn, FormSchema } from '/@/components/Table';
import dayjs from 'dayjs';

export const columns: BasicColumn[] = [
  { title: '所属单位', dataIndex: 'subsidiaryName' },
  {
    title: '培训类型',
    dataIndex: 'trainType_dictText',
  },
  { title: '培训时间', dataIndex: 'trainTime' },
  { title: '培训名称', dataIndex: 'trainName' },
  {
    title: '培训签到表',
    dataIndex: 'signSheetPath',
    slots: { customRender: 'signSheetPath' },
  },
  {
    title: '培训记录表',
    dataIndex: 'recordSheetPath',
    slots: { customRender: 'recordSheetPath' },
  },
  {
    title: '培训小结',
    dataIndex: 'resultPath',
    slots: { customRender: 'resultPath' },
  },
  {
    title: '培训照片',
    dataIndex: 'imagePath',
    slots: { customRender: 'phone' },
  },
  {
    title: '培训记录',
    dataIndex: 'recordPath',
    slots: { customRender: 'recordPath' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '所属单位',
    field: 'subsidiaryCode',
    component: 'Select',
    componentProps: {
      options: [],
      placeholder: '请选择',
    },
    colProps: { span: 6 },
  },
  {
    label: '培训类型',
    field: 'trainType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'train_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '培训时间',
    field: 'trainTime',
    component: 'RangeDate',
    colProps: { span: 6 },
    defaultValue: getSevenDays(),
  },
  {
    label: '培训名称',
    field: 'trainName',
    component: 'Input',
    colProps: { span: 6 },
  },
];

function getSevenDays() {
  const start = dayjs(new Date(new Date().getTime() - 7 * 24 * 3600 * 1000)).format('YYYY-MM-DD');
  const end = dayjs(new Date()).format('YYYY-MM-DD');
  return `${start},${end}`;
}
