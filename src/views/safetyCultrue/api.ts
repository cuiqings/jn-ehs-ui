import { defHttp } from '/@/utils/http/axios';
enum Api { 
  add = '/safetyCulture/add',
  list = '/safetyCulture/list',
  edit = '/safetyCulture/edit',
  del = '/safetyCulture/del',
  ledgerList = '/safetyCulture/ledgerList',
  ledgerListPage = '/safetyCulture/ledgerListPage',
}
export const add = (params) => {
  return defHttp.post({ url: Api.add, params });
};

export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
};

export const edit = (params) => {
  return defHttp.post({ url: Api.edit, params });
};

export const del = (params) => {
  return defHttp.post({ url: Api.del, params });
};

export const ledgerList = (params) => {
  return defHttp.get({ url: Api.ledgerList, params });
};

export const ledgerListPage = (params) => {
  return defHttp.get({ url: Api.ledgerListPage, params });
};

