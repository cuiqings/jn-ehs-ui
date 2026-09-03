import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/rk/skRkSource/list', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/rk/skRkSource/add', data });
};
export const edit = (data) => {
  return defHttp.post({ url: '/rk/skRkSource/edit', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/rk/skRkSource/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/rk/skRkSource/deleteBatch', params }, { joinParamsToUrl: true });
};
// 辨识单元
export const getListAll = (params) => {
  return defHttp.get({ url: '/rk/skRkRecog/getList', params });
};
// 统计
export const statistics = (params) => {
  return defHttp.get({ url: '/rk/skRkSource/getNumber', params });
};
// 查找对应的设备设施
export const findDevice = (params) => {
  return defHttp.get({ url: '/rk/skRkSource/findDevice', params });
};
// 查找对应的作业活动
export const findWork = (params) => {
  return defHttp.get({ url: '/rk/skRkSource/findWork', params });
};
