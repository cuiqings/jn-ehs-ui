import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskFireEquipment/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/riskControl/jnRiskFireEquipment/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.delete({ url: '/riskControl/jnRiskFireEquipment/deleteBatch', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskFireEquipment/add', data });
};
// 通过id查询
export const queryById = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskFireEquipment/queryById', params });
};
// 导入模板下载
export const template = (data) => {
  return defHttp.get({ url: '/riskControl/jnRiskFireEquipment/template', data });
};
// 导入
export const importExcel = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskFireEquipment/importExcel', data });
};
// 导出
export const exportXls = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskFireEquipment/exportXls', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskFireEquipment/edit', data });
};
// 检验
export const check = (data, id) => {
  return defHttp.post({ url: `/riskControl/jnRiskFireEquipment/saveCheckDate?id=${id}`, data });
};
// 批量检验2
export const checkBatch = (data, ids) => {
  const idsString = Array.isArray(ids) ? ids.join(',') : ids; // 将数组转换为逗号分隔的字符串
  console.log('idsString:', idsString);
  return defHttp.post({ url: `/riskControl/jnRiskFireEquipment/saveBatchCheckDate?ids=${idsString}`, data });
};

// 责任单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 责任人
export const getPersonList = (data) => {
  return defHttp.get({ url: '/jn/common/getUser', params: data });
}
