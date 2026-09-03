import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/taskManagement/jnPublish/list',
  save = '/taskManagement/jnPublish/publish',
  detail = '/taskManagement/jnPublish/queryById',
  delete = '/taskManagement/jnPublish/delete',
  deleteBatch = '/taskManagement/jnPublish/deleteBatch',
  endTask = '/taskManagement/jnPublish/close',
  exportXls = '/taskManagement/jnPublish/exportXls',
  applyExtension = '/taskManagement/jnPublish/delay',
  workRequiredDetail = '/taskManagement/jnPublishRecord/getDetail',
  historyDetail = '/taskManagement/jnPublishRecord/getCycleProcess',
}

/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

// 通过id查询
export const getDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
};
// 通过id查询工作要求
export const getWorkRequiredDetail = (params) => {
  return defHttp.get({ url: Api.workRequiredDetail, params });
};
// 通过id查询历史记录
export const getHistoryDetail = (params) => {
  return defHttp.get({ url: Api.historyDetail, params });
};

/**
 * 任务发布
 * @param params
 */
export const publish = (params) => {
  return defHttp.post({ url: Api.save, params });
};

/**
 * 删除
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
// 关闭任务

export const endTask = (params) => defHttp.post({ url: Api.endTask, params: params });

/**
 * 批量删除
 * @param params
 */
export const batchDeleteRecord = (params) => defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true });
// 申请延期
export const applyExtension = (params) => defHttp.post({ url: Api.applyExtension, params: params });

