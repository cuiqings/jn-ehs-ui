import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/jysectionmanagement/upPreShift/list', params });
};
// 编辑
export const edit = (data) => {
  return defHttp.post({ url: '/jysectionmanagement/upPreShift/edit', data });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/jysectionmanagement/upPreShift/queryById', params });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 本次不召开
export const bzk = (data) => {
  return defHttp.post({ url: '/jysectionmanagement/upPreShift/bzk', data });
};
// 完成情况统计
export const statisticsCompleteStatus = (params) => {
  return defHttp.get({ url: '/jysectionmanagement/upPreShift/statisticsCompleteStatus', params });
};
