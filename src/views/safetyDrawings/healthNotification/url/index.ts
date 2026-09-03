import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskHealthNotify/list', params });
};
//安全标志列表
export const signList = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskSign/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/riskControl/jnRiskHealthNotify/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.delete({ url: '/riskControl/jnRiskHealthNotify/deleteBatch', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskHealthNotify/saveOrUpdate', data });
};
// 通过id查询
export const queryById = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskHealthNotify/queryById', params });
};
// 导入模板下载
export const template = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskSpace/template', data });
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
  return defHttp.post({ url: '/riskControl/jnRiskHealthNotify/saveOrUpdate', data });
};
// 公司名称下拉
export const getDetailList = () => {
  return defHttp.get({ url: '/stakeholderManagement/jnStakeBusinessesList/getDetailList' });
};
// 成绩录入
export const scoreEntry = (data) => {
  return defHttp.post({ url: '/stakeholderManagement/jnStakePersonList/scoreEntry', data });
};
// 属地单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 责任人
export const getPersonList = (data) => {
  return defHttp.get({ url: '/jn/common/getUser', params: data });
}
