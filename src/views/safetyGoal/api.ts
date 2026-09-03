import { defHttp } from '/@/utils/http/axios';
enum Api {
  // 目标制定
  evaluateList = '/goalSetting/pageList',
  evaluateAdd = '/goalSetting/add',
  goalSave = '/goalSetting/save',
  evaluateEdit = '/evaluationReport/edit',
  evaluateDel = '/goalSetting/delete',
  goalInfo = '/goalSetting/getInfo',
  // 目标分解
  splitList = '/goalDecompose/pageList',
  decompose = '/goalDecompose/decompose',
  composeDetail = '/goalDecompose/detail',
  composeEdit = '/goalDecompose/edit',
  composeStatistics = '/goalDecompose/statistics',
  // 统计
  statistics = '/targetStatistics/pageList',
  statisticsDetail = '/targetStatistics/detail',
  addOrUpd = '/targetStatistics/addOrUpd',
  targetStatistics = '/targetStatistics/statistics',
  unitStatistics = '/unitStatistics/pageList',
  unitStatisticsDetail = '/unitStatistics/detail',
  unitAddOrUpd = '/unitStatistics/addOrUpd',
  unitTargetStatistics = '/unitStatistics/statistics'
}

export const evaluateList = (params) => {
  return defHttp.get({ url: Api.evaluateList, params });
};
export const goalSave = (params) => {
  return defHttp.post({ url: Api.goalSave, params });
};
export const goalInfo = (params) => {
  return defHttp.get({ url: Api.goalInfo, params });
};
export const evaluateAdd = (params) => {
  return defHttp.post({ url: Api.evaluateAdd, params });
};
export const evaluateEdit = (params) => {
  return defHttp.post({ url: Api.evaluateEdit, params });
};
export const evaluateDel = (params) => {
  return defHttp.get({ url: Api.evaluateDel, params });
};

export const splitList = (params) => {
  return defHttp.get({ url: Api.splitList, params });
};
export const decompose = (params) => {
  return defHttp.post({ url: Api.decompose, params });
};
export const composeDetail = (params) => {
  return defHttp.get({ url: Api.composeDetail, params });
};
export const composeEdit = (params) => {
  return defHttp.post({ url: Api.composeEdit, params });
};
export const composeStatistics = (params) => {
  return defHttp.get({ url: Api.composeStatistics, params });
};

export const statistics = (params) => {
  return defHttp.get({ url: Api.statistics, params });
};
export const statisticsDetail = (params) => {
  return defHttp.get({ url: Api.statisticsDetail, params });
};
export const addOrUpd = (params) => {
  return defHttp.post({ url: Api.addOrUpd, params });
};
export const targetStatistics = (params) => {
  return defHttp.get({ url: Api.targetStatistics, params });
};
export const unitStatistics = (params) => {
  return defHttp.get({ url: Api.unitStatistics, params });
};
export const unitStatisticsDetail = (params) => {
  return defHttp.get({ url: Api.unitStatisticsDetail, params });
};
export const unitAddOrUpd = (params) => {
  return defHttp.post({ url: Api.unitAddOrUpd, params });
};
export const unitTargetStatistics = (params) => {
  return defHttp.get({ url: Api.unitTargetStatistics, params });
};


