import { defHttp } from '/@/utils/http/axios';

enum Api {
  getAbnormalAlarm = '/safety/screen/abnormalAlarm',
  getHazardInvestigation = '/safety/screen/hazardInvestigation',
  getHazardRectification = '/safety/screen/hazardRectification',
  getWeather = '/safety/screen/getWeather',
  getHazardRectificationChart = '/safety/screen/hazardRectificationChart',
  getInspectionChart = '/safety/screen/inspectionChart',
  getVisibilityGraph = '/safety/screen/visibilityGraph',
  list = '/pollutionDischarge/jnScreenPageSetup/list',
  getUserList = '/jnEnvironmentalLeaders/list',
  leadersAdd = '/jnEnvironmentalLeaders/add',
  leadersDel = '/jnEnvironmentalLeaders/delete',
  getDepartTree = '/jn/common/getLevelThreeDepartTreeBySecurity',
  getWeatherApi = '/notice/ehsNoticeInfo/weather',
  getNoticeApi = '/notice/ehsNoticeInfo/maintenance',
  getProgressApi = '/eia/ehsEiaInfo/status',

  getPageList = '/space/page/list',
  getDeviceConfiguration = '/deviceConfiguration/getAssembly',
  getRecordList = '/warn/record/list',
  getCountStats = '/warn/record/countStats',
  getWarnLevelStats = '/warn/record/warnLevelStats',
  getWarnDetail = '/warn/record/getWarnDetailById',
}

export const getWeatherApi = (params) => {
  return defHttp.get({ url: Api.getWeatherApi, params });
};
export const getNoticeApi = (params) => {
  return defHttp.get({ url: Api.getNoticeApi, params });
};
export const getProgressApi = (params) => {
  return defHttp.get({ url: Api.getProgressApi, params });
};

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

export const getDepartTree = (params) => {
  return defHttp.get({ url: Api.getDepartTree, params });
};

export const getUserList = (params) => {
  return defHttp.get({ url: Api.getUserList, params });
};
/**
 * 保存
 * @param params
 */
export const leadersAdd = (params) => {
  return defHttp.post({ url: Api.leadersAdd, params });
};

/**
 * 删除
 * @param params
 */
export const leadersDel = (params) => {
  return defHttp.delete({ url: Api.leadersDel, data: params }, { joinParamsToUrl: true })
};

//24小时异常报警
export const GetAbnormalAlarm = (params) => defHttp.get({ url: Api.getAbnormalAlarm, params }, { isTransformResponse: false });

//天气
export const GetWeather = (params) => defHttp.get({ url: Api.getWeather, params });

// //隐患排查治理TOP5
// export const GetHazardInvestigation = (params) => defHttp.get({ url: Api.getHazardInvestigation, params });

export const GetHazardInvestigation = (params) => {
  return defHttp.get({ url: Api.getHazardInvestigation, params });
};

//隐患整改TOP5
export const GetHazardRectification = (params) => defHttp.get({ url: Api.getHazardRectification, params }, { isTransformResponse: false });

//隐患整改图表
export const GetHazardRectificationChart = (params) => defHttp.get({ url: Api.getHazardRectificationChart, params }, { isTransformResponse: false });

//巡检率图表
export const GetInspectionChart = (params) => defHttp.get({ url: Api.getInspectionChart, params }, { isTransformResponse: false });

//巡检率图表
export const GetVisibilityGraph = (params) => defHttp.get({ url: Api.getVisibilityGraph, params }, { isTransformResponse: false });

export const getPageList = (params) => {
  return defHttp.get({ url: Api.getPageList, params });
};
export const getDeviceConfiguration = (params) => {
  return defHttp.get({ url: Api.getDeviceConfiguration, params });
}
export const getRecordList = (params) => {
  return defHttp.get({ url: Api.getRecordList, params });
}
export const getCountStats = (params) => {
  return defHttp.get({ url: Api.getCountStats, params });
}
export const getWarnLevelStats = (params) => {
  return defHttp.get({ url: Api.getWarnLevelStats, params });
}
export const getWarnDetail = (params) => {
  return defHttp.get({ url: `${Api.getWarnDetail}?id=${params.id}` });
}
