import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/ai/home/getList', params });
};
// 左侧
export const getCameraTypeList = (params) => {
  return defHttp.get({ url: '/ai/home/getCameraTypeList', params });
};
// 所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 查看
export const details = (params) => {
  return defHttp.get({ url: '/ai/home/getHistory', params });
};
// 曲线图
export const viewChart = (params) => {
  return defHttp.get({ url: '/ai/home/viewChart', params });
};
