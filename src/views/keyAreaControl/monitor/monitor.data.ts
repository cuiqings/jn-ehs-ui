import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  { title: '所属机构', dataIndex: 'subsidiaryName' },
  { title: '工序', dataIndex: 'process' },
  { title: '产线', dataIndex: 'line' },
  { title: '部位', dataIndex: 'position' },
  { title: '数量', dataIndex: 'numbers' },
  { title: '工作原理及用途', dataIndex: 'principlePurpose' },
  { title: '风险点描述', dataIndex: 'riskDescription' },
  {
    title: '清扫/检查制度',
    dataIndex: 'cenType',
    width: 220,
    slots: { customRender: 'cenType' },
  },
  {
    title: '清扫/检查标准',
    dataIndex: 'criType',
    width: 220,
    slots: { customRender: 'criType' },
  },
  { title: '清扫/检查周期', dataIndex: 'checkCycle' },
  {
    title: '清扫/检查记录',
    dataIndex: 'cleanCheckRecordType',
    slots: { customRender: 'cleanCheckRecordType' },
  },
  {
    title: '清扫/检查前后照片对比',
    dataIndex: 'cleanCheckPhotoType',
    width: 220,
    slots: { customRender: 'cleanCheckPhotoType' },
  },
  { title: '上次清扫/检查日期', dataIndex: 'lastCleanCheckTime' },
  { title: '下次清扫/检查日期', dataIndex: 'nextCleanCheckTime', slots: { customRender: 'nextCleanCheckTime' } },
  {
    title: '检查照片',
    dataIndex: 'checkPhoto',
    slots: { customRender: 'checkPhoto' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '所属机构',
    field: 'organizationCode',
    component: 'Select',
    componentProps: {
      options: [],
      placeholder: '请选择',
    },
    colProps: { span: 6 },
  },
  {
    label: '工序',
    field: 'process',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '产线',
    field: 'line',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '部位',
    field: 'position',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '工作原理及用途',
    field: 'principlePurpose',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '风险点描述',
    field: 'riskDescription',
    component: 'Input',
    colProps: { span: 6 },
  },
];
