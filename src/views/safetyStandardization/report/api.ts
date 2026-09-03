import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/ss/ssSelfEvaluate/list', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/ss/ssSelfEvaluate/add', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/ss/ssSelfEvaluate/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/ss/ssSelfEvaluate/deleteBatch', params }, { joinParamsToUrl: true });
};
export const edit = (data) => {
  return defHttp.post({ url: '/ss/ssSelfEvaluate/edit', data });
};
export const queryById = (params) => {
  return defHttp.get({ url: '/ss/ssSelfEvaluate/queryById', params });
};
