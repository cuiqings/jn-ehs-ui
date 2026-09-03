import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jnClearMaintenanceRecord/clearProjectStatusPageList',
  abnormalList = '/jnClearMaintenancePlan/abnormalSituationReminder',
  enterAbnormal = '/jnClearMaintenancePlan/reminder',
  planExecution = '/jnClearMaintenanceRecord/planExecution',
  completionStatus = '/jnClearMaintenanceRecord/completionStatus',
  abnormalNumber = '/jnClearMaintenanceRecord/abnormalNumber',
  clearProjectStatus = '/jnClearMaintenanceRecord/clearProjectStatus',
  abnormalOperationStatistics = '/jnClearMaintenancePlan/abnormalOperationStatistics',
  exportXls = '/jnClearMaintenanceRecord/exportXlsStatistics',
  exportXlsRecord = '/jnClearMaintenanceRecord/exportXlsStatisticsDetails',
  getOrganizationNew = '/jn/common/getOrganizationNew',
  statistics8 = '/yh/skYhStatistics/statistics8',
  statistics9 = '/yh/skYhStatistics/statistics9',
  statistics10 = '/yh/skYhStatistics/statistics10',
}

// 获取部门
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.getOrganizationNew });
};

// 导出单条
export const exportXlsRecord = (params) => {
  return defHttp.get(
    {
      url: Api.exportXlsRecord,
      params,
      responseType: 'blob',
    },
    { isTransformResponse: false }
  );
};

// 清理维护计划-异常情况提醒
export const abnormalList = (params) => {
  return defHttp.get({ url: Api.abnormalList, params });
};

// 清理维护计划-一键提醒
export const enterAbnormal = (params) => {
  return defHttp.post({ url: Api.enterAbnormal, params });
};
// 清理维护记录-计划执行情况
export const planExecution = (params) => {
  return defHttp.get({ url: Api.planExecution, params });
};
// 清理维护记录-各工序完成情况
export const completionStatus = (params) => {
  return defHttp.get({ url: Api.completionStatus, params });
};
// 清理维护记录-各工序异常次数
export const abnormalNumber = (params) => {
  return defHttp.get({ url: Api.abnormalNumber, params });
};
// 清理维护记录-清理项目执行情况
export const clearProjectStatus = (params) => {
  return defHttp.get({ url: Api.clearProjectStatus, params });
};
// 清理维护计划-异常操作统计
export const abnormalOperationStatistics = (params) => {
  return defHttp.get({ url: Api.abnormalOperationStatistics, params });
};

/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;

/**
 * 查询租户列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
// 排查统计-巡检计划
export const statistics8 = (params) => {
  return defHttp.get({ url: Api.statistics8, params });
};
// 排查统计-各部门巡检计划完成情况
export const statistics9 = (params) => {
  return defHttp.get({ url: Api.statistics9, params });
};
// 排查统计-各类型计划完成率
export const statistics10 = (params) => {
  return defHttp.get({ url: Api.statistics10, params });
};
