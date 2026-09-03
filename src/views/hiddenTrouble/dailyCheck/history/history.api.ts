import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/yh/skYhPlanExecute/list',
  detail = '/yh/skYhPlanExecute/queryById',
  yhCountList = '/yh/skYhPlanExecute/getYhList',
  batchDeal = '/yh/skYhPlanExecute/changeHandler',
  transferDeal = '/yh/skYhPlanExecute/setEmpty',
  setEmpty = '/yh/skYhPlanExecute/setEmpty',
  taskSubmit = '/yh/skYhPlanExecute/submitTaskWeb',
  saveItemBatch = '/yh/skYhPlanExecute/saveItemBatch',
  exportXls = '/yh/skYhPlanExecute/exportXls',
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
