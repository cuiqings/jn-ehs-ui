import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/ss/ssPerformanceMonitor/list', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/ss/ssPerformanceMonitor/add', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/ss/ssPerformanceMonitor/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/ss/ssPerformanceMonitor/deleteBatch', params }, { joinParamsToUrl: true });
};
export const edit = (data) => {
  return defHttp.post({ url: '/ss/ssPerformanceMonitor/edit', data });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/ss/ssPerformanceMonitor/queryById', params });
};
