import { defHttp } from '/@/utils/http/axios';

enum Api {
  statistics23 = '/yh/skYhStatistics/statistics23',
  getProjectTrainData = '/edu/statistics/getProjectTrainData',
  getTrainDataOrg = '/edu/statistics/getTrainDataOrg',
  getMonthRate = '/edu/statistics/getMonthRate',
  getKnowledgeErrorRate = '/edu/statistics/getKnowledgeErrorRate',
  getDailyTrainRate = '/edu/statistics/getDailyTrainRate',
  getProjectTrainDataOrg = '/edu/statistics/getProjectTrainDataOrg',
}
/**
 * 获取部门树列表
 */
export const statistics23 = (params) => {
  return defHttp.get({ url: Api.statistics23, params });
};

export const getProjectTrainData = (params) => defHttp.get({ url: Api.getProjectTrainData, params });

export const getTrainDataOrg = (params) => defHttp.get({ url: Api.getTrainDataOrg, params });

export const getMonthRate = (params) => defHttp.get({ url: Api.getMonthRate, params });

export const getKnowledgeErrorRate = (params) => defHttp.get({ url: Api.getKnowledgeErrorRate, params });

export const getDailyTrainRate = (params) => defHttp.get({ url: Api.getDailyTrainRate, params });

export const getProjectTrainDataOrg = (params) => defHttp.get({ url: Api.getProjectTrainDataOrg, params });
