import { BasicColumn } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '隐患状态',
    ellipsis: true,
    dataIndex: 'status_dictText',
    width: '100px',
  },
  {
    title: '提交方式',
    ellipsis: true,
    dataIndex: 'reportType_dictText',
    width: 100,
  },
  {
    title: '隐患来源',
    ellipsis: true,
    dataIndex: 'sourceType_dictText',
    width: 100,
  },
  {
    title: '提报部门',
    dataIndex: 'reportDepartName',
    width: 100,
  },
  {
    title: '检查日期',
    ellipsis: true,
    dataIndex: 'createTime',
    width: 120,
    customRender: ({ text }) => {
      // 截取前10位
      return text.substring(0, 10);
    },
  },
  {
    title: '所属机构',
    width: 120,
    dataIndex: 'yhPlaceOrgName',
  },
  {
    title: '所属部门',
    dataIndex: 'yhPlaceDepartName',
    width: 120,
  },
  {
    title: '检查层级',
    ellipsis: true,
    dataIndex: 'checkHierarchy',
    width: 130,
  },
  {
    title: '隐患描述',
    ellipsis: true,
    dataIndex: 'yhDescription',
  },
  {
    title: '隐患等级',
    ellipsis: true,
    dataIndex: 'yhLevel_dictText',
    width: 100,
  },
  {
    title: '临时措施',
    ellipsis: true,
    dataIndex: 'tempMeasure',
    width: 180,
  },
  {
    title: '限定整改期限',
    ellipsis: true,
    dataIndex: 'repairDate',
    width: 120,
    slots: { customRender: 'repairDate' },
  },
  {
    title: '责任部门',
    ellipsis: true,
    dataIndex: 'dutyDeptName',
    width: 120,
  },
  {
    title: '责任人',
    ellipsis: true,
    dataIndex: 'dutyPeopleName',
    width: 100,
  },
  {
    title: '隐患照片',
    dataIndex: 'yhPicture',
    width: 120,
    slots: {
      customRender: 'yhPicture',
    },
  },
  {
    title: '整改后照片',
    dataIndex: 'repairPicture',
    width: 120,
    slots: {
      customRender: 'repairPicture',
    },
  },
  {
    title: '隐患类型',
    ellipsis: true,
    dataIndex: 'yhType_dictText',
    width: 120,
  },
  {
    title: '防控手段',
    ellipsis: true,
    width: 120,
    dataIndex: 'handleMeans_dictText',
  },
  {
    title: '整改通知',
    dataIndex: 'noticeNos',
    width: 150,
    slots: { customRender: 'notice' },
  },
];
