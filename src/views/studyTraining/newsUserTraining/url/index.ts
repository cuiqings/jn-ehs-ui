import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/edu/employeeEntry/pageList', params });
};
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrgInfoForOrgCode' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/edu/employeeEntry/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/edu/employeeEntry/edit', data });
};
export const del = (data) => {
  return defHttp.post({ url: '/edu/employeeEntry/delete', data });
};
// 类型统计
export const typeStatistics = () => {
  return defHttp.get({ url: '/edu/employeeEntry/status/statistics' });
};
// 在用状态统计
export const statistics = () => {
  return defHttp.get({ url: '/edu/employeeEntry/statistics' });
};
// 离厂
export const leaveFactory = (data) => {
  return defHttp.post({ url: '/edu/employeeEntry/leaveFactory', data });
};
