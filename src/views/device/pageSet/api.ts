import { defHttp } from '/@/utils/http/axios';

enum Api {
  queryById = '/space/page/queryById',
  saveOrUpdate = '/space/page/saveOrUpdate',
  queryByIdDevice = '/space/page/queryByDeviceId',
  saveOrUpdatePoll = '/pollutionDischarge/jnPollutionPageSetup/saveOrUpdate',
}

// 详情
export const getQueryById = (params) => defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });

// 保存
export const saveOrUpdate = (params) => {
  return defHttp.post({ url: Api.saveOrUpdate, params });
};

// 详情
export const getQueryByIdDevice = (params) => defHttp.get({ url: Api.queryByIdDevice, params }, { isTransformResponse: false });

// 保存
export const saveOrUpdatePoll = (params) => {
  return defHttp.post({ url: Api.saveOrUpdatePoll, params });
};