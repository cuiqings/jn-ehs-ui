import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '隐患描述',
    dataIndex: 'yhDescription',
    width: 200,
  },
  {
    title: '隐患地点',
    dataIndex: 'yhPlace',
    width: 150,
  },
  {
    title: '举报层级',
    dataIndex: 'reportLevel',
    width: 100,
    customRender: ({ text }) => {
      if (text === '2') {
        return '厂部';
      } else if (text === '1') {
        return '安全部';
      }
    },
  },
  {
    title: '归属单位',
    dataIndex: 'orgName',
    width: 150,
  },
  {
    title: '举报人',
    dataIndex: 'reporterName',
    width: 100,
  },
  {
    title: '举报人电话',
    dataIndex: 'reporterPhone',
    width: 120,
  },
  {
    title: '发现时间',
    dataIndex: 'findTime',
    width: 150,
  },
   {
    title: '整改情况',
    dataIndex: 'repairStatus',
    width: 110,
    customRender: ({ text }) => {
      if (text === '1') {
        return '已整改';
      } else if (text === '2') {
        return '待整改';
      } else if (text === '3') {
        return '无需整改';
      } else {
        return '';
      }
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    slots: { customRender: 'status' },
  },
];
