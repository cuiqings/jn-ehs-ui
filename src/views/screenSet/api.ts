import { defHttp } from '/@/utils/http/axios';

enum Api {
  queryById = '/pollutionDischarge/jnScreenPageSetup/queryById',
  saveOrUpdate = '/pollutionDischarge/jnScreenPageSetup/saveOrUpdate',
  queryByIdPoll = '/pollutionDischarge/jnPollutionPageSetup/queryById',
  saveOrUpdatePoll = '/pollutionDischarge/jnPollutionPageSetup/saveOrUpdate',
}

// 详情
export const getQueryById = (params) => defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });

// 保存
export const saveOrUpdate = (params) => {
  return defHttp.post({ url: Api.saveOrUpdate, params });
};

// 详情
export const getQueryByIdPoll = (params) => defHttp.get({ url: Api.queryByIdPoll, params }, { isTransformResponse: false });

// 保存
export const saveOrUpdatePoll = (params) => {
  return defHttp.post({ url: Api.saveOrUpdatePoll, params });
};