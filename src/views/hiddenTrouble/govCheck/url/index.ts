import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/govcheck/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/govcheck/delete', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/govcheck/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/govcheck/edit', data });
};
// 下载
export const download = (params) => {
  return defHttp.get({ url: '/govcheck/download', params, responseType: 'blob' }, { isTransformResponse: false });
};
