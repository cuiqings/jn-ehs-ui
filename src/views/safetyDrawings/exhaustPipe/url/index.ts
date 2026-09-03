import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.delete({ url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/deleteBatch', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/saveOrUpdate', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/saveOrUpdate', data });
};
// 根据id查询
export const queryById = (params) => {
  return defHttp.get({ url: '/jnRiskExhaustPipe/jnRiskExhaustPipe/queryById', params });
};
//属地单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
