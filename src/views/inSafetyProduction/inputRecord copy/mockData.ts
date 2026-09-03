// 模拟投入台账数据
export const mockInputRecordData = [
  {
    id: '1',
    year: '2024',
    yearText: '2024年',
    title: '敬业集团生产系统安全投入费用预算',
    budget: 2095.37,
    budgetText: '2,095.37万元',
    status: 'completed',
    statusText: '已完成',
    statusColor: 'success',
    createTime: '2024-01-15',
    updateTime: '2024-12-20',
    description: '2024年度安全生产投入费用预算，包含设备更新、安全培训、防护用品等各项支出',
    details: [
      { item: '安全设备更新', amount: 800.0, unit: '万元' },
      { item: '安全培训费用', amount: 150.0, unit: '万元' },
      { item: '防护用品', amount: 200.0, unit: '万元' },
      { item: '检测设备', amount: 400.0, unit: '万元' },
      { item: '应急物资', amount: 300.0, unit: '万元' },
      { item: '其他费用', amount: 245.37, unit: '万元' },
    ],
  },
  {
    id: '2',
    year: '2023',
    yearText: '2023年',
    title: '敬业集团生产系统安全投入费用预算',
    budget: 1872.45,
    budgetText: '1,872.45万元',
    status: 'completed',
    statusText: '已完成',
    statusColor: 'success',
    createTime: '2023-01-10',
    updateTime: '2023-12-25',
    description: '2023年度安全生产投入费用预算，重点投入安全防护设备和培训体系',
    details: [
      { item: '安全设备更新', amount: 700.0, unit: '万元' },
      { item: '安全培训费用', amount: 120.0, unit: '万元' },
      { item: '防护用品', amount: 180.0, unit: '万元' },
      { item: '检测设备', amount: 350.0, unit: '万元' },
      { item: '应急物资', amount: 250.0, unit: '万元' },
      { item: '其他费用', amount: 272.45, unit: '万元' },
    ],
  },
  {
    id: '3',
    year: '2022',
    yearText: '2022年',
    title: '敬业集团生产系统安全投入费用预算',
    budget: 1654.32,
    budgetText: '1,654.32万元',
    status: 'completed',
    statusText: '已完成',
    statusColor: 'success',
    createTime: '2022-01-05',
    updateTime: '2022-12-30',
    description: '2022年度安全生产投入费用预算，基础安全设施建设和设备配置',
    details: [
      { item: '安全设备更新', amount: 600.0, unit: '万元' },
      { item: '安全培训费用', amount: 100.0, unit: '万元' },
      { item: '防护用品', amount: 150.0, unit: '万元' },
      { item: '检测设备', amount: 300.0, unit: '万元' },
      { item: '应急物资', amount: 200.0, unit: '万元' },
      { item: '其他费用', amount: 304.32, unit: '万元' },
    ],
  },
];

// 获取年度列表
export const getYearList = () => {
  return mockInputRecordData.map((item) => ({
    label: item.yearText,
    value: item.year,
  }));
};

// 根据年度获取数据
export const getDataByYear = (year: string) => {
  return mockInputRecordData.find((item) => item.year === year);
};

// 获取所有数据
export const getAllData = () => {
  return mockInputRecordData;
};
