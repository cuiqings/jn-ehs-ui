import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/rk/skRkApply/getControlPage', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 辨识单元
export const getListAll = (params) => {
  return defHttp.get({ url: '/rk/skRkRecog/getList', params });
};
// 统计
export const statistics = (params) => {
  return defHttp.get({ url: '/rk/skRkApply/getNumber', params });
};
// 专业评审
export const submitReview = (data) => {
  return defHttp.post({ url: '/rk/skRkApply/submitReview', data });
};
// 提交审核
export const submitAudit = (data) => {
  return defHttp.post({ url: '/rk/skRkApply/submitAudit', data });
};
