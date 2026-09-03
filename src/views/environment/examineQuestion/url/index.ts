import { defHttp } from '/@/utils/http/axios';
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 责任部门
export const selectDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 按所属机构获取用户
export const getUser = (params) => {
  return defHttp.get({ url: '/jn/common/getUser', params });
};
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalProblemChecklist/list', params });
};
// 问题录入
export const add = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalProblemChecklist/add', data });
};
// 问题确认
export const confirm = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalProblemChecklist/confirm', data });
};
// 问题整改
export const rectify = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalProblemChecklist/rectify', data });
};
// 问题复查
export const review = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalProblemChecklist/review', data });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalProblemChecklist/queryById', params });
};
