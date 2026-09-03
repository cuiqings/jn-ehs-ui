import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskSpace/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/riskControl/jnRiskSpace/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.delete({ url: '/riskControl/jnRiskSpace/deleteBatch', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskSpace/saveOrUpdate', data });
};
// 有限空间台账-通过id查询
export const queryById = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskSpace/queryById', params });
};
// 导入模板
export const template = (data) => {
  return defHttp.get({ url: '/riskControl/jnRiskSpace/template', data });
};
// 导入
export const importExcel = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskSpace/importExcel', data });
};
// 导出
export const exportXls = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskSpace/exportXls', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskSpace/saveOrUpdate', data });
};
// 属地单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 责任人
export const getPersonList = (data) => {
  return defHttp.get({ url: '/jn/common/getUser', params: data });
}
