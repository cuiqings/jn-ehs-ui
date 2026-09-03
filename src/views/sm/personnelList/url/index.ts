import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/delete', params }, { joinParamsToUrl: true });
};
export const deleteBatch = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/deleteBatch', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/edit', data });
};
// 公司名称下拉
export const getDetailList = () => {
  return defHttp.get({ url: '/xgf/xgfCompany/getAll' });
};
// 加入黑名单
export const addBlack = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/addBlack', data });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/queryById', params });
};
// 离场
export const out = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/out', data });
};
// 资质状态统计数量
export const aptitudeStatistics = () => {
  return defHttp.get({ url: '/xgf/xgfPerson/aptitudeStatistics' });
};
// 考核
export const examine = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/examine', data });
};
// 考核记录
export const getExamineLog = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/getExamineLog', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 冻结/解冻
export const updateStatus = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/updateStatus', data });
};
