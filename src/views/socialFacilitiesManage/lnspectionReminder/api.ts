import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/dev/devRemind/list', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/dev/devRemind/add', data });
};
// 编辑
export const edit = (data) => {
  return defHttp.post({ url: '/dev/devRemind/edit', data });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/dev/devRemind/delete', params });
};
// 批量删除
export const batchDel = (params) => {
  return defHttp.get({ url: '/dev/devRemind/deleteBatch', params });
};
// 详情
export const detail = (params) => {
  return defHttp.get({ url: '/dev/devRemind/queryById', params });
};
