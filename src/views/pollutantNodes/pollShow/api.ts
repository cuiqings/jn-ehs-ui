import { defHttp } from '/@/utils/http/axios';

enum Api {
  getQueryById = '/pollutionDischarge/jnPollutionPageSetup/queryById',
}

/**
 * 详情
 * @param params
 */
export const getQueryById = (params) => {
  return defHttp.get({ url: Api.getQueryById, params });
};