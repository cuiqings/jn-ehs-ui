import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/ss/ssStandardReview/list', params });
};
// 开始评审
export const add = (data) => {
  return defHttp.post({ url: '/ss/ssStandardReview/add', data });
};
// 编辑子项
export const editItem = (data) => {
  return defHttp.post({ url: '/ss/ssStandardReview/editItem', data });
};
// 提交评审
export const submit = (data) => {
  return defHttp.post({ url: '/ss/ssStandardReview/submit', data });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/ss/ssStandardReview/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/ss/ssStandardReview/deleteBatch', params }, { joinParamsToUrl: true });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/ss/ssStandardReview/queryById', params });
};
// 查询模块下的项目
export const getItemList = (params) => {
  return defHttp.get({ url: '/ss/ssStandardReview/getItemList', params });
};
// 查询当前编辑用户
export const getEditing = (params) => {
  return defHttp.get({ url: '/ss/ssStandardReview/getEditing', params }, { isTransformResponse: false });
};
// 添加当前编辑用户
export const addEditing = (params) => {
  return defHttp.get({ url: '/ss/ssStandardReview/addEditing', params }, { isTransformResponse: false });
};

export const uploadReport = (data) => {
  return defHttp.post({ url: '/ss/ssStandardReview/uploadReport', data });
};
