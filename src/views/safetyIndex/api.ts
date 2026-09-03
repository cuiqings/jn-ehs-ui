import { defHttp } from '/@/utils/http/axios';
enum Api {
  list = '/evaluate/evalIndx/getList',
  save = '/evaluate/evalIndx/merge',
  itemList = '/evaluate/evalIndx/getItemList',
  saveItem = '/evaluate/evalIndx/mergeItem',
  currentScore = '/evaluate/evalReport/getCurrentScore',
  selfEvalList = '/evaluate/evalIndx/getSelfEvalList',
  evaluateSelf = '/evaluate/evalIndx/evaluateSelf',
  reportList = '/evaluate/evalReport/getPage',
  reportById = '/evaluate/evalReport/queryById',
  lineData = '/evaluate/evalReport/getRecentReport',
}
/**
 * 列表
 * @param params
 */
export const getList = () => defHttp.get({ url: Api.list });
/**
 * 保存
 * @param params
 */
export const saveConfig = (params) => defHttp.post({ url: Api.save, params });
/**
 * 详情
 * @param params
 */
export const getItemList = (params) => defHttp.get({ url: Api.itemList, params });
/**
 * 保存
 * @param params
 */
export const saveItemConfig = (params) => defHttp.post({ url: Api.saveItem, params });
/**
 * 当前得分
 * @param params
 */
export const getCurrentScore = () => defHttp.get({ url: Api.currentScore });
/**
 * 自评列表
 * @param params
 */
export const getSelfEvalList = () => defHttp.get({ url: Api.selfEvalList });
/**
 * 详情
 * @param params
 */
export const addEvaluateSelf = (params) => defHttp.post({ url: Api.evaluateSelf, params });
/**
 * 报表列表
 * @param params
 */
export const getReportList = (params) => defHttp.get({ url: Api.reportList, params });
/**
 * 报表详情
 * @param params
 */
export const getReportById = (params) => defHttp.get({ url: Api.reportById, params });
/**
 * 图表数据
 * @param params
 */
export const getLineData = () => defHttp.get({ url: Api.lineData });
