import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();


enum appApi {
  list = '/jnClearMaintenancePlan/list',
  detail = '/jnClearMaintenancePlan/queryById',
  entryDetail = '/jnClearEntry/queryById',
  update = '/jnClearMaintenancePlan/approve',
  executeList = '/jnClearMaintenancePlan/appList',
  executeDetail = '/jnClearMaintenancePlan/appQueryById',
  executeSave = '/jnClearMaintenanceRecord/add',
  executeSubmit = '/jnClearMaintenanceRecord/submit',
  executeRecord = '/jnClearMaintenanceRecord/execution',
  abnormalRecord = '/jnClearMaintenanceRecord/abnormal',
  abnormalEdit = '/jnClearMaintenanceRecord/abnormalEdit',
  recordDetail = '/jnClearMaintenanceRecord/queryById',
  clearProjectStatusList = '/jnClearMaintenanceRecord/clearProjectStatusList'
}

// 清理维护记录-app清理项目执行情况列表
export const clearProjectStatusList = (params) => {
  return defHttp.get({ url: appApi.clearProjectStatusList, params });
};

export const getList = (params) => {
  return defHttp.get({ url: appApi.list, params });
};

// 清理维护计划-通过id查询
export const getDetail = (params) => {
  return defHttp.get({ url: appApi.detail, params });
};
// 清理项目-通过id查询
export const getEntryDetail = (params) => {
  return defHttp.get({ url: appApi.entryDetail, params });
};

// 通过或不通过
export const postUpdate = (params) => {
  return defHttp.post({ url: appApi.update, params });
};

// 清理维护计划-app查询当前用户审批通过的计划
export const executeList = (params) => {
  return defHttp.get({ url: appApi.executeList, params });
};

// 清理维护计划-app通过id查询
export const executeDetail = (params) => {
  return defHttp.get({ url: appApi.executeDetail, params });
};

// 清理维护记录-App保存
export const executeSave = (params) => {
  return defHttp.post({ url: appApi.executeSave, params });
};

// 清理维护记录-App提交
export const executeSubmit = (params) => {
  return defHttp.post({ url: appApi.executeSubmit, params });
};

// 清理维护记录-app执行记录
export const executeRecord = (params) => {
  return defHttp.get({ url: appApi.executeRecord, params });
};

// 清理维护记录-app异常记录
export const abnormalRecord = (params) => {
  return defHttp.get({ url: appApi.abnormalRecord, params });
};

// 清理维护记录-app异常记录修改备注
export const abnormalEdit = (params) => {
  return defHttp.post({ url: appApi.abnormalEdit, params });
};

// 清理维护记录-通过id查询
export const recordDetail = (params) => {
  return defHttp.get({ url: appApi.recordDetail, params });
};