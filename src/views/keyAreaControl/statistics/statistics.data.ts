import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  { title: '所属机构', dataIndex: 'subsidiaryName', align: 'center', width: 140 },
  {
    title: '工序',
    dataIndex: 'process',
    align: 'center',
    width: 220,
    slots: { customRender: 'process' },
  },
  {
    title: '产线',
    dataIndex: 'line',
    align: 'center',
    width: 220,
    slots: { customRender: 'line' },
  },
  {
    title: '部位',
    dataIndex: 'position',
    align: 'center',
    width: 220,
    slots: { customRender: 'position' },
  },
  {
    title: '数量',
    dataIndex: 'numbers',
    align: 'center',
    width: 220,
    slots: { customRender: 'numbers' },
  },
  {
    title: '工作原理及用途',
    dataIndex: 'principlePurpose',
    align: 'center',
    width: 220,
    slots: { customRender: 'principlePurpose' },
  },
  {
    title: '风险点描述',
    dataIndex: 'riskDescription',
    align: 'center',
    width: 220,
    slots: { customRender: 'riskDescription' },
  },
  {
    title: '清扫/检查制度',
    dataIndex: 'cenType',
    align: 'center',
    width: 220,
    slots: { customRender: 'cenType' },
  },
  {
    title: '清扫/检查标准',
    dataIndex: 'criType',
    align: 'center',
    width: 220,
    slots: { customRender: 'criType' },
  },
  {
    title: '清扫/检查周期',
    dataIndex: 'checkCycle',
    align: 'center',
    width: 220,
    slots: { customRender: 'checkCycle' },
  },
  {
    title: '清扫/检查记录',
    dataIndex: 'cleanCheckRecordType',
    align: 'center',
    width: 220,
    slots: { customRender: 'cleanCheckRecordType' },
  },
  {
    title: '清扫/检查前后照片对比',
    dataIndex: 'cleanCheckPhotoType',
    width: 220,
    align: 'center',
    slots: { customRender: 'cleanCheckPhotoType' },
  },
  { title: '上次清扫/检查日期', dataIndex: 'lastCleanCheckTime', align: 'center' },
  {
    title: '下次清扫/检查日期',
    dataIndex: 'nextCleanCheckTime',
    align: 'center',
    slots: { customRender: 'nextCleanCheckTime' },
  },
  {
    title: '检查照片',
    dataIndex: 'checkPhoto',
    align: 'center',
    slots: { customRender: 'checkPhoto' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 100,
    slots: { customRender: 'action' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: '',
    component: 'Input',
    slot: 'title',
  },
  {
    field: 'table',
    label: '',
    component: 'Input',
    slot: 'table',
  },
];
