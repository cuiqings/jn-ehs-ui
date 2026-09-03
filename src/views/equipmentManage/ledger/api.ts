import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/lb/lbSupply/list', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/lb/lbSupply/add', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/lb/lbSupply/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/lb/lbSupply/deleteBatch', params }, { joinParamsToUrl: true });
};
export const edit = (data) => {
  return defHttp.post({ url: '/lb/lbSupply/edit', data });
};
