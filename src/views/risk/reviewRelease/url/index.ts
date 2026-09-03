import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/rk/skRkApply/getApplyPage', params });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/rk/skRkApply/delete', params }, { joinParamsToUrl: true });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 评审
export const review = (data) => {
  return defHttp.post({ url: '/rk/skRkApply/review', data });
};
export const audit = (data) => {
  return defHttp.post({ url: '/rk/skRkApply/audit', data });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/rk/skRkApply/queryById', params });
};
