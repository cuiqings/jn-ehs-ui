import { defHttp } from '/@/utils/http/axios';
enum Api {
  // 目标制定
  handoverList = '/shiftHandover/pageList',
  getTeam = '/shiftHandover/getTeam',
  handoverSubmit = '/shiftHandover/shift',
  successorSign = '/shiftHandover/successor',
  leLeadersSign = '/shiftHandover/sign',
  handoverInfo = '/shiftHandover/detail',
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

export const handoverList = (params) => {
  return defHttp.get({ url: Api.handoverList, params });
};
export const handoverSubmit = (params) => {
  return defHttp.post({ url: Api.handoverSubmit, params });
};
export const handoverInfo = (params) => {
  return defHttp.get({ url: Api.handoverInfo, params });
};
export const getTeam = (params) => {
  return defHttp.get({ url: Api.getTeam, params });
};
export const successorSign = (params) => {
  return defHttp.post({ url: Api.successorSign, params });
};
export const leLeadersSign = (params) => {
  return defHttp.post({ url: Api.leLeadersSign, params });
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


