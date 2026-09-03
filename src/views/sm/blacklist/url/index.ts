import { defHttp } from '/@/utils/http/axios';
// 企业列表
export const enterpriseList = (params) => {
  return defHttp.get({ url: '/xgf/xgfCompany/list', params });
};
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 企业删除
export const del = (params) => {
  return defHttp.get({ url: '/xgf/xgfCompany/delete', params }, { joinParamsToUrl: true });
};
// 企业黑名单操作
export const addBlack = (data) => {
  return defHttp.post({ url: '/xgf/xgfCompany/addBlack', data });
};
// 人员列表
export const list = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/list', params });
};
// 人员删除
export const delPerson = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/delete', params }, { joinParamsToUrl: true });
};
// 人员黑名单操作
export const addBlackPerson = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/addBlack', data });
};
// 查询指定车间人的隐患
export const getByTeamDutyPerson = (params) => {
  return defHttp.get({ url: '/yh/skYhConfirm/getByTeamDutyPerson', params });
};
// 获取企业列表和人员列表的黑名单数量
export const getBlackNumber = () => {
  return defHttp.get({ url: '/xgf/xgfPerson/getBlackNumber' });
};
