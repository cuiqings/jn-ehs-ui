import { defHttp } from '/@/utils/http/axios';
enum Api {
  // 安全措施
  securityAdd = '/settingSecurityJn/add',
  securityList = '/settingSecurityJn/list',
  securityDel = '/settingSecurityJn/del',
  securityEdit = '/settingSecurityJn/edit',
  queryByPost = '/settingSecurityJn/queryByPost',
}
// 添加安全措施
export const securityAdd = (params) => {
  return defHttp.post({ url: Api.securityAdd, params });
};
export const securityList = (params) => {
  return defHttp.get({ url: Api.securityList, params });
};
export const securityDel = (params) => {
  return defHttp.get({ url: Api.securityDel, params });
};
export const securityEdit = (params) => {
  return defHttp.post({ url: Api.securityEdit, params });
};
export const queryByPost = (params) => {
  return defHttp.get({ url: Api.queryByPost, params });
};
