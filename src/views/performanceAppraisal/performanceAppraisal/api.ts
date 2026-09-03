import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/pa/paMonthly/list', params });
};
// 加分/扣分
export const updateScore = (data) => {
  return defHttp.post({ url: '/pa/paMonthly/updateScore', data });
};
// 查询月度绩效考核
export const getOrgInfoList = (params) => {
  return defHttp.get({ url: '/pa/paMonthly/getOrgInfoList', params });
};
// 查询履职尽责
export const getLzjzList = (params) => {
  return defHttp.get({ url: '/pa/paMonthly/getLzjzList', params });
};
// 查询干部安全知识抽考
export const getGbaqzsckList = (params) => {
  return defHttp.get({ url: '/pa/paMonthly/getGbaqzsckList', params });
};
// 查询综合检查
export const getZhjcList = (params) => {
  return defHttp.get({ url: '/pa/paMonthly/getZhjcList', params });
};
// 查询高危、非高危作业
export const getGwfgwzyList = (params) => {
  return defHttp.get({ url: '/pa/paMonthly/getGwfgwzyList', params });
};
// 查询基础管理
export const getJcglList = (params) => {
  return defHttp.get({ url: '/pa/paMonthly/getJcglList', params });
};
// 编辑
export const editOrgInfo = (data) => {
  return defHttp.post({ url: '/pa/paMonthly/editOrgInfo', data });
};
