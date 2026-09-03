import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/commitmentUser/pageList',
  statistics = '/commitmentUser/statistics',
  export = '/commitmentUser/export',
  sign = '/commitmentUser/sign',
  batchSign = '/commitmentUser/batchSign',
  detail = '/commitmentUser/detail',
  batchSignList = '/commitmentUser/batchSignUser',
}

/**
 * 获取承诺签署列表
 * @param params
 */
export const getCommitmentList = (params) => {
    return defHttp.get({ url: Api.list, params });
};

/**
 * 获取承诺签署统计
 * @param params
 */
export const getCommitmentStatistics = (params) => {
  return defHttp.get({ url: Api.statistics, params });
};

/**
 * 导出
 * @param params
 */
export const exportCommitment = (params) => {
  return defHttp.post({ url: Api.export, params, responseType: 'blob' }, { isTransformResponse: false });
};
/**
 * 签署承诺
 * @param params
 */
export const signCommitment = (params) => {
  return defHttp.post({ url: Api.sign, params });
};
/**
 * 批量签署承诺
 * @param params
 */
export const batchSignCommitment = (params) => {
  return defHttp.post({ url: Api.batchSign, params });
};
/**
 * 获取承诺签署详情
 * @param params
 */
export const getCommitmentDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
};
/**
 * 获取批量签署承诺列表
 * @param params
 */
export const getBatchSignList = (params) => {
  return defHttp.post({ url: Api.batchSignList, params });
};

