import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskBasePicture/list', params });
};
export const addOrEdit = (data) => {
  return defHttp.post({ url: '/riskControl/jnRiskBasePicture/add', data });
};
export const del = (params) => {
  return defHttp.delete({ url: `/riskControl/jnRiskBasePicture/delete?id=${params.id}` });
};
export const details = (params) => {
  return defHttp.get({ url: '/riskControl/jnRiskBasePicture/queryById', params });
};
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/riskControl/jnRiskBasePicture/getOrganizationNew' });
};
