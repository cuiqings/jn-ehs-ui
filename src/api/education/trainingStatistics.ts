import { defHttp } from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

export interface TrainingStatisticsItem {
  id: string;
  index: number;
  department: string;
  totalCount: number;
  trainingPersons: number;
  trainingTimes: number;
  courseCount: number;
  totalHours: number;
  participationRate: number;
  completionRate: number;
}

export interface ChartData {
  departmentData: Array<{
    name: string;
    value: number;
  }>;
  projectData: Array<{
    name: string;
    value: number;
  }>;
}

export interface ApiResponse<T> {
  items: T;
  total?: number;
}

enum Api {
  TrainingStatisticsList = '/edu/statistics/getTrainReportData',
  TrainingStatisticsCharts = '/edu/statistics/getBarData',
  getProjectTrainData = '/edu/statistics/getProjectTrainData',
  trainReportDataExport = '/edu/statistics/trainReportDataExport',
}

/**
 * @description: 获取培训统计数据列表
 */
export function getTrainingStatisticsList(params: any) {
  return defHttp.get<ApiResponse<TrainingStatisticsItem[]>>(
    {
      url: Api.TrainingStatisticsList,
      params,
    },
    {
      errorMessageMode: 'message' as ErrorMessageMode,
    }
  );
}

/**
 * @description: 获取培训统计图表数据
 */
export function getTrainingStatisticsCharts(params: any) {
  return defHttp.get<ApiResponse<ChartData>>(
    {
      url: Api.TrainingStatisticsCharts,
      params,
    },
    {
      errorMessageMode: 'message' as ErrorMessageMode,
    }
  );
}

/**
 * @description: 获取项目培训数据
 */
export function getProjectTrainData(params: any) {
  return defHttp.get<ApiResponse<ChartData>>(
    {
      url: Api.getProjectTrainData,
      params,
    },
    {
      errorMessageMode: 'message' as ErrorMessageMode,
    }
  );
}
