import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/jysectionmanagement/upPreShiftConfig/list', params });
};
export const add = (data) => {
  return defHttp.post({ url: '/jysectionmanagement/upPreShiftConfig/add', data });
};
export const edit = (data) => {
  return defHttp.post({ url: '/jysectionmanagement/upPreShiftConfig/edit', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/jysectionmanagement/upPreShiftConfig/delete', params }, { joinParamsToUrl: true });
};
export const batchDel = (params) => {
  return defHttp.get({ url: '/jysectionmanagement/upPreShiftConfig/deleteBatch', params }, { joinParamsToUrl: true });
};
