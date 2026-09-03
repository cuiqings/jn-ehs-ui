import { defHttp } from '/@/utils/http/axios';

enum Api {
  getDangerousData = '/workStatistics/getDangerousData',
  getDangerousDesc = '/workStatistics/getDangerousDesc',
  getRiskWorkData = '/workStatistics/getRiskWorkData',
  getRiskWorkList = '/workStatistics/getRiskWorkList',
  getDangerousDataNum = '/workStatistics/getDangerousDataNum',
  getWorkTypeData = '/workStatistics/getWorkTypeData',
  getWorkStatusData = '/workStatistics/getWorkStatusData',
  getRiskWorkListExport = '/workStatistics/getRiskWorkListExport',
  exportDescData = '/workStatistics/exportDescData',
}
enum unApi {
  getDangerousData = '/workFgwStatistics/getDangerousData',
  getDangerousDesc = '/workFgwStatistics/getDangerousDesc',
  getRiskWorkData = '/workFgwStatistics/getRiskWorkData',
  getRiskWorkList = '/workFgwStatistics/getRiskWorkList',
  getDangerousDataNum = '/workFgwStatistics/getDangerousDataNum',
  getWorkStatusData = '/workFgwStatistics/getWorkStatusData',
  getRiskWorkListExport = '/workFgwStatistics/getRiskWorkListExport',
  exportUnDescData = '/workFgwStatistics/exportDescData',
  getAppWorkStatusCount = '/workFgwStatistics/getAppWorkStatusCount',
  getAppWorkList = '/workFgwStatistics/getAppWorkList',
}
/**
 * 获取部门树列表
 */
export const getDangerousData = (params) => {
  return defHttp.get({ url: Api.getDangerousData, params });
};
export const getDangerousDesc = (params) => {
  return defHttp.get({ url: Api.getDangerousDesc, params });
};

export const getRiskWorkData = (params) => defHttp.get({ url: Api.getRiskWorkData, params });

export const getRiskWorkList = (params) => defHttp.get({ url: Api.getRiskWorkList, params });

export const getDangerousDataNum = (params) => defHttp.get({ url: Api.getDangerousDataNum, params });

export const getWorkTypeData = (params) => defHttp.get({ url: Api.getWorkTypeData, params });

export const getWorkStatusData = (params) => defHttp.get({ url: Api.getWorkStatusData, params });

export const getRiskWorkListExport = (params) => defHttp.get({ url: Api.getRiskWorkListExport, params });

export const exportDescData = (params) => defHttp.get({ url: Api.exportDescData, params });
/**
 * 非高危
 */
export const getDangerousDataUn = (params) => {
  return defHttp.get({ url: unApi.getDangerousData, params });
};export const getDangerousDescUn = (params) => {
  return defHttp.get({ url: unApi.getDangerousDesc, params });
};

export const getRiskWorkDataUn = (params) => defHttp.get({ url: unApi.getRiskWorkData, params });

export const getRiskWorkListUn = (params) => defHttp.get({ url: unApi.getRiskWorkList, params });

export const getDangerousDataNumUn = (params) => defHttp.get({ url: unApi.getDangerousDataNum, params });

export const getWorkStatusDataUn = (params) => defHttp.get({ url: unApi.getWorkStatusData, params });

export const getUnRiskWorkListExport = (params) => defHttp.get({ url: unApi.getRiskWorkListExport, params });

export const exportUnDescData = (params) => defHttp.get({ url: unApi.exportUnDescData, params });

export const getAppWorkStatusCount = (params) => defHttp.get({ url: unApi.getAppWorkStatusCount, params });

export const getAppWorkList = (params) => defHttp.get({ url: unApi.getAppWorkList, params });
