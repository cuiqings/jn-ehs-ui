import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/yh/skYhSpecialTask/list',
  detail = '/yh/skYhPlanExecute/queryById',
  yhCountList = '/yh/skYhPlanExecute/getYhList',
  batchDeal = '/yh/skYhPlanExecute/changeHandler',
  transferDeal = '/yh/skYhPlanExecute/setEmpty',
  setEmpty = '/yh/skYhPlanExecute/setEmpty',
  taskSubmit = '/yh/skYhPlanExecute/submitTaskWeb',
  saveItemBatch = '/yh/skYhPlanExecute/saveItemBatch',
  exportXls = '/yh/skYhPlanExecute/exportXls',
  repairPlan = '/yh/skYhSpecialTask/getRepairPlan',
  uploadAttachments = '/yh/skYhSpecialTask/uploadAttachments',
  approveRepairPlan = '/yh/skYhSpecialTask/approveRepairPlan',
  repairPlanAndApproveLog = '/yh/skYhSpecialTask/getRepairPlanAndApproveLog',
  checkReport = '/yh/skYhSpecialTask/getCheeckReport',
  repairReport = '/yh/skYhSpecialTask/exportRepairReport',
  taskDetail = '/yh/skYhSpecialTask/queryById',
  exportExcel = '/yh/skYhSpecialTask/exportRepairPlan',
  getResultsByOrgName = '/yh/skYhSpecialTask/queryByOrg',
  saveWebItemsForSpecial = '/yh/skYhSpecialTask/submitTaskWeb',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 查询详情
 * @param params
 */
export const getDetail = (params) => defHttp.get({ url: Api.detail, params });
/**
 * 查询隐患数量
 * @param params
 */
export const getYhCountList = (params) => defHttp.get({ url: Api.yhCountList, params });
/**
 * 批量处理
 * @param params
 */
export const batchDeal = (params, handleSuccess) => {
  return defHttp.post({ url: Api.batchDeal, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 转办处理
 * @param params
 */
export const transferDeal = (params, handleSuccess) => {
  return defHttp.post({ url: Api.transferDeal, params }).then(() => {
    handleSuccess();
  });
}
/**
 * 设置为空
 * @param params
 */
export const setEmpty = (params, handleSuccess) => {
  return defHttp.post({ url: Api.setEmpty, params }).then(() => {
    handleSuccess();
  });
}
/**
 * 任务提交
 * @param params
 */
export const taskSubmit = (params) => {
  return defHttp.post({ url: Api.taskSubmit, params });
}
/**
 * 批量保存
 * @param params
 */
export const saveItemBatch = (params) => {
  return defHttp.post({ url: Api.saveItemBatch, params });
}
export const getRepairPlan = (params) => {
  return defHttp.get({ url: Api.repairPlan, params });
}
/**
 * 上传影像资料
 * @param params
 */
export const uploadAttachments = (params) => {
  return defHttp.post({ url: Api.uploadAttachments, params });
}
/**
 * 审批维修计划
 * @param params
 */
export const approveRepairPlan = (params) => {
  return defHttp.post({ url: Api.approveRepairPlan, params });
}
/**
 * 获取维修计划和审批日志
 * @param params
 */
export const getRepairPlanAndApproveLog = (params) => {
  return defHttp.get({ url: Api.repairPlanAndApproveLog, params });
}
/**
 * 获取检查报告
 * @param params
 */
export const getCheckReport = (params) => {
  return defHttp.get({ url: Api.checkReport, params, responseType: 'blob' }, { isReturnNativeResponse: true });
}
/**
 * 获取整改报告
 * @param params
 */
export const getRepairReport = (params) => {
  return defHttp.get({ url: Api.repairReport, params, responseType: 'blob' }, { isReturnNativeResponse: true });
}
export const getTaskDetail = (params) => {
  return defHttp.get({ url: Api.taskDetail, params });
}
export const exportExcel = (params) => {
  return defHttp.get({ url: Api.exportExcel, params, responseType: 'blob' }, { isReturnNativeResponse: true });
}
/**
 * 根据组织名称查询检查记录
 * @param params
 */
export const getResultsByOrgName = (params) => {
  return defHttp.get({ url: Api.getResultsByOrgName, params });
}
/**
 * 保存专项检查任务执行记录
 * @param params
 */
export const saveWebItemsForSpecial = (params) => {
  return defHttp.post({ url: Api.saveWebItemsForSpecial, params });
}