import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/list', params });
};
// 开始评审
export const add = (data) => {
  return defHttp.post({ url: '/ss/ssUnitEvaluate/add', data });
};
// 编辑子项
export const editItem = (data) => {
  return defHttp.post({ url: '/ss/ssUnitEvaluate/editItem', data });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/deleteBatch', params }, { joinParamsToUrl: true });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/queryById', params });
};
// 查询模块下的项目
export const getItemList = (params) => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/getItemList', params });
};
// 查询当前编辑用户
export const getEditing = (params) => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/getEditing', params }, { isTransformResponse: false });
};
// 添加当前编辑用户
export const addEditing = (params) => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/addEditing', params }, { isTransformResponse: false });
};
// 统计
export const statistics = () => {
  return defHttp.get({ url: '/ss/ssUnitEvaluate/statisticsScore' });
};
// 提交评审
export const submit = (data) => {
  return defHttp.post({ url: '/ss/ssUnitEvaluate/submit', data });
};
