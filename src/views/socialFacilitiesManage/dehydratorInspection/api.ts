import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/dev/devDehydratorPlan/list', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorPlan/add', data });
};
// 编辑
export const edit = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorPlan/edit', data });
};
// 发布
export const publish = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorPlan/publish', data }, { joinParamsToUrl: true });
};
// 删除
export const del = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorPlan/delete', data }, { joinParamsToUrl: true });
};
// 批量删除
export const batchDel = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorPlan/deleteBatch', data }, { joinParamsToUrl: true });
};
// 详情
export const detail = (params) => {
  return defHttp.get({ url: '/dev/devDehydratorPlan/queryById', params });
};
// 点检记录列表
export const recordList = (params) => {
  return defHttp.get({ url: '/dev/devDehydratorTask/list', params });
};
// 保存点检记录
export const saveRecord = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorTask/saveItem', data });
};
// 提交点检记录
export const submitRecord = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorTask/submitTaskApp', data });
};
// 点检记录详情
export const recordDetail = (params) => {
  return defHttp.get({ url: '/dev/devDehydratorTask/queryById', params });
};
// 统计检查情况、检查完成率
export const statisticsTask = (params) => {
  return defHttp.get({ url: '/dev/devDehydratorTask/statisticsTask', params });
};
// 各事业部检查完成率对比
export const statisticsBusinessDepart = (params) => {
  return defHttp.get({ url: '/dev/devDehydratorTask/statisticsBusinessDepart', params });
};
// 合并
export const merge = (data) => {
  return defHttp.post({ url: '/dev/devDehydratorPlan/merge', data });
};
