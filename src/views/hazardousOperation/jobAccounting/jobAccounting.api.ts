import { defHttp } from '/@/utils/http/axios';

enum Api {
  getApplicantData = '/workStatistics/getApplicantData', // 申请单位
  getTypeAndStateData = '/workStatistics/getTypeAndStateData', // 类型与状态
  getFinishData = '/workStatistics/getFinishData', // 完工验收
  workStatisticsListData = '/workStatistics/getListData',
  getOrgInfo = '/jn/common/getOrgInfo',
  getOrganizationNew = '/jn/common/getOrganizationNew',
  getDepart3List = '/jn/common/getDepart3List',
  getOrgStateData = '/workStatistics/getOrgStateData',

  getDangerousData = '/workStatistics/getDangerousData',
}
/**
 * 获取部门树列表
 */
export const getApplicantData = () => defHttp.get({ url: Api.getApplicantData });

export const getTypeAndStateData = (params?) => defHttp.get({ url: Api.getTypeAndStateData, params });

export const getFinishData = (params?) => defHttp.get({ url: Api.getFinishData, params });
export const workStatisticsListData = (params) => {
  return defHttp.get({ url: Api.workStatisticsListData, params });
};

export const getOrgInfo = (params) => {
  return defHttp.get({ url: Api.getOrgInfo, params });
};

export const getOrganizationNew = (params) => {
  return defHttp.get({ url: Api.getOrganizationNew, params });
};

export const getDepart3List = (params) => {
  return defHttp.get({ url: Api.getDepart3List, params });
};

export const getOrgStateData = (params) => {
  return defHttp.get({ url: Api.getOrgStateData, params });
};
export const getDangerousData = (params) => {
  return defHttp.get({ url: Api.getDangerousData, params });
};
