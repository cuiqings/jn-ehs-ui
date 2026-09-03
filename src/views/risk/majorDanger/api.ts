import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/rk/skRkResource/list', params });
};
export const del = (params) => {
  return defHttp.get({ url: '/rk/skRkResource/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/rk/skRkResource/deleteBatch', params }, { joinParamsToUrl: true });
};
export const edit = (data) => {
  return defHttp.post({ url: '/rk/skRkResource/edit', data });
};
// 类型
export const loadTreeData = (params) => {
  return defHttp.get({ url: '/sys/category/loadTreeRoot', params });
};
