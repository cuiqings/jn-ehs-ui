import { BasicColumn } from '/@/components/Table';

// 导出一个名为useData的函数
export const useData = () => {
  // 定义一个名为orgs的数组，包含多个对象，每个对象包含label和value两个属性
  const orgs = [
    {
      label: '铸锻公司',
      value: 'A04W01',
    },
    {
      label: '重铸铁业公司',
      value: 'A04C02',
    },
    {
      label: '铆焊构件厂',
      value: 'A04X01',
    },
    {
      label: '重型机械加工厂',
      value: 'A04Y01',
    },
    {
      label: '重型总装配厂',
      value: 'A04A02',
    },
    {
      label: '齿轮箱厂',
      value: 'A04Z01',
    },
    {
      label: '自动化公司',
      value: 'A04L02',
    },
    {
      label: '设备保障部',
      value: 'A04D02',
    },
    {
      label: '能源供应公司',
      value: 'A04M02',
    },
    {
      label: '漳州公司',
      value: 'A04J02',
    },
    {
      label: '其他',
      value: 'other',
    },
  ];

  // 定义一个名为columns的数组，包含多个对象，每个对象包含title和dataIndex两个属性
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: '100px',
      fixed: 'left',
      align: 'center',
    },
    // {
    //   title: '周次',
    //   dataIndex: 'applicantName',
    // },
    // {
    //   title: '月份',
    //   dataIndex: 'index',
    // },
    // {
    //   title: '日期',
    //   dataIndex: 'index',
    // },
    {
      title: '作业单位',
      dataIndex: 'unit',
      width: '150px',
      fixed: 'left',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '作业车间',
      dataIndex: 'workUnit',
      width: '170px',
      fixed: 'left',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '作业班组',
      dataIndex: 'workTeam',
      width: '180px',
      fixed: 'left',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '作业类型',
      dataIndex: 'workType',
      width: '150px',
      fixed: 'left',
      align: 'center',
    },
    {
      title: '作业地点',
      dataIndex: 'workLocation',
      width: '150px',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '审批级别',
      dataIndex: 'approvalLevel',
      width: '100px',
      align: 'center',
    },
    {
      title: '作业项目',
      dataIndex: 'workContent',
      width: '180px',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '作业开始时间',
      dataIndex: 'workStartTime',
      width: '180px',
      align: 'center',
    },
    {
      title: '作业结束时间',
      dataIndex: 'workEndTime',
      width: '180px',
      align: 'center',
    },
    {
      title: '各单位',
      align: 'center',
      children: [
        {
          title: '检查时间',
          dataIndex: 'u_workCheckTimeChild',
          width: '180px',
          align: 'center',
        },
        {
          title: '检查人',
          dataIndex: 'u_userName',
          width: '120px',
          align: 'center',
          ellipsis: true,
        },
        {
          title: '检查结果',
          dataIndex: 'u_result',
          width: '100px',
          align: 'center',
          ellipsis: true,
        },
      ],
    },
    {
      title: '公司',
      align: 'center',
      children: [
        {
          title: '检查时间',
          dataIndex: 'c_workCheckTimeChild',
          width: '180px',
          align: 'center',
        },
        {
          title: '检查人',
          dataIndex: 'c_userName',
          width: '120px',
          align: 'center',
          ellipsis: true,
        },
        {
          title: '检查结果',
          dataIndex: 'c_result',
          width: '100px',
          align: 'center',
          ellipsis: true,
        },
      ],
    },
    // {
    //   title: '备注',
    //   dataIndex: 'index',
    //   width: '100px'
    // },
  ];

  return { orgs, columns };
};
