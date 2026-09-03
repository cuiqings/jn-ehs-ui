import { defHttp } from '/@/utils/http/axios';

enum Api {
  getBarData = '/edu/statistics/getBarData',
  getProjectTrainData = '/edu/statistics/getProjectTrainData',
  getTrainDataOrg = '/edu/statistics/getTrainDataOrg',
  getMonthRate = '/edu/statistics/getMonthRate',
  getKnowledgeErrorRate = '/edu/statistics/getKnowledgeErrorRate',
  getDailyTrainRate = '/edu/statistics/getDailyTrainRate',
  getProjectTrainDataOrg = '/edu/statistics/getProjectTrainDataOrg',
  getDailyTrainScore = '/edu/statistics/getDailyTrainScore',
  getAutoBrushQuestionRate = '/edu/statistics/getAutoBrushQuestionRate',
  dailyTrainDataExport = '/edu/statistics/dailyTrainDataExport',
  autoBrushQuestionDataExport = '/edu/autoBrushQuestionDataExport'
}
/**
 * 获取部门树列表
 */
export const getBarData = (params) => {
  return defHttp.get({ url: Api.getBarData, params });
};

export const getProjectTrainData = (params) => defHttp.get({ url: Api.getProjectTrainData, params });

export const getTrainDataOrg = (params) => defHttp.get({ url: Api.getTrainDataOrg, params });

export const getMonthRate = (params) => defHttp.get({ url: Api.getMonthRate, params });

export const getKnowledgeErrorRate = (params) => defHttp.get({ url: Api.getKnowledgeErrorRate, params });

export const getDailyTrainRate = (params) => defHttp.get({ url: Api.getDailyTrainRate, params });

export const getProjectTrainDataOrg = (params) => defHttp.get({ url: Api.getProjectTrainDataOrg, params });

export const getDailyTrainScore = (params) => defHttp.get({ url: Api.getDailyTrainScore, params });

export const getAutoBrushQuestionRate = (params) => defHttp.get({ url: Api.getAutoBrushQuestionRate, params });

export const dailyTrainDataExport = (params) => defHttp.get({ url: Api.dailyTrainDataExport, params, responseType: 'blob' }, { isReturnNativeResponse: true });

export const autoBrushQuestionDataExport = (params) => defHttp.get({ url: Api.autoBrushQuestionDataExport, params, responseType: 'blob' }, { isReturnNativeResponse: true });
