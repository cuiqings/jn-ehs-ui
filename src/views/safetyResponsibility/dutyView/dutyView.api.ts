import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/performDutiesView/listPage',
  exportBatch = '/performDutiesView/batchExport',
  export = '/performDutiesView/export',
  detail = '/performDutiesAudit/info',
}

/**
 * 分页查询列表
 * @param params 查询参数
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 导出
 */
export const getExportUrl = Api.exportBatch;
export const getSingleExport = Api.export;

/**
 * 详情查询
 * @param params 查询参数
 */
export const getDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
};
