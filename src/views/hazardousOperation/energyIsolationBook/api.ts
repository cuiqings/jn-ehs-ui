import { defHttp } from '/@/utils/http/axios';

enum Api { 
  list = '/energyIsolationBook/list',
  del = '/energyIsolationBook/delete',
  edit = '/energyIsolationBook/update',
  add = '/energyIsolationBook/add',
}

export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
};

export const del = (params) => {
  return defHttp.get({ url: Api.del, params });
};

export const edit = (params) => {
  return defHttp.post({ url: Api.edit, params });
};

export const add = (params) => {
  return defHttp.post({ url: Api.add, params });
};
