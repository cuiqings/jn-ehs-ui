import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/JnRiskControl/jnRiskSpecialManagement/list', params });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/JnRiskControl/jnRiskSpecialManagement/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.delete({ url: '/JnRiskControl/jnRiskSpecialManagement/deleteBatch', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/JnRiskControl/jnRiskSpecialManagement/add', data });
};
// 通过id查询
export const queryById = (params) => {
  return defHttp.get({ url: '/JnRiskControl/jnRiskSpecialManagement/queryById', params });
};
// 导入模板
export const template = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskFireEquipment/template', data });
};
// 导入
export const importExcel = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskSpace/importExcel', data });
};
// 导出
export const exportXls = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskFireEquipment/exportXls', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/JnRiskControl/jnRiskSpecialManagement/edit', data });
};
// 检验
export const check = (data, id) => {
  return defHttp.post({ url: `/JnRiskControl/jnRiskSpecialManagement/saveCheckDate?id=${id}`, data });
};
// 批量检验
export const checkBatch = (data, ids) => {
  const idsString = Array.isArray(ids) ? ids.join(',') : ids; // 将数组转换为逗号分隔的字符串
  console.log('idsString:', idsString);
  return defHttp.post({ url: `/JnRiskControl/jnRiskSpecialManagement/saveBatchCheckDate?ids=${idsString}`, data });
};
// 安全阀校验
export const reliefCheck = (data, id) => {
  return defHttp.post({
    url: data
      ? `/JnRiskControl/jnRiskSpecialManagement/saveReliefDate?id=${id}&date=${data}`
      : `/JnRiskControl/jnRiskSpecialManagement/saveReliefDate?id=${id}`,
  });
};
//使用单位
export const getUseOrganization = () => {
  return defHttp.get({ url: '/jn/common/getDepartTreeBy23' });
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
};
