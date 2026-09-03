import { defHttp } from '/@/utils/http/axios';

enum Api {
  getTrainLine = '/fireManagement/largeScreen/getTrainLine',
  getTypeDetail = '/fireManagement/largeScreen/getTypeDetail',
  getDrillLine = '/fireManagement/largeScreen/getDrillLine',
  inspectionChart = '/fireManagement/largeScreen/inspectionChart',
  statistics7 = '/hiddenDangerChecks/jnYhSk/statistics7',
  fireSignage = '/workManage/fireSignage',
}

// 消防安全培训-产线详情
export const getTrainLine = (params) => {
  return defHttp.get({ url: Api.getTrainLine, params });
};

// 消防安全培训-类型详情
export const getTypeDetail = (params) => {
  return defHttp.get({ url: Api.getTypeDetail, params });
};

// 消防应急演练-产线详情
export const getDrillLine = (params) => {
  return defHttp.get({ url: Api.getDrillLine, params });
};

// 消防应急演练-巡检率图表
export const getInspectChart = (params) => {
  return defHttp.get({ url: Api.inspectionChart, params });
};

// 消防隐患统计-图表
export const getStatistics7 = (params) => {
  return defHttp.get({ url: Api.statistics7, params });
};

export const getFireSignage = (params) => {
  return defHttp.get({ url: Api.fireSignage, params });
};
