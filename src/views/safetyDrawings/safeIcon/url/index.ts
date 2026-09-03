import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskSign/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/riskControl/jnRiskSign/delete', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskSign/saveOrUpdate', data });
};
