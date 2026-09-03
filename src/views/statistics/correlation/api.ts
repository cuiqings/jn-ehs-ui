import { defHttp } from '/@/utils/http/axios';
// 所属单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 公司名称下拉
export const getDetailList = () => {
  return defHttp.get({ url: '/xgf/xgfCompany/getAll' });
};
export const statistics1 = (params?: any) => {
  return defHttp.get({ url: '/xgf/statistics/statistics1', params });
};
// 项目统计
export const statistics2 = (params?: any) => {
  return defHttp.get({ url: '/xgf/statistics/statistics2', params });
};
// 项目统计
export const statistics3 = (params?: any) => {
  return defHttp.get({ url: '/xgf/statistics/statistics3', params });
};
// 资质状态统计数量
export const aptitudeStatistics = (params?: any) => {
  return defHttp.get({ url: '/xgf/xgfPerson/aptitudeStatistics', params });
};

export const statistics4 = (params?: any) => {
  return defHttp.get({ url: '/xgf/statistics/statistics4', params });
};
