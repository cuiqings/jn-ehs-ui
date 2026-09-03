import { BasicColumn, FormSchema } from '/@/components/Table';
import dayjs from "dayjs";

export const columns: BasicColumn[] = [
  { title: '所属单位', dataIndex: 'subsidiaryName' },
  { title: '演练时间', dataIndex: 'drillTime' },
  { title: '演练名称', dataIndex: 'drillName' },
  { title: '存在问题与改进',
    dataIndex: 'problemImpro',
    slots: { customRender: 'problemImpro' },
  },
  {
    title: '演练签到表',
    dataIndex: 'signPath',
    slots: { customRender: 'signPath' },
  },
  {
    title: '演练记录表',
    dataIndex: 'recordSheet',
    slots: { customRender: 'recordSheet' },
  },
  {
    title: '演练小结',
    dataIndex: 'resultPath',
    slots: { customRender: 'resultPath' },
  },
  {
    title: '演练照片',
    dataIndex: 'imagePath',
    slots: { customRender: 'imagePath' },
  },
  {
    title: '演练记录',
    dataIndex: 'drillRecord',
    slots: { customRender: 'drillRecord' },
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
    label: '演练名称',
    field: 'drillName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '演练时间',
    field: 'drillTime',
    component: 'RangeDate',
    colProps: { span: 6 },
    defaultValue: getSevenDays(),
  },
];

function getSevenDays() {
  const start = dayjs(new Date(new Date().getTime() - 7 * 24 * 3600 * 1000)).format('YYYY-MM-DD');
  const end = dayjs(new Date()).format('YYYY-MM-DD');
  return `${start},${end}`;
}
