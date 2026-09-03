// 模拟投入计划数据
export const mockInputPlanData = [
  {
    id: '1',
    serialNo: 1,
    planYear: '2025年',
    affiliatedUnit: '第一炼钢事业部',
    planName: '2024年安全生产投入计划',
    preparer: '张三',
    preparationTime: '2024-10-02 18:23:21',
    planStatus: 'draft',
    projectName: '煤气防护器材',
    budget2024: 349150,
    actualAmount2024: 274193.44,
    estimatedAmount2024: 320000,
    budget2025: 380000,
    budgetComparison: 30850,
    changeRatio: 8.84,
    budgetDetails: [
      {
        item: '锂电池',
        unit: '个',
        quantity: 100,
        unitPrice: 9,
        cost: 900
      }
    ],
    remark: '需要重点关注安全设备更新'
  },
  {
    id: '2',
    serialNo: 2,
    planYear: '2025年',
    affiliatedUnit: '第二炼钢事业部',
    planName: '2024年安全生产投入计划',
    preparer: '李四',
    preparationTime: '2024-10-02 18:23:21',
    planStatus: 'pending',
    projectName: '安全防护用品',
    budget2024: 280000,
    actualAmount2024: 220000,
    estimatedAmount2024: 250000,
    budget2025: 300000,
    budgetComparison: 20000,
    changeRatio: 7.14,
    budgetDetails: [
      {
        item: '安全帽',
        unit: '个',
        quantity: 500,
        unitPrice: 25,
        cost: 12500
      }
    ],
    remark: '等待上级审批'
  },
  {
    id: '3',
    serialNo: 3,
    planYear: '2025年',
    affiliatedUnit: '第三炼钢事业部',
    planName: '2024年安全生产投入计划',
    preparer: '王五',
    preparationTime: '2024-10-02 18:23:21',
    planStatus: 'completed',
    projectName: '消防设备',
    budget2024: 450000,
    actualAmount2024: 380000,
    estimatedAmount2024: 420000,
    budget2025: 480000,
    budgetComparison: 30000,
    changeRatio: 6.67,
    budgetDetails: [
      {
        item: '灭火器',
        unit: '个',
        quantity: 200,
        unitPrice: 150,
        cost: 30000
      }
    ],
    remark: '已完成审批流程'
  },
  {
    id: '4',
    serialNo: 4,
    planYear: '2025年',
    affiliatedUnit: '第一炼铁事业部',
    planName: '2024年安全生产投入计划',
    preparer: '赵六',
    preparationTime: '2024-10-02 18:23:21',
    planStatus: 'draft',
    projectName: '检测设备',
    budget2024: 320000,
    actualAmount2024: 260000,
    estimatedAmount2024: 290000,
    budget2025: 350000,
    budgetComparison: 30000,
    changeRatio: 9.38,
    budgetDetails: [
      {
        item: '检测仪',
        unit: '台',
        quantity: 50,
        unitPrice: 6000,
        cost: 300000
      }
    ],
    remark: '正在完善计划内容'
  }
];

// 状态配置
export const statusConfig = {
  draft: {
    text: '起稿中',
    color: 'orange',
  },
  pending: {
    text: '待签字',
    color: 'blue',
  },
  completed: {
    text: '签字完成',
    color: 'green',
  },
};

// 获取状态文本
export const getStatusText = (status: string) => {
  return statusConfig[status]?.text || status;
};

// 获取状态颜色
export const getStatusColor = (status: string) => {
  return statusConfig[status]?.color || 'default';
}; 