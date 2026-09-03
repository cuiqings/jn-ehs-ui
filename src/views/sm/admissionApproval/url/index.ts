import { defHttp } from '/@/utils/http/axios';
// 列表
export const approvallist = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/approvallist', params });
};
// 待作业列表
export const waitWorklist = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/waitWorklist', params });
};
// 施工作业中列表
export const workinglist = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/workinglist', params });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/xgf/xgfEnter/queryById', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 入场申请审批
export const handle = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnter/handle', data });
};
// 人员变更审批
export const changeHandle = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnterChange/handle', data });
};
// 作业许可证发放
export const certificate = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnter/certificate', data });
};
// 监测评价
export const evaluate = (data) => {
  return defHttp.post({ url: '/xgf/xgfEnter/evaluate', data });
};
