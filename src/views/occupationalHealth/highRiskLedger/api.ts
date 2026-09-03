import { defHttp } from '/@/utils/http/axios';
enum Api {
  // 人员台账
  archivesPageList = '/riskPersonTent/pageList',
  archivesDetail = '/riskPersonTent/detail',
  archivesAdd = '/riskPersonTent/add',
  archivesEdit = '/riskPersonTent/edit',
  archivesDel = '/riskPersonTent/delete/',
  detectionRecord = '/riskPersonTent/detectionRecord',
  // 提醒配置
  remindPageList = '/riskPersonTentRemind/pageList',
  remindDel = '/riskPersonTentRemind/delete/',
  remindAdd = '/riskPersonTentRemind/add',
  remindEdit = '/riskPersonTentRemind/edit',
  statistics = '/riskPersonTent/statistics',
  getOneByOrgCode = '/riskPersonTentRemind/getOneByOrgCode',
  statisticsUnits = '/riskPersonTent/statistics/units',
}

// 物资管理
export const archivesPageList = (params) => {
  return defHttp.get({ url: Api.archivesPageList, params });
};
export const archivesDetail = (params) => {
  return defHttp.get({ url: Api.archivesDetail, params });
};
export const archivesAdd = (params) => {
  return defHttp.post({ url: Api.archivesAdd, params });
};
export const archivesDel = (params) => {
  return defHttp.get({ url: Api.archivesDel + params.id });
};
export const detectionRecord = (params) => {
  return defHttp.post({ url: Api.detectionRecord, params });
};
export const archivesEdit = (params) => {
  return defHttp.post({ url: Api.archivesEdit, params });
};
export const remindPageList = (params) => {
  return defHttp.get({ url: Api.remindPageList, params });
};
export const getOneByOrgCode = (params) => {
  return defHttp.get({ url: Api.getOneByOrgCode, params });
};
export const remindDel = (params) => {
  return defHttp.post({ url: Api.remindDel + params });
};
export const remindEdit = (params) => {
  return defHttp.post({ url: Api.remindEdit, params });
};
export const remindAdd = (params) => {
  return defHttp.post({ url: Api.remindAdd, params });
};

export const statistics = (params) => {
  return defHttp.get({ url: Api.statistics, params });
};

export const getStatisticsUnits = () => {
  return defHttp.get({ url: Api.statisticsUnits });
};
