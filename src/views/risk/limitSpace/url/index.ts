import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/limitSpace/listPage', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/limitSpace/add', data });
};
export const del = (data) => {
  return defHttp.post({ url: '/limitSpace/delete', data });
};
export const edit = (data) => {
  return defHttp.post({ url: '/limitSpace/edit', data });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
export const details = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskNotify/queryById', params });
};
