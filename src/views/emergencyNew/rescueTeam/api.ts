import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/yjRescueTeamMain/queryBySysOrgCode', params });
};
export const addOrEdit = (data, isUpdate = false) => {
  return defHttp.post({ url: isUpdate ? '/yjRescueTeamMain/edit' : '/yjRescueTeamMain/add', data });
};
export const del = (params) => {
  return defHttp.get({ url: '/yjRescueTeamMain/delete', params }, { joinParamsToUrl: true });
};
// 集团列表
export const listJt = () => {
  return defHttp.get({ url: '/yjRescueTeamMain/queryCompany' });
};
// 集团新增
export const addCompany = (data) => {
  return defHttp.post({ url: '/yjRescueTeamMain/addCompany', data });
};
