import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/rk/skRkPoint/list', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/rk/skRkPoint/add', data });
};
export const edit = (data) => {
  return defHttp.post({ url: '/rk/skRkPoint/edit', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/rk/skRkPoint/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/rk/skRkPoint/deleteBatch', params }, { joinParamsToUrl: true });
};
// 辨识单元
export const getListAll = (params) => {
  return defHttp.get({ url: '/rk/skRkRecog/getList', params });
};
// 类型统计
export const typeStatistics = (params) => {
  return defHttp.get({ url: '/rk/skRkPoint/getNumber', params });
};
// 风险点管理-获取全部列表
export const getPointList = (params) => {
  return defHttp.get({ url: '/rk/skRkPoint/getList', params });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/rk/skRkPoint/queryById', params });
};
// 批量更改是否巡检项
export const updateExecuteFlagBatch = (data) => {
  return defHttp.post({ url: '/rk/skRkPoint/updateExecuteFlagBatch', data });
};
