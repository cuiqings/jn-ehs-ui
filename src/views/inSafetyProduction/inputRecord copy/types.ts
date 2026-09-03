// 投入台账记录类型
export interface InputRecord {
  id: string;
  year: string;
  yearText: string;
  title: string;
  budget: number;
  budgetText: string;
  status: string;
  statusText: string;
  statusColor: string;
  createTime: string;
  updateTime: string;
  description: string;
  details: BudgetDetail[];
}

// 预算明细类型
export interface BudgetDetail {
  item: string;
  amount: number;
  unit: string;
}

// 年度选项类型
export interface YearOption {
  label: string;
  value: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 查询参数类型
export interface QueryParams {
  year?: string;
  page?: number;
  pageSize?: number;
}
