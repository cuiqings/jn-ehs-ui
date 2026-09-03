import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/list', params });
};
// 承包单位下拉
export const getDetailList = () => {
  return defHttp.get({ url: '/xgf/xgfCompany/getAll' });
};
// 根据承包单位查人
export const getUser = (params) => {
  return defHttp.get({ url: '/jn/common/getUser', params });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const batchDel = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/deleteBatch', params }, { joinParamsToUrl: true });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/queryById', params });
};
// 查询发包单位/主管部门下的对应角色
export const getUserListByOrgAndRole = (params) => {
  return defHttp.get({ url: '/jn/common/getUserListByOrgAndRole', params });
};
// 查询对应角色
export const getUserListByRole = (params) => {
  return defHttp.get({ url: '/jn/common/getUserListByRole', params });
};
// 项目列表
export const getListByCurrent = () => {
  return defHttp.get({ url: '/xgf/xgfEnter/getListByCurrent' });
};
// 入场申请下一步||第一步保存
export const merge = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnter/merge', data });
};
// 入场申请第二步保存或提交
export const submitFlow = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnter/submitFlow', data });
};
// 人员变更下一步||第一步保存
export const changeMerge = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnterChange/merge', data });
};
// 人员变更第二步保存或提交
export const changeSubmitFlow = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnterChange/submitFlow', data });
};
// 根据orgCode查询所属机构或车间下的用户
export const getAllUserByOrg = (params) => {
  return defHttp.get({ url: '/jn/common/getAllUserByOrg', params });
};
// 查询3级
export const getDepart3List = (params) => defHttp.get({ url: '/jn/common/getDepart3List', params });
// 查询相关方人员
export const xgfList = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/list2', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 查询所有三级单位
export const get3List = () => {
  return defHttp.get({ url: '/sys/common/getDepart3List' });
};
