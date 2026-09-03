import { BasicColumn } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '分类',
    width: 150,
    dataIndex: 'typeCode_dictText',
  },
  {
    title: '所属机构',
    width: 150,
    dataIndex: 'orgCodeText',
  },
  {
    title: '所属部门',
    dataIndex: 'departText',
    width: 100,
  },
  {
    title: '演练名称',
    width: 160,
    dataIndex: 'name',
  },
  {
    title: '演练记录',
    dataIndex: 'drillRecordPath',
    width: 160,
    slots: { customRender: 'drillRecordPath' },
  },
  {
    title: '演练签到表',
    dataIndex: 'drillCheckinPath',
    width: 160,
    slots: { customRender: 'drillCheckinPath' },
  },
  {
    title: '演练评估',
    dataIndex: 'drillEvaluatePath',
    width: 160,
    slots: { customRender: 'drillEvaluatePath' },
  },
  {
    title: '应急处置方案',
    dataIndex: 'responsePlanName',
    width: 160,
    // slots: { customRender: 'responsePlanFilePath' },
  },
  {
    title: '录入时间',
    width: 160,
    dataIndex: 'createTime',
    // customRender: ({ text }) => {
    //     return text.substring(0, 10)
    // },
  },
  {
    title: '录入人',
    width: 100,
    dataIndex: 'createName',
  },
];
