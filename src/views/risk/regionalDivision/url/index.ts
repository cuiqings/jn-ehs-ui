import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/rk/skRkRecog/list', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/rk/skRkRecog/add', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/rk/skRkRecog/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/rk/skRkRecog/deleteBatch', params }, { joinParamsToUrl: true });
};
export const edit = (data) => {
  return defHttp.post({ url: '/rk/skRkRecog/edit', data });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 查询底图
export const queryByOrg = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskBasePicture/queryByOrg', params });
};
