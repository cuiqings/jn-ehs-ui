import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/xgf/xgfCompany/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/xgf/xgfCompany/delete', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/xgf/xgfCompany/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/xgf/xgfCompany/edit', data });
};
// 加入黑名单
export const addBlack = (data) => {
  return defHttp.post({ url: '/xgf/xgfCompany/addBlack', data });
};
// 考核
export const examine = (data) => {
  return defHttp.post({ url: '/xgf/xgfCompany/examine', data });
};
// 考核记录
export const getExamineLog = (params) => {
  return defHttp.get({ url: '/xgf/xgfCompany/getExamineLog', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 查询企业下的人员列表
export const getPersonList = (params) => {
  return defHttp.get({ url: '/xgf/xgfCompany/getPersonList', params });
};
// 变更负责人
export const changeManager = (params) => {
  return defHttp.get({ url: '/xgf/xgfCompany/changeManager', params });
};
