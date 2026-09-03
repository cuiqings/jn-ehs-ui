import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/sysIndexConfig/list',
  batchSave = '/sysIndexConfig/batchSave',
  refreshCache = '/cockpit2Index/refreshCache',
}

export const getConfigList = () => {
  return defHttp.get({ url: Api.list });
};

export const batchSave = (params) => {
  return defHttp.post({ url: Api.batchSave, params });
};

export const refreshCache = () => {
  return defHttp.post({ url: Api.refreshCache });
};
